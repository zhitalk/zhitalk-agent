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
          className="flex items-center justify-center text-muted-foreground text-xs"
          style={{ width: 52, height: 52 }}
          aria-label="PDF attachment"
        >
          {/* Inline SVG for a PDF icon with accessible title */}
          <svg
            width={52}
            height={52}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            focusable="false"
            role="img"
          >
            <title>PDF file</title>
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#E2E2E2" />
            <path
              d="M7.5 17V7H12c2.5 0 5.5.5 5.5 5s-3 5-5.5 5H7.5Zm3-8v6M7.5 11h8"
              stroke="#B91C1C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="12"
              y="18"
              textAnchor="middle"
              fontSize="6"
              fill="#B91C1C"
              aria-hidden="true"
            >
              PDF
            </text>
          </svg>
        </div>
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
          File
        </div>
      )}

      {isUploading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50"
          data-testid="input-attachment-loader"
        >
          <Loader size={16} />
        </div>
      )}

      {onRemove && !isUploading && (
        <Button
          className="absolute top-0.5 right-0.5 size-4 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={onRemove}
          size="sm"
          variant="destructive"
        >
          <CrossSmallIcon size={8} />
        </Button>
      )}

      <div className="absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-black/80 to-transparent px-1 py-0.5 text-[10px] text-white">
        {name}
      </div>
    </div>
  );
};
