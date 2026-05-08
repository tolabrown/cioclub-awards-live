<script lang="ts">
  import type { iActivityLog } from "$lib/interface";
  import { formatDate } from "$lib/fxns";
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "$lib/components/ui/avatar";

  interface Props {
    log: iActivityLog;
    onclick?: () => void;
  }

  let { log, onclick }: Props = $props();

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
      case "UPDATE":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
      case "DELETE":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
      default:
        return "";
    }
  };

  const getUserName = (user: any) => {
    if (!user) return "System";
    return typeof user === "string" ? user : user.name || "Unknown";
  };

  const getUserImage = (user: any) => {
    if (!user || typeof user === "string") return null;
    return user.image || null;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelativeTime = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(past, "MMM DD");
  };
</script>

<button
  class="w-full text-left bg-card hover:bg-accent/50 active:bg-accent border rounded-lg p-4 transition-colors duration-200 touch-manipulation"
  {onclick}
  type="button"
>
  <div class="flex items-start gap-3">
    <!-- User Avatar -->
    <Avatar class="h-10 w-10 flex-shrink-0">
      <AvatarImage src={getUserImage(log.user)} alt={getUserName(log.user)} />
      <AvatarFallback class="text-xs">
        {getInitials(getUserName(log.user))}
      </AvatarFallback>
    </Avatar>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Header -->
      <div class="flex items-center justify-between gap-2 mb-1">
        <span class="font-medium text-sm truncate">
          {getUserName(log.user)}
        </span>
        <span class="text-xs text-muted-foreground whitespace-nowrap">
          {getRelativeTime(log.createdAt)}
        </span>
      </div>

      <!-- Action & Entity -->
      <div class="flex items-center gap-2 mb-2">
        <span
          class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}
        >
          {log.action}
        </span>
        <span class="text-sm text-muted-foreground truncate">
          {log.entity}
        </span>
      </div>

      <!-- Entity ID -->
      <div class="text-xs text-muted-foreground font-mono truncate">
        ID: {log.entityId}
      </div>

      <!-- Details Preview -->
      {#if log.details}
        <div class="text-xs text-muted-foreground mt-2 line-clamp-2">
          {log.details}
        </div>
      {/if}
    </div>
  </div>
</button>
