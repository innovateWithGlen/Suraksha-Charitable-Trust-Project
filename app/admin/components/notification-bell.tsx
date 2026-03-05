"use client";

import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationItem = {
  id: string;
  type: "donation" | "inquiry";
  title: string;
  description: string;
  createdAt: string;
  targetUrl: string;
};

type NotificationResponse = {
  unreadCount: number;
  notifications: NotificationItem[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function NotificationBell() {
  const router = useRouter();
  const { data } = useSWR<NotificationResponse>("/api/notifications", fetcher, {
    refreshInterval: 5000,
  });

  const unreadCount = data?.unreadCount || 0;
  const notifications = data?.notifications || [];

  const handleClick = async (item: NotificationItem) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: item.type, id: item.id }),
    });

    await mutate("/api/notifications");
    router.push(item.targetUrl);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1">
              <Badge className="h-5 min-w-5 rounded-full px-1.5 text-[10px] leading-none bg-destructive text-destructive-foreground hover:bg-destructive">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </span>
          ) : null}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          notifications.map((item) => (
            <DropdownMenuItem
              key={`${item.type}-${item.id}`}
              className="flex flex-col items-start gap-1 whitespace-normal py-3"
              onClick={() => handleClick(item)}
            >
              <p className="text-sm font-medium leading-tight">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-tight">{item.description}</p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
