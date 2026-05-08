<script lang="ts">
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "$lib/components/ui/avatar";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { formatDistanceToNow } from "date-fns";
  import { Activity, User as UserIcon } from "@lucide/svelte";
  import type { iActivityLog } from "$lib/interface";

  interface Props {
    logs: iActivityLog[];
  }

  let { logs = [] }: Props =$props()

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getActionColor(action: string) {
    switch (action) {
      case "CREATE":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "UPDATE":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
      case "DELETE":
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
    }
  }

  function formatAction(action: string) {
    return action.charAt(0) + action.slice(1).toLowerCase();
  }
</script>

<Card
  class="col-span-1 lg:col-span-3 h-full flex flex-col shadow-sm border-border/50 bg-card/50 backdrop-blur-sm"
>
  <CardHeader>
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <CardTitle class="text-xl font-bold flex items-center gap-2">
          <Activity class="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest actions performed across the platform
        </CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent class="flex-1 p-0">
    <ScrollArea class="h-[400px] px-6 pb-6">
      {#if logs.length === 0}
        <div
          class="flex flex-col items-center justify-center h-full text-muted-foreground py-12"
        >
          <Activity class="h-12 w-12 mb-4 opacity-20" />
          <p>No recent activity found</p>
        </div>
      {:else}
        <div class="space-y-6">
          {#each logs as log}
            <div class="flex items-start gap-4 group">
              <Avatar
                class="h-9 w-9 mt-0.5 border-2 border-background shadow-sm"
              >
                <AvatarImage
                  src={typeof log.user === "object" && log.user?.image
                    ? log.user.image
                    : ""}
                  alt={typeof log.user === "object" ? log.user?.name : "User"}
                />
                <AvatarFallback
                  class="bg-primary/10 text-primary text-xs font-medium"
                >
                  {#if typeof log.user === "object" && log.user?.name}
                    {getInitials(log.user.name)}
                  {:else}
                    <UserIcon class="h-4 w-4" />
                  {/if}
                </AvatarFallback>
              </Avatar>
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium leading-none">
                    <span class="text-foreground">
                      {typeof log.user === "object"
                        ? log.user?.name
                        : "Unknown User"}
                    </span>
                  </p>
                  <span class="text-xs text-muted-foreground tabular-nums">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div
                  class="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span
                    class={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${getActionColor(log.action)}`}
                  >
                    {formatAction(log.action)}
                  </span>
                  <span>
                    {log.entity}
                    {#if log.details}
                      <span class="text-muted-foreground/60 mx-1">•</span>
                      <span
                        class="truncate max-w-[200px] inline-block align-bottom"
                      >
                        {log.entityId.slice(0, 8)}...
                      </span>
                    {/if}
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </ScrollArea>
  </CardContent>
</Card>
