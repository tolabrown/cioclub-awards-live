<script lang="ts">
  import { onMount } from "svelte";
  import type { iActivityLog } from "$lib/interface";
  import { formatDate } from "$lib/fxns";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "$lib/components/ui/avatar";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import { User, Calendar, Database, Globe, Monitor } from "@lucide/svelte";

  interface Props {
    log: iActivityLog | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }

  let { log, open = $bindable(false), onOpenChange }: Props = $props();

  let isDesktop = $state(false);

  onMount(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    isDesktop = mql.matches;

    const handler = (e: MediaQueryListEvent) => {
      isDesktop = e.matches;
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "";
    }
  };

  const getUserName = (user: any) => {
    if (!user) return "System";
    return typeof user === "string" ? user : user.name || "Unknown";
  };

  const getUserEmail = (user: any) => {
    if (!user || typeof user === "string") return null;
    return user.email || null;
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

  const formatDetails = (details: string | null) => {
    if (!details) return null;
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    open = newOpen;
    if (onOpenChange) onOpenChange(newOpen);
  };
</script>

{#if isDesktop}
  <!-- Desktop: Dialog -->
  <Dialog.Root {open} onOpenChange={handleOpenChange}>
    <Dialog.Content class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <Dialog.Header>
        <Dialog.Title>Activity Log Details</Dialog.Title>
        <Dialog.Description>
          Comprehensive information about this activity
        </Dialog.Description>
      </Dialog.Header>

      {#if log}
        <div class="space-y-6 py-4">
          <!-- User Information -->
          <div class="flex items-start gap-4">
            <Avatar class="h-16 w-16">
              <AvatarImage
                src={getUserImage(log.user)}
                alt={getUserName(log.user)}
              />
              <AvatarFallback class="text-lg">
                {getInitials(getUserName(log.user))}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <User class="h-4 w-4 text-muted-foreground" />
                <h3 class="font-semibold text-lg">{getUserName(log.user)}</h3>
              </div>
              {#if getUserEmail(log.user)}
                <p class="text-sm text-muted-foreground">
                  {getUserEmail(log.user)}
                </p>
              {/if}
            </div>
          </div>

          <Separator />

          <!-- Action & Entity -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Database class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">Action</span>
              </div>
              <Badge variant="outline" class={getActionColor(log.action)}>
                {log.action}
              </Badge>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Database class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">Entity</span>
              </div>
              <p class="text-sm font-mono bg-muted px-2 py-1 rounded">
                {log.entity}
              </p>
            </div>
          </div>

          <!-- Entity ID -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <Database class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm font-medium">Entity ID</span>
            </div>
            <p class="text-sm font-mono bg-muted px-3 py-2 rounded break-all">
              {log.entityId}
            </p>
          </div>

          <!-- Timestamp -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <Calendar class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm font-medium">Timestamp</span>
            </div>
            <p class="text-sm">
              {formatDate(log.createdAt, "YYYY-MM-DD HH:mm:ss")}
            </p>
          </div>

          <!-- Details -->
          {#if log.details}
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Database class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">Details</span>
              </div>
              <pre
                class="text-xs bg-muted p-4 rounded overflow-x-auto border"><code
                  >{formatDetails(log.details)}</code
                ></pre>
            </div>
          {/if}

          <!-- Metadata -->
          {#if log.ipAddress || log.userAgent}
            <Separator />
            <div class="space-y-3">
              <h4 class="text-sm font-medium flex items-center gap-2">
                <Monitor class="h-4 w-4 text-muted-foreground" />
                Metadata
              </h4>
              {#if log.ipAddress}
                <div class="flex items-start gap-2">
                  <Globe class="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div class="flex-1">
                    <p class="text-xs font-medium text-muted-foreground">
                      IP Address
                    </p>
                    <p class="text-sm font-mono">{log.ipAddress}</p>
                  </div>
                </div>
              {/if}
              {#if log.userAgent}
                <div class="flex items-start gap-2">
                  <Monitor class="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div class="flex-1">
                    <p class="text-xs font-medium text-muted-foreground">
                      User Agent
                    </p>
                    <p
                      class="text-xs font-mono text-muted-foreground break-all"
                    >
                      {log.userAgent}
                    </p>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <!-- Mobile: Drawer -->
  <Drawer.Root {open} onOpenChange={handleOpenChange}>
    <Drawer.Content>
      <Drawer.Header>
        <Drawer.Title>Activity Log Details</Drawer.Title>
        <Drawer.Description>
          Comprehensive information about this activity
        </Drawer.Description>
      </Drawer.Header>

      {#if log}
        <div class="space-y-6 px-4 pb-8 overflow-y-auto max-h-[70vh]">
          <!-- User Information -->
          <div class="flex items-start gap-4">
            <Avatar class="h-14 w-14">
              <AvatarImage
                src={getUserImage(log.user)}
                alt={getUserName(log.user)}
              />
              <AvatarFallback class="text-base">
                {getInitials(getUserName(log.user))}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <User class="h-4 w-4 text-muted-foreground" />
                <h3 class="font-semibold">{getUserName(log.user)}</h3>
              </div>
              {#if getUserEmail(log.user)}
                <p class="text-sm text-muted-foreground">
                  {getUserEmail(log.user)}
                </p>
              {/if}
            </div>
          </div>

          <Separator />

          <!-- Action & Entity -->
          <div class="space-y-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Database class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">Action</span>
              </div>
              <Badge variant="outline" class={getActionColor(log.action)}>
                {log.action}
              </Badge>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Database class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">Entity</span>
              </div>
              <p class="text-sm font-mono bg-muted px-2 py-1 rounded">
                {log.entity}
              </p>
            </div>
          </div>

          <!-- Entity ID -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <Database class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm font-medium">Entity ID</span>
            </div>
            <p class="text-sm font-mono bg-muted px-3 py-2 rounded break-all">
              {log.entityId}
            </p>
          </div>

          <!-- Timestamp -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <Calendar class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm font-medium">Timestamp</span>
            </div>
            <p class="text-sm">
              {formatDate(log.createdAt, "YYYY-MM-DD HH:mm:ss")}
            </p>
          </div>

          <!-- Details -->
          {#if log.details}
            <div>
              <div class="flex items-center gap-2 mb-2">
                <Database class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">Details</span>
              </div>
              <pre
                class="text-xs bg-muted p-3 rounded overflow-x-auto border"><code
                  >{formatDetails(log.details)}</code
                ></pre>
            </div>
          {/if}

          <!-- Metadata -->
          {#if log.ipAddress || log.userAgent}
            <Separator />
            <div class="space-y-3">
              <h4 class="text-sm font-medium flex items-center gap-2">
                <Monitor class="h-4 w-4 text-muted-foreground" />
                Metadata
              </h4>
              {#if log.ipAddress}
                <div class="flex items-start gap-2">
                  <Globe class="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div class="flex-1">
                    <p class="text-xs font-medium text-muted-foreground">
                      IP Address
                    </p>
                    <p class="text-sm font-mono">{log.ipAddress}</p>
                  </div>
                </div>
              {/if}
              {#if log.userAgent}
                <div class="flex items-start gap-2">
                  <Monitor class="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div class="flex-1">
                    <p class="text-xs font-medium text-muted-foreground">
                      User Agent
                    </p>
                    <p
                      class="text-xs font-mono text-muted-foreground break-all"
                    >
                      {log.userAgent}
                    </p>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </Drawer.Content>
  </Drawer.Root>
{/if}
