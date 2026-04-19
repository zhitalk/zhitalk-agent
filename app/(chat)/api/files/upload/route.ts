import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";
import {
  getOssClient,
  MAX_UPLOAD_FILE_SIZE,
  replaceOssUrlWithCdn,
} from "@/lib/oss";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= MAX_UPLOAD_FILE_SIZE, {
      message: "File size should be less than 1MB",
    })
    .refine((file) => file.type === "application/pdf", {
      message: "Only PDF files are supported",
    }),
});

function buildPdfObjectKey(userId: string) {
  return `files/u-${userId}/pdfs/${uuidv4()}.pdf`;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const ossClient = getOssClient();

    if (!ossClient) {
      return NextResponse.json(
        { error: "OSS configuration is missing" },
        { status: 500 }
      );
    }

    const objectKey = buildPdfObjectKey(session.user.id);
    const fileBuffer = await file.arrayBuffer();

    try {
      const result = await ossClient.put(objectKey, Buffer.from(fileBuffer), {
        mime: file.type,
      });

      return NextResponse.json({
        url: replaceOssUrlWithCdn(result.url),
        pathname: objectKey,
        contentType: file.type,
      });
    } catch (_error) {
      return NextResponse.json({ error: "OSS upload failed" }, { status: 500 });
    }
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
