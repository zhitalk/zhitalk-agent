"use client";

import type { ComponentProps } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { ChatMessage } from "@/lib/types";
import { fetcher } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ContextIcon } from "./context";

export type ApiCallUsageProps = ComponentProps<"button"> & {
  /** Chat status from useChat hook, used to trigger data refresh */
  status?: UseChatHelpers<ChatMessage>["status"];
};

const PERCENT_MAX = 100;

type ApiUsageResponse = {
  used: number;
  max: number;
};

export const ApiCallUsage = ({
  className,
  status,
  ...props
}: ApiCallUsageProps) => {
  const { data: session } = useSession();
  const { mutate } = useSWRConfig();

  const { data, isLoading, error } = useSWR<ApiUsageResponse>(
    session?.user ? "/api/chat/usage" : null,
    fetcher
  );

  // Refresh data when status changes to "submitted"
  useEffect(() => {
    if (status === "submitted" && session?.user) {
      mutate("/api/chat/usage");
    }
  }, [status, mutate, session?.user]);

  const used = data?.used ?? 0;
  const max = data?.max ?? 0;
  const hasMax = typeof max === "number" && Number.isFinite(max) && max > 0;
  const usedPercent = hasMax ? Math.min(100, (used / max) * 100) : 0;

  // Don't render if no session or error loading
  if (!session?.user || error) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <button
        className={cn(
          "inline-flex select-none items-center gap-1 rounded-md text-sm",
          "cursor-pointer bg-background text-foreground",
          "outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        disabled
        type="button"
        {...props}
      >
        <ContextIcon percent={0} />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex select-none items-center gap-1 rounded-md text-sm",
            "cursor-pointer bg-background text-foreground",
            "outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
          type="button"
          {...props}
        >
          <span className="hidden font-medium text-muted-foreground">
            {usedPercent.toFixed(1)}%
          </span>
          <ContextIcon percent={usedPercent} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit p-3" side="top">
        <div className="min-w-[240px] space-y-2">
          <div className="flex items-start justify-between text-sm">
            <span>{usedPercent.toFixed(1)}%</span>
            <span className="text-muted-foreground">
              {hasMax ? `${used} / ${max} 次` : `${used} 次`}
            </span>
          </div>
          <div className="space-y-2">
            <Progress className="h-2 bg-muted" value={usedPercent} />
          </div>
          <div className="mt-1 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>已用次数</span>
              <span className="font-mono">{used}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>总次数</span>
              <span className="font-mono">{max}</span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

