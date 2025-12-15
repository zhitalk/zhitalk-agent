import { geolocation } from "@vercel/functions";
import { JsonToSseTransformStream } from "ai";
import { createResumableStreamContext } from "resumable-stream";
import { auth, type UserType } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/visibility-selector";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { createChatStream } from "@/lib/ai/agent";
import type { ChatModel } from "@/lib/ai/models";
import type { RequestHints } from "@/lib/ai/prompts";
import {
  createStreamId,
  deleteChatById,
  getChatApiCallCountByUserId,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  recordChatApiCall,
  saveChat,
  saveMessages,
  updateChatLastContextById,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 60;

let streamContext: ReturnType<typeof createResumableStreamContext> | null = null;

export function getStreamContext() {
  if (!streamContext) {
    streamContext = createResumableStreamContext({
      keyPrefix: "resumable-stream",
      waitUntil: null,
    });
  }
  return streamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel["id"];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const userType: UserType = session.user.type;

    // Check API call limit first
    const apiCallCount: number = await getChatApiCallCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    // @ts-ignore
    const maxApiCalls = entitlementsByUserType[userType].maxChatApiCallsPerDay;
    // console.log('apiCallCount => ', apiCallCount);
    if (apiCallCount >= maxApiCalls) {
      const errorMessage =
        userType === "guest"
          ? "您今天的聊天请求次数已用完（10次/天）。请明天再试，或注册账号获得更多次数（30次/天）。"
          : "您今天的聊天请求次数已用完（30次/天）。请明天再试。";
      return new ChatSDKError("rate_limit:chat_api", undefined, errorMessage).toResponse();
    }

    // Record this API call
    await recordChatApiCall({ userId: session.user.id });

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    // @ts-ignore
    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    const chat = await getChatById({ id });
    let messagesFromDb: DBMessage[] = [];

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
      // Only fetch messages if chat already exists
      messagesFromDb = await getMessagesByChatId({ id });
    } else {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
      // New chat - no need to fetch messages, it's empty
    }

    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = createChatStream({
      messages: uiMessages,
      selectedChatModel,
      requestHints,
      session: session!,
      onFinish: async ({ messages: finishedMessages, usage }) => {
        await saveMessages({
          messages: finishedMessages.map((currentMessage) => ({
            id: currentMessage.id,
            role: currentMessage.role,
            parts: currentMessage.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });

        if (usage) {
          try {
            await updateChatLastContextById({
              chatId: id,
              context: usage,
            });
          } catch (err) {
            console.warn("Unable to persist last usage for chat", id, err);
          }
        }
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    // Check for Vercel AI Gateway credit card error
    if (
      error instanceof Error &&
      error.message?.includes(
        "AI Gateway requires a valid credit card on file to service requests"
      )
    ) {
      return new ChatSDKError("bad_request:activate_gateway").toResponse();
    }

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
