import { extractText, getDocumentProxy } from "unpdf";
import type { DBMessage } from "@/lib/db/schema";
import type { Attachment, ChatMessage } from "@/lib/types";

type ExtractPdfAttachmentsOptions = {
  extractTextFromUrl?: (url: string) => Promise<string>;
};

type ChatFilePart = Extract<ChatMessage["parts"][number], { type: "file" }> & {
  mediaType?: string;
  url?: string;
  name?: string;
  filename?: string;
};

async function extractPdfTextFromUrl(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  return text.replace(/\s+/g, " ").trim();
}

function getFilePartName(part: { name?: string; filename?: string }) {
  return part.filename ?? part.name ?? "未命名文件.pdf";
}

function isPdfFilePart(part: ChatMessage["parts"][number]): part is ChatFilePart {
  return (
    part.type === "file" &&
    "mediaType" in part &&
    part.mediaType === "application/pdf"
  );
}

export async function extractPdfAttachments(
  message: ChatMessage,
  options?: ExtractPdfAttachmentsOptions
): Promise<Attachment[]> {
  const attachments: Attachment[] = [];
  const extractTextFromUrl =
    options?.extractTextFromUrl ?? extractPdfTextFromUrl;

  for (const part of message.parts) {
    if (!isPdfFilePart(part) || !part.url) {
      continue;
    }

    const pdfText = await extractTextFromUrl(part.url);

    attachments.push({
      name: getFilePartName(part),
      url: part.url,
      contentType: part.mediaType,
      text: pdfText,
    });
  }

  return attachments;
}

export async function buildMessageForModel(
  message: ChatMessage,
  attachments: Attachment[]
): Promise<ChatMessage> {
  const parts: ChatMessage["parts"] = [];
  const pdfNames = new Set(attachments.map((attachment) => attachment.name));

  for (const attachment of attachments) {
    parts.push({
      type: "text",
      text: `用户上传了一个 PDF 文件：${attachment.name}`,
    });
  }

  for (const part of message.parts) {
    if (isPdfFilePart(part) && pdfNames.has(getFilePartName(part))) {
      continue;
    }

    parts.push(part);
  }

  return {
    ...message,
    parts,
  };
}

export function getPdfAttachmentsFromDb(messages: DBMessage[]): Attachment[] {
  return messages.flatMap((message) =>
    ((message.attachments as Attachment[]) ?? []).filter(
      (attachment) =>
        attachment.contentType === "application/pdf" &&
        typeof attachment.text === "string" &&
        attachment.text.trim()
    )
  );
}

export function buildPdfSystemContext(attachments: Attachment[]) {
  if (attachments.length === 0) {
    return "";
  }

  const pdfSections = attachments
    .map((attachment, index) =>
      [
        `[PDF_EXTRACT_${index + 1}_BEGIN]`,
        `文件名：${attachment.name}`,
        "以下为该 PDF 提取出的正文文本：",
        attachment.text ?? "",
        `[PDF_EXTRACT_${index + 1}_END]`,
      ].join("\n")
    )
    .join("\n\n");

  return [
    "下面开始是用户上传 PDF 提取出的资料文本，可作为理解用户背景、简历内容、项目经历、技能和教育经历的参考信息。",
    "当用户让你做简历优化、模拟面试、项目追问、亮点评价或相关问答时，可以结合这些资料作答；如果资料内容与用户当前最新输入冲突，以用户当前最新输入为准。",
    "你已经可以直接读取这些提取文本，不要声称自己无法访问 PDF、文件或附件。",
    "",
    pdfSections,
  ].join("\n");
}
