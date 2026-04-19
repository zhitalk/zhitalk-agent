import Image from "next/image";
import type { Attachment } from "@/lib/types";
import { Loader } from "./elements/loader";
import { CrossSmallIcon } from "./icons";
import { Button } from "./ui/button";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onRemove,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: () => void;
}) => {
  const { name, url, contentType } = attachment;
  const canOpenAttachment = !isUploading && Boolean(url);

  return (
    <div
      className="group relative size-16 overflow-hidden rounded-lg border bg-muted"
      data-testid="input-attachment-preview"
    >
      {contentType?.startsWith("image") ? (
        <Image
          alt={name ?? "An image attachment"}
          className="size-full object-cover"
          height={64}
          src={url}
          width={64}
        />
      ) : contentType?.includes("pdf") ? (
        <div
          aria-label="PDF attachment"
          className="flex items-center justify-center text-muted-foreground text-xs"
          style={{ width: 52, height: 52 }}
        >
          <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height={52}
            role="img"
            viewBox="0 0 64 64"
            width={52}
          >
            <title>PDF file</title>
            <path
              d="M18 8h20l12 12v36a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z"
              fill="#FFFFFF"
              stroke="#D4D4D8"
              strokeWidth="2"
            />
            <path
              d="M38 8v12h12"
              fill="#F4F4F5"
              stroke="#D4D4D8"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <rect x="18" y="34" width="28" height="12" rx="6" fill="#DC2626" />
            <path
              d="M24 42v-4h3.2c1.5 0 2.3.7 2.3 2s-.8 2-2.3 2H24Zm1.8-1.4h1.2c.6 0 1-.3 1-.6 0-.5-.4-.8-1-.8h-1.2v1.4Z"
              fill="#FFFFFF"
            />
            <path
              d="M31 42v-4h2.1c1.7 0 2.9.8 2.9 2s-1.2 2-2.9 2H31Zm1.8-1.3h.3c.9 0 1.4-.4 1.4-.9s-.5-.9-1.4-.9h-.3v1.8Z"
              fill="#FFFFFF"
            />
            <path
              d="M38 42v-4h4v1.2h-2.2v.4h2v1.1h-2V42H38Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
          File
        </div>
      )}

      {canOpenAttachment && (
        <a
          aria-label={`Open ${name}`}
          className="absolute inset-0 z-10"
          href={url}
          rel="noreferrer"
          target="_blank"
        />
      )}

      {isUploading && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/50"
          data-testid="input-attachment-loader"
        >
          <Loader size={16} />
        </div>
      )}

      {onRemove && !isUploading && (
        <Button
          className="absolute top-0.5 right-0.5 z-20 size-4 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={onRemove}
          size="sm"
          variant="destructive"
        >
          <CrossSmallIcon size={8} />
        </Button>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 truncate bg-linear-to-t from-black/80 to-transparent px-1 py-0.5 text-[10px] text-white">
        {name}
      </div>
    </div>
  );
};
