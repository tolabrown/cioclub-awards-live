<script lang="ts">
  import type { iParent } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import {
    Phone,
    Mail,
    User,
    Users,
    MessageCircle,
    Trash2,
  } from "@lucide/svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { cn } from "$lib/utils";
  import { page } from "$app/state";
  import type { User as UserType } from "$lib/auth";
  import { editors, Role } from "$lib/constants";

  interface Props {
    parent: iParent;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
  }

  let {
    parent,
    open = $bindable(),
    onOpenChange,
    onEdit,
    onDelete,
  }: Props = $props();

  const user = page.data.user as UserType;
  const children = $derived(parent.children || []);
</script>

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Content class="sm:max-w-2xl">
    <Dialog.Header>
      <div class="flex items-center gap-4">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20"
        >
          <User class="h-8 w-8 text-primary" />
        </div>
        <div>
          <Dialog.Title class="text-xl">{parent.name}</Dialog.Title>
          <Dialog.Description class="capitalize">
            {parent.parentType}
          </Dialog.Description>
        </div>
      </div>
    </Dialog.Header>

    <div class="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
      <!-- Parent Type Badge -->
      <div>
        <Badge
          class={cn(
            parent.parentType === "father"
              ? "bg-blue-500"
              : parent.parentType === "mother"
                ? "bg-pink-500"
                : "bg-purple-500",
            "text-white text-sm px-3 py-1 capitalize",
          )}
        >
          {parent.parentType}
        </Badge>
      </div>

      <!-- Contact Info -->
      <div class="space-y-3">
        <div class="flex items-start gap-3">
          <Phone class="h-5 w-5 text-muted-foreground mt-0.5" />
          <div class="flex-1">
            <p class="text-sm font-medium">Phone Number</p>
            <div class="flex items-center gap-2 mt-1">
              <p class="text-sm text-muted-foreground">{parent.phone}</p>
              <div class="flex gap-1">
                <Button
                  href="tel:{parent.phone}"
                  variant="outline"
                  size="sm"
                  class="h-7 px-2"
                >
                  <Phone class="h-3 w-3" />
                </Button>
                <Button
                  href="https://wa.me/{parent.phone.replace(/[^0-9]/g, '')}"
                  target="_blank"
                  variant="outline"
                  size="sm"
                  class="h-7 px-2"
                >
                  <MessageCircle class="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {#if parent.email}
          <div class="flex items-start gap-3">
            <Mail class="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p class="text-sm font-medium">Email Address</p>
              <a
                href="mailto:{parent.email}"
                class="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                {parent.email}
              </a>
            </div>
          </div>
        {/if}
      </div>

      <!-- Children Section -->
      {#if children.length > 0}
        <div class="rounded-lg border p-4">
          <div class="flex items-center gap-2 mb-3">
            <Users class="h-5 w-5 text-muted-foreground" />
            <h3 class="font-semibold">
              Children ({children.length})
            </h3>
          </div>
          <div class="space-y-3">
            {#each children as child}
              <div
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {#if child.image && typeof child.image === "object"}
                  <img
                    src={child.image.url}
                    alt={child.name}
                    class="h-12 w-12 rounded-full object-cover border-2 border-background"
                  />
                {:else}
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border-2 border-background font-medium text-lg"
                  >
                    {child.name.charAt(0)}
                  </div>
                {/if}
                <div class="flex-1">
                  <p class="font-medium">{child.name}</p>
                  <div class="flex items-center gap-2 mt-1">
                    {#if child.ageGroup}
                      <Badge variant="outline" class="text-xs">
                        {child.ageGroup}
                      </Badge>
                    {/if}
                    {#if child.gender}
                      <Badge
                        variant="outline"
                        class={cn(
                          "text-xs capitalize",
                          child.gender === "boy"
                            ? "border-blue-300 text-blue-700"
                            : "border-pink-300 text-pink-700",
                        )}
                      >
                        {child.gender}
                      </Badge>
                    {/if}
                    {#if child.active !== undefined}
                      <Badge
                        variant={child.active ? "default" : "secondary"}
                        class="text-xs"
                      >
                        {child.active ? "Active" : "Inactive"}
                      </Badge>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div
          class="rounded-lg border p-4 text-center text-sm text-muted-foreground"
        >
          <Users class="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No children registered</p>
        </div>
      {/if}
    </div>

    <div class="flex justify-end gap-2 pt-4 border-t">
      <Button variant="outline" onclick={() => onOpenChange(false)}>
        Close
      </Button>
      {#if editors.includes(user.role as Role)}
        <Button variant="destructive" onclick={onDelete} class="gap-2">
          <Trash2 class="h-4 w-4" />
          Delete
        </Button>
        <Button onclick={onEdit}>Edit Parent</Button>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
