<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import {
    Calendar,
    Trash2,
    Mail,
    User,
    Building2,
    ChevronDown,
    Clock,
    Inbox,
    Eye,
    Globe,
    Phone,
    Briefcase,
    MessageSquareQuote,
  } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import { format } from "date-fns";

  let { data } = $props();
  let selectedConsultation = $state<any>(null);
  let isDialogOpen = $state(false);

  let innerWidth = $state(0);
  let isMobile = $derived(innerWidth < 768);

  const statusColors: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    read: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    replied: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    archived: "bg-muted text-muted-foreground border-border",
  };

  const statuses = ["new", "read", "replied", "archived"];

  function openDetails(consultation: any) {
    selectedConsultation = consultation;
    isDialogOpen = true;
  }
</script>

<svelte:window bind:innerWidth />

<div class="space-y-6 pt-4 pb-20">
  <div
    class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Calendar class="size-8 text-primary" />
        Consultation Requests
      </h1>
      <p
        class="text-sm font-bold text-muted-foreground uppercase tracking-widest"
      >
        Review and manage consultation inquiries from the website
      </p>
    </div>
  </div>

  <!-- Mobile Card View -->
  <div class="md:hidden space-y-3">
    {#if data.consultations.length === 0}
      <Card.Root
        class="border-border/50 bg-card/50 backdrop-blur-md shadow-lg p-8"
      >
        <div
          class="flex flex-col items-center gap-2 text-muted-foreground italic font-medium"
        >
          <Inbox class="size-8 opacity-20" />
          No consultations found yet.
        </div>
      </Card.Root>
    {:else}
      {#each data.consultations as item}
        <Card.Root
          class="border-border/50 bg-card/50 backdrop-blur-md shadow-lg overflow-hidden"
        >
          <div class="p-4 space-y-3">
            <div class="flex items-center justify-between">
              <form method="POST" action="?/updateStatus" use:enhance>
                <input type="hidden" name="id" value={item.id} />
                <Select.Root
                  type="single"
                  name="status"
                  value={item.status as string}
                  onValueChange={(v) => {}}
                >
                  <Select.Trigger
                    class="h-7 w-[100px] text-[9px] font-bold uppercase tracking-widest rounded-md {statusColors[
                      item.status || 'new'
                    ]}"
                  >
                    {item.status || "NEW"}
                  </Select.Trigger>
                  <Select.Content class="rounded-xl border-border/50 shadow-xl">
                    {#each statuses as s}
                      <Select.Item
                        value={s}
                        class="text-[9px] font-bold uppercase tracking-widest"
                        >{s}</Select.Item
                      >
                    {/each}
                  </Select.Content>
                </Select.Root>
                <input type="hidden" name="status" value={item.status} />
              </form>
              <span
                class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
              >
                {format(new Date(item.createdAt), "MMM d, yyyy")}
              </span>
            </div>

            <div>
              <p class="text-sm font-bold">
                {item.firstName}
                {item.lastName}
              </p>
              <p class="text-[10px] text-muted-foreground font-medium">
                {item.email}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <Briefcase class="size-3.5 text-primary shrink-0" />
              <span class="text-xs font-medium line-clamp-1">{item.topic}</span>
              <span class="text-[10px] text-muted-foreground font-bold">
                · {item.company}
              </span>
            </div>

            <div class="flex items-center gap-2 pt-1 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onclick={() => openDetails(item)}
                class="flex-1 gap-1.5 h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary"
              >
                <Eye class="size-3.5" /> View
              </Button>
              <form
                method="POST"
                action="?/delete"
                use:enhance={() => {
                  return async ({ result }) => {
                    if (result.type === "success") {
                      toast.success("Consultation deleted");
                    }
                  };
                }}
              >
                <input type="hidden" name="id" value={item.id} />
                <Button
                  variant="ghost"
                  size="icon"
                  type="submit"
                  class="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 class="size-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </Card.Root>
      {/each}
    {/if}
  </div>

  <!-- Desktop Table View -->
  <Card.Root
    class="hidden md:block border-border/50 bg-card/50 backdrop-blur-md shadow-lg overflow-hidden"
  >
    <Table.Root>
      <Table.Header class="bg-muted/30">
        <Table.Row>
          <Table.Head
            class="text-[10px] font-bold uppercase tracking-widest text-primary"
            >Status</Table.Head
          >
          <Table.Head
            class="text-[10px] font-bold uppercase tracking-widest text-primary"
            >Applicant</Table.Head
          >
          <Table.Head
            class="text-[10px] font-bold uppercase tracking-widest text-primary"
            >Service Topic</Table.Head
          >
          <Table.Head
            class="text-[10px] font-bold uppercase tracking-widest text-primary"
            >Date</Table.Head
          >
          <Table.Head
            class="text-right text-[10px] font-bold uppercase tracking-widest text-primary"
            >Actions</Table.Head
          >
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if data.consultations.length === 0}
          <Table.Row>
            <Table.Cell
              colspan={5}
              class="h-48 text-center text-muted-foreground italic font-medium"
            >
              <div class="flex flex-col items-center gap-2">
                <Inbox class="size-8 opacity-20" />
                No consultations found yet.
              </div>
            </Table.Cell>
          </Table.Row>
        {:else}
          {#each data.consultations as item}
            <Table.Row class="group hover:bg-muted/10 transition-colors">
              <Table.Cell>
                <form method="POST" action="?/updateStatus" use:enhance>
                  <input type="hidden" name="id" value={item.id} />
                  <Select.Root
                    type="single"
                    name="status"
                    value={item.status as string}
                    onValueChange={(v) => {}}
                  >
                    <Select.Trigger
                      class="h-7 w-[100px] text-[9px] font-bold uppercase tracking-widest rounded-md {statusColors[
                        item.status || 'new'
                      ]}"
                    >
                      {item.status || "NEW"}
                    </Select.Trigger>
                    <Select.Content
                      class="rounded-xl border-border/50 shadow-xl"
                    >
                      {#each statuses as s}
                        <Select.Item
                          value={s}
                          class="text-[9px] font-bold uppercase tracking-widest"
                          >{s}</Select.Item
                        >
                      {/each}
                    </Select.Content>
                  </Select.Root>
                  <input type="hidden" name="status" value={item.status} />
                </form>
              </Table.Cell>
              <Table.Cell>
                <div class="flex flex-col">
                  <span class="text-sm font-bold flex items-center gap-1.5">
                    {item.firstName}
                    {item.lastName}
                  </span>
                  <span class="text-[10px] text-muted-foreground font-medium"
                    >{item.email}</span
                  >
                </div>
              </Table.Cell>
              <Table.Cell>
                <div class="flex flex-col">
                  <span class="text-sm font-medium line-clamp-1"
                    >{item.topic}</span
                  >
                  <span
                    class="text-[10px] text-muted-foreground font-bold uppercase tracking-wider"
                    >{item.company}</span
                  >
                </div>
              </Table.Cell>
              <Table.Cell>
                <span
                  class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {format(new Date(item.createdAt), "MMM d, yyyy")}
                </span>
              </Table.Cell>
              <Table.Cell class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onclick={() => openDetails(item)}
                    class="size-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                  >
                    <Eye class="size-4" />
                  </Button>
                  <form
                    method="POST"
                    action="?/delete"
                    use:enhance={() => {
                      return async ({ result }) => {
                        if (result.type === "success") {
                          toast.success("Consultation deleted");
                        }
                      };
                    }}
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="submit"
                      class="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </form>
                </div>
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </Card.Root>
</div>

<!-- Mobile Drawer -->
{#if isMobile}
  <Drawer.Root bind:open={isDialogOpen}>
    <Drawer.Content class="max-h-[50vh]">
      {#if selectedConsultation}
        <Drawer.Header class="px-4 pb-3 border-b border-border/40">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Drawer.Title class="text-base font-bold tracking-tight"
                >Consultation Request</Drawer.Title
              >
              <Drawer.Description
                class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                {format(
                  new Date(selectedConsultation.createdAt),
                  "MMM d, yyyy 'at' p",
                )}
              </Drawer.Description>
            </div>
            <Badge
              class="h-5 text-[9px] font-bold uppercase tracking-widest {statusColors[
                selectedConsultation.status || 'new'
              ]}"
            >
              {selectedConsultation.status || "NEW"}
            </Badge>
          </div>
        </Drawer.Header>

        <ScrollArea class="flex-1 min-h-0">
          <div class="px-4 py-4 space-y-4">
            <!-- Contact Details -->
            <div class="grid grid-cols-2 gap-2">
              <div
                class="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/50"
              >
                <User class="size-3.5 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[8px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Full Name
                  </p>
                  <p class="text-[11px] font-bold truncate">
                    {selectedConsultation.firstName}
                    {selectedConsultation.lastName}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/50"
              >
                <Globe class="size-3.5 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[8px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Country
                  </p>
                  <p class="text-[11px] font-bold truncate">
                    {selectedConsultation.country}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/50"
              >
                <Building2 class="size-3.5 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[8px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Organization
                  </p>
                  <p class="text-[11px] font-bold truncate">
                    {selectedConsultation.company}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/50"
              >
                <Briefcase class="size-3.5 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[8px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Service Topic
                  </p>
                  <p class="text-[11px] font-bold truncate">
                    {selectedConsultation.topic}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/50"
              >
                <Mail class="size-3.5 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[8px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Email
                  </p>
                  <p class="text-[11px] font-bold truncate">
                    {selectedConsultation.email}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 border border-border/50"
              >
                <Phone class="size-3.5 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[8px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Phone
                  </p>
                  <p class="text-[11px] font-bold truncate">
                    {selectedConsultation.phone}
                  </p>
                </div>
              </div>
            </div>

            <!-- Message -->
            <div class="space-y-2">
              <div
                class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary"
              >
                <MessageSquareQuote class="size-3" />
                Message
              </div>
              <div
                class="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg bg-background/50 border border-border/50 leading-relaxed text-sm"
              >
                {@html selectedConsultation.message}
              </div>
            </div>
          </div>
        </ScrollArea>

        <Drawer.Footer class="px-4 pt-3 border-t border-border/40">
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              class="flex-1 gap-2 rounded-xl h-9 font-bold text-[10px] uppercase tracking-widest"
              href="mailto:{selectedConsultation.email}"
            >
              <Mail class="size-3.5" /> Reply
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="flex-1 gap-2 rounded-xl h-9 font-bold text-[10px] uppercase tracking-widest"
              href="tel:{selectedConsultation.phone}"
            >
              <Phone class="size-3.5" /> Call
            </Button>
          </div>
        </Drawer.Footer>
      {/if}
    </Drawer.Content>
  </Drawer.Root>
{:else}
  <!-- Desktop Dialog -->
  <Dialog.Root bind:open={isDialogOpen}>
    <Dialog.Content
      class="max-w-3xl max-h-[85vh] rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden flex flex-col"
    >
      {#if selectedConsultation}
        <Dialog.Header
          class="p-8 pb-4 border-b border-border/40 bg-muted/20 shrink-0"
        >
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <Dialog.Title class="text-2xl font-bold tracking-tight"
                >Consultation Request</Dialog.Title
              >
              <Dialog.Description
                class="text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                Submitted on {format(
                  new Date(selectedConsultation.createdAt),
                  "PPPP 'at' p",
                )}
              </Dialog.Description>
            </div>
            <Badge
              class="h-6 text-[10px] font-bold uppercase tracking-widest {statusColors[
                selectedConsultation.status || 'new'
              ]}"
            >
              {selectedConsultation.status || "NEW"}
            </Badge>
          </div>
        </Dialog.Header>

        <ScrollArea class="flex-1 min-h-0">
          <div class="p-8 space-y-6">
            <!-- Contact Details Grid -->
            <div class="grid grid-cols-3 gap-3">
              <div
                class="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
              >
                <User class="size-4 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Full Name
                  </p>
                  <p class="text-xs font-bold truncate">
                    {selectedConsultation.firstName}
                    {selectedConsultation.lastName}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
              >
                <Globe class="size-4 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Country
                  </p>
                  <p class="text-xs font-bold truncate">
                    {selectedConsultation.country}
                    {#if selectedConsultation.countryOther}
                      <span class="text-muted-foreground ml-1"
                        >({selectedConsultation.countryOther})</span
                      >
                    {/if}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
              >
                <Building2 class="size-4 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Organization
                  </p>
                  <p class="text-xs font-bold truncate">
                    {selectedConsultation.company}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
              >
                <Briefcase class="size-4 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Service Topic
                  </p>
                  <p class="text-xs font-bold truncate">
                    {selectedConsultation.topic}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
              >
                <Mail class="size-4 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Email Address
                  </p>
                  <p class="text-xs font-bold truncate">
                    {selectedConsultation.email}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
              >
                <Phone class="size-4 text-primary shrink-0" />
                <div class="space-y-0.5 min-w-0">
                  <p
                    class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Phone Number
                  </p>
                  <p class="text-xs font-bold truncate">
                    {selectedConsultation.phone}
                  </p>
                </div>
              </div>
            </div>

            <!-- Message -->
            <div class="space-y-3">
              <div
                class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary"
              >
                <MessageSquareQuote class="size-3.5" />
                Message Details
              </div>
              <div
                class="prose prose-sm dark:prose-invert max-w-none p-6 rounded-xl bg-background/50 border border-border/50 min-h-[120px] leading-relaxed"
              >
                {@html selectedConsultation.message}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                class="flex-1 gap-2 rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest"
                href="mailto:{selectedConsultation.email}"
              >
                <Mail class="size-3.5" /> Reply
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="flex-1 gap-2 rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest"
                href="tel:{selectedConsultation.phone}"
              >
                <Phone class="size-3.5" /> Call
              </Button>
            </div>
          </div>
        </ScrollArea>
      {/if}
    </Dialog.Content>
  </Dialog.Root>
{/if}

<style>
  :global(.prose img) {
    max-width: 100%;
    border-radius: 0.75rem;
  }
</style>
