<script lang="ts">
  import type { iParent } from "$lib/interface";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Phone, Mail, User as UserIcon, Users, Trash2 } from "@lucide/svelte";
  import WhatsApp from "$lib/components/icons/WhatsApp.svelte";
  import * as Drawer from "$lib/components/ui/drawer";
  import { cn } from "$lib/utils";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";
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

  const user = page.data.user as User;

  const children = $derived(parent.children || []);
</script>

<Drawer.Root bind:open {onOpenChange}>
  <Drawer.Content class="max-h-[90vh]">
    <Drawer.Header class="border-b">
      <div class="flex items-center gap-3">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20"
        >
          <UserIcon class="h-8 w-8 text-primary" />
        </div>
        <div>
          <Drawer.Title class="text-xl">{parent.name}</Drawer.Title>
          <Drawer.Description class="capitalize">
            {parent.parentType}
          </Drawer.Description>
        </div>
      </div>
    </Drawer.Header>

    <!-- Content -->
    <div class="space-y-4 overflow-y-auto p-4">
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
            </div>
            <div class="flex gap-2 mt-2">
              <Button
                href="tel:{parent.phone}"
                variant="outline"
                size="sm"
                class="flex-1"
              >
                <Phone class="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button
                href="https://wa.me/{parent.phone.replace(/[^0-9]/g, '')}"
                target="_blank"
                variant="outline"
                size="sm"
                class="flex-1"
              >
                <WhatsApp class="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
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
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
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

    <!-- Footer Actions -->
    <div class="border-t p-4 flex gap-2">
      <Button
        variant="outline"
        onclick={() => onOpenChange(false)}
        class="flex-1"
      >
        Close
      </Button>
      {#if editors.includes(user.role as Role)}
        <Button variant="destructive" onclick={onDelete} class="flex-1 gap-2">
          <Trash2 class="h-4 w-4" />
          Delete
        </Button>
        <Button onclick={onEdit} class="flex-1">Edit Parent</Button>
      {/if}
    </div>
  </Drawer.Content>
</Drawer.Root>
