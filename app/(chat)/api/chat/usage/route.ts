import { auth, type UserType } from "@/app/(auth)/auth";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { getChatApiCallCountByUserId } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const userType: UserType = session.user.type;

    // Get API call count for the last 24 hours
    const used = await getChatApiCallCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    // Get max API calls based on user type
    const max = entitlementsByUserType[userType].maxChatApiCallsPerDay;

    return Response.json({ used, max });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error("Unhandled error in chat usage API:", error);
    return new ChatSDKError("offline:chat").toResponse();
  }
}

