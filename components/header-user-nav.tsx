"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { guestRegex } from "@/lib/constants";
import { LoaderIcon } from "./icons";
import { toast } from "./toast";

export function HeaderUserNav() {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, resolvedTheme } = useTheme();

  const isGuest = guestRegex.test(data?.user?.email ?? "");

  // Base64 encoded user icons: dark for light mode, light for dark mode
  const userIconDark =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxYTFhMWEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==";
  const userIconLight =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmNWY1ZjUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==";
  const userIconSrc =
    resolvedTheme === "dark" ? userIconLight : userIconDark;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="size-6 animate-pulse rounded-full bg-zinc-500/30" />
        <div className="animate-spin text-zinc-500">
          <LoaderIcon />
        </div>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <Button asChild>
        <a href="/login">登录</a>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 h-9"
          data-testid="header-user-nav-button"
        >
          <Image
            alt={data.user.email ?? "User Avatar"}
            className="rounded-full"
            height={20}
            src={userIconSrc}
            width={20}
          />
          <span className="truncate max-w-[120px] text-sm" data-testid="header-user-email">
            {isGuest ? "Guest" : data.user.email}
          </span>
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56"
        data-testid="header-user-nav-menu"
      >
        <DropdownMenuItem
          className="cursor-pointer"
          data-testid="header-user-nav-item-theme"
          onSelect={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
        >
          {`切换至${resolvedTheme === "light" ? "深色" : "浅色"}模式`}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild data-testid="header-user-nav-item-auth">
          <button
            className="w-full cursor-pointer"
            onClick={() => {
              if (isGuest) {
                router.push("/login");
              } else {
                signOut({
                  redirectTo: "/",
                });
              }
            }}
            type="button"
          >
            {isGuest ? "登录账户" : "退出登录"}
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

