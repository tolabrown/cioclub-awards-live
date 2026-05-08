<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import {
    Mail,
    MessageSquare,
    Calendar,
    User,
    Phone,
    Tag,
    CheckCircle2,
    Clock,
    MoreVertical,
    Trash2,
    ArrowRight,
    Loader2,
    ExternalLink,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";
  import { format } from "date-fns";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let selectedContact = $state<any>(null);
  let isDialogOpen = $state(false);
  let isDrawerOpen = $state(false);
  let isLoadingMore = $state(false);

  // Combine inquiries for "infinite" list simulation
  let allInquiries = $state<any[]>([]);

  // Update when data changes (e.g. after load more or invalidate)
  $effect(() => {
    // If it's the first page, reset the list
    if (data.pagination.page === 1) {
      allInquiries = [...data.inquiries];
    } else {
      // Append new items that aren't already in the list
      const newItems = data.inquiries.filter(
        (newItem: any) => !allInquiries.some((item) => item.id === newItem.id),
      );
      allInquiries = [...allInquiries, ...newItems];
    }
  });

  function openDetails(contact: any) {
    selectedContact = contact;
    if (window.innerWidth >= 768) {
      isDialogOpen = true;
    } else {
      isDrawerOpen = true;
    }
  }

  async function handleLoadMore() {
    if (isLoadingMore || !data.pagination.hasMore) return;

    isLoadingMore = true;
    const nextPage = data.pagination.page + 1;
    const url = new URL(window.location.href);
    url.searchParams.set("page", nextPage.toString());

    // In a real infinite scroll we'd fetch JSON, but here we use SvelteKit's built-in data loading
    // by navigating with keepfocus and nosecroll, then appending the data in $effect
    const response = await fetch(url.toString());
    if (response.ok) {
      // This is a bit hacky but works for demo purposes without complex state management
      // In production, an API endpoint would be better
      window.history.pushState({}, "", url);
      await invalidateAll();
    }
    isLoadingMore = false;
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800";
      case "read":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800";
    }
  };
</script>

<div class="flex flex-col gap-6 w-full pb-20">
  <!-- Header Section -->
  <div class="flex flex-col gap-4 pt-4">
    <div class="space-y-1">
      <h1
        class="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3"
      >
        <div class="bg-primary/10 p-2 rounded-xl text-primary">
          <MessageSquare class="size-7" />
        </div>
        Contact Inquiries
      </h1>
      <p class="text-muted-foreground font-medium pl-1">
        Manage and respond to messages from the community.
      </p>
    </div>

    <div
      class="flex items-center gap-3 bg-card/50 backdrop-blur-md border border-border/50 p-1.5 rounded-xl shadow-sm"
    >
      <div class="px-3 py-1 flex items-center gap-2">
        <span class="size-2 rounded-full bg-blue-500 animate-pulse"></span>
        <span
          class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          {data.pagination.total} Total Inquiries
        </span>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <Card.Root
    class="border-border/60 shadow-lg overflow-hidden bg-card/30 backdrop-blur-sm"
  >
    <!-- Desktop Table View -->
    <div class="hidden md:block">
      <Table.Root>
        <Table.Header class="bg-muted/50">
          <Table.Row>
            <Table.Head
              class="w-[200px] font-bold uppercase tracking-widest text-[10px]"
              >Sender</Table.Head
            >
            <Table.Head
              class="w-[150px] font-bold uppercase tracking-widest text-[10px]"
              >Type</Table.Head
            >
            <Table.Head class="font-bold uppercase tracking-widest text-[10px]"
              >Message Preview</Table.Head
            >
            <Table.Head
              class="w-[150px] font-bold uppercase tracking-widest text-[10px]"
              >Date</Table.Head
            >
            <Table.Head
              class="w-[120px] font-bold uppercase tracking-widest text-[10px]"
              >Status</Table.Head
            >
            <Table.Head class="w-[80px] text-right"></Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each allInquiries as inquiry}
            <Table.Row
              class="group hover:bg-muted/30 transition-colors cursor-pointer border-border/40"
              onclick={() => openDetails(inquiry)}
            >
              <Table.Cell>
                <div class="flex flex-col">
                  <span
                    class="font-bold text-sm group-hover:text-primary transition-colors"
                    >{inquiry.fullName}</span
                  >
                  <span class="text-xs text-muted-foreground font-medium"
                    >{inquiry.email}</span
                  >
                </div>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  variant="outline"
                  class="rounded-lg font-bold text-[10px] uppercase bg-secondary/50"
                >
                  {inquiry.inquiryType}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <p
                  class="text-sm text-muted-foreground line-clamp-1 font-medium italic"
                >
                  "{inquiry.message}"
                </p>
              </Table.Cell>
              <Table.Cell>
                <div
                  class="flex items-center gap-2 text-xs text-muted-foreground font-medium"
                >
                  <Calendar class="size-3" />
                  {format(new Date(inquiry.createdAt), "MMM dd, yyyy")}
                </div>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  class={cn(
                    "rounded-md font-bold text-[10px] uppercase border",
                    getStatusColor(inquiry.status),
                  )}
                >
                  {inquiry.status || "New"}
                </Badge>
              </Table.Cell>
              <Table.Cell class="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  class="rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ArrowRight class="size-4" />
                </Button>
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden space-y-4">
      {#each allInquiries as inquiry}
        <Card.Root
          class="border-border/60 hover:border-primary/40 transition-all active:scale-[0.98]"
          onclick={() => openDetails(inquiry)}
        >
          <Card.Content class="p-4 space-y-3">
            <div class="flex justify-between items-start">
              <div class="space-y-0.5">
                <h3 class="font-bold text-base">{inquiry.fullName}</h3>
                <p class="text-xs text-muted-foreground font-medium">
                  {inquiry.email}
                </p>
              </div>
              <Badge
                class={cn(
                  "rounded-md font-bold text-[10px] uppercase",
                  getStatusColor(inquiry.status),
                )}
              >
                {inquiry.status || "New"}
              </Badge>
            </div>

            <p
              class="text-sm text-muted-foreground line-clamp-2 italic font-medium"
            >
              "{inquiry.message}"
            </p>

            <div
              class="flex items-center justify-between pt-2 border-t border-border/40"
            >
              <div
                class="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider"
              >
                <Clock class="size-3" />
                {format(new Date(inquiry.createdAt), "MMM dd, h:mm a")}
              </div>
              <Badge
                variant="secondary"
                class="rounded-lg text-[9px] font-black uppercase"
              >
                {inquiry.inquiryType}
              </Badge>
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>

    {#if data.pagination.hasMore}
      <div
        class="p-8 flex justify-center border-t border-border/40 bg-muted/20"
      >
        <Button
          variant="outline"
          onclick={handleLoadMore}
          disabled={isLoadingMore}
          class="gap-2 rounded-xl font-bold min-w-[160px] shadow-sm active:scale-95 transition-all"
        >
          {#if isLoadingMore}
            <Loader2 class="size-4 animate-spin" />
            Loading...
          {:else}
            Load More <ArrowRight class="size-4" />
          {/if}
        </Button>
      </div>
    {/if}

    {#if allInquiries.length === 0}
      <div class="py-20 text-center space-y-4">
        <div
          class="bg-muted/50 p-4 rounded-full size-16 mx-auto flex items-center justify-center text-muted-foreground/30"
        >
          <Mail class="size-8" />
        </div>
        <div class="space-y-1">
          <p class="text-foreground font-bold">No Inquiries Found</p>
          <p class="text-muted-foreground text-sm">
            When users contact you, they'll appear here.
          </p>
        </div>
      </div>
    {/if}
  </Card.Root>
</div>

<!-- Details Dialog (Desktop) -->
<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Content
    class="sm:max-w-[600px] p-0 overflow-hidden rounded-xl border-border/60 shadow-2xl"
  >
    {#if selectedContact}
      <Dialog.Header class="p-6 bg-muted/40 border-b border-border/40">
        <div class="flex items-center justify-between mb-4">
          <Badge
            class={cn(
              "rounded-md font-bold text-[10px] uppercase",
              getStatusColor(selectedContact.status),
            )}
          >
            {selectedContact.status || "New"}
          </Badge>
          <div
            class="text-xs text-muted-foreground font-medium flex items-center gap-1.5"
          >
            <Calendar class="size-3.5" />
            {format(
              new Date(selectedContact.createdAt),
              "MMMM dd, yyyy @ h:mm a",
            )}
          </div>
        </div>
        <Dialog.Title class="text-2xl font-bold tracking-tight"
          >{selectedContact.fullName}</Dialog.Title
        >
        <Dialog.Description class="text-muted-foreground font-medium text-base">
          {selectedContact.email}
        </Dialog.Description>
      </Dialog.Header>

      <div class="p-6 space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Inquiry Type
            </p>
            <div class="flex items-center gap-2 text-sm font-bold">
              <Tag class="size-4 text-primary" />
              {selectedContact.inquiryType}
            </div>
          </div>
          {#if selectedContact.phone}
            <div class="space-y-1">
              <p
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Phone Number
              </p>
              <div class="flex items-center gap-2 text-sm font-bold">
                <Phone class="size-4 text-primary" />
                {selectedContact.phone}
              </div>
            </div>
          {/if}
        </div>

        <Separator class="bg-border/40" />

        <div class="space-y-3">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Message Content
          </p>
          <div
            class="bg-muted/30 p-4 rounded-xl border border-border/40 min-h-[150px]"
          >
            <p
              class="text-foreground leading-relaxed font-medium whitespace-pre-wrap"
            >
              {selectedContact.message}
            </p>
          </div>
        </div>
      </div>

      <Dialog.Footer class="p-6 bg-muted/20 border-t border-border/40 gap-3">
        <form
          method="POST"
          action="?/markAsRead"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === "success") {
                toast.success("Marked as read");
                isDialogOpen = false;
                await invalidateAll();
              }
            };
          }}
        >
          <input type="hidden" name="id" value={selectedContact.id} />
          <Button
            type="submit"
            variant="default"
            class="gap-2 font-bold rounded-xl"
            disabled={selectedContact.status === "read"}
          >
            <CheckCircle2 class="size-4" />
            Mark as Read
          </Button>
        </form>
        <Button
          variant="outline"
          href={`mailto:${selectedContact.email}`}
          class="gap-2 font-bold rounded-xl"
        >
          <Mail class="size-4" />
          Reply via Email
        </Button>
      </Dialog.Footer>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<!-- Details Drawer (Mobile) -->
<Drawer.Root bind:open={isDrawerOpen}>
  <Drawer.Content class="p-0 rounded-t-xl">
    {#if selectedContact}
      <div
        class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4"
      ></div>

      <div class="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
        <div class="space-y-1">
          <div class="flex items-center justify-between mb-2">
            <Badge
              class={cn(
                "rounded-md font-bold text-[10px] uppercase",
                getStatusColor(selectedContact.status),
              )}
            >
              {selectedContact.status || "New"}
            </Badge>
            <Badge
              variant="outline"
              class="rounded-lg text-[9px] font-black uppercase"
            >
              {selectedContact.inquiryType}
            </Badge>
          </div>
          <h2 class="text-2xl font-bold leading-tight">
            {selectedContact.fullName}
          </h2>
          <p class="text-muted-foreground font-medium text-sm">
            {selectedContact.email}
          </p>
        </div>

        <div
          class="flex items-center gap-4 py-2 text-xs text-muted-foreground font-bold uppercase tracking-widest"
        >
          <div class="flex items-center gap-1.5">
            <Calendar class="size-3.5" />
            {format(new Date(selectedContact.createdAt), "MMM dd, yyyy")}
          </div>
          <div class="flex items-center gap-1.5">
            <Clock class="size-3.5" />
            {format(new Date(selectedContact.createdAt), "h:mm a")}
          </div>
        </div>

        <Separator class="bg-border/40" />

        <div class="space-y-3">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Message
          </p>
          <div class="bg-muted/30 p-4 rounded-xl border border-border/40">
            <p
              class="text-sm text-foreground leading-relaxed font-medium whitespace-pre-wrap"
            >
              {selectedContact.message}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-3 pt-4 pb-8">
          <form
            method="POST"
            action="?/markAsRead"
            class="w-full"
            use:enhance={() => {
              return async ({ result }) => {
                if (result.type === "success") {
                  toast.success("Marked as read");
                  isDrawerOpen = false;
                  await invalidateAll();
                }
              };
            }}
          >
            <input type="hidden" name="id" value={selectedContact.id} />
            <Button
              type="submit"
              class="w-full gap-2 font-bold rounded-xl h-12"
              disabled={selectedContact.status === "read"}
            >
              <CheckCircle2 class="size-5" />
              Mark as Read
            </Button>
          </form>
          <Button
            variant="outline"
            href={`mailto:${selectedContact.email}`}
            class="w-full gap-2 font-bold rounded-xl h-12"
          >
            <Mail class="size-5" />
            Reply via Email
          </Button>
        </div>
      </div>
    {/if}
  </Drawer.Content>
</Drawer.Root>
