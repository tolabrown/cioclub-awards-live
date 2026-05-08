<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import * as Select from "$lib/components/ui/select/index.js";
  import {
    MessageSquare,
    Trash2,
    Mail,
    Calendar,
    User,
    Building2,
    ChevronDown,
    Archive,
    CheckCircle2,
    Clock,
    Inbox,
  } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import { format } from "date-fns";

  let { data } = $props();
  let expandedInquiryId = $state<string | null>(null);

  const statusColors: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    read: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    replied: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    archived: "bg-muted text-muted-foreground border-border",
  };

  const statuses = ["new", "read", "replied", "archived"];
</script>

<div class="space-y-6 pt-4 pb-20">
  <div
    class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <MessageSquare class="size-8 text-primary" />
        Contact Inquiries
      </h1>
      <p
        class="text-sm font-bold text-muted-foreground uppercase tracking-widest"
      >
        Manage messages and inquiries from the website contact form
      </p>
    </div>
  </div>

  <Card.Root
    class="border-border/50 bg-card/50 backdrop-blur-md shadow-lg overflow-hidden"
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
            >Sender</Table.Head
          >
          <Table.Head
            class="text-[10px] font-bold uppercase tracking-widest text-primary"
            >Subject</Table.Head
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
        {#if data.inquiries.length === 0}
          <Table.Row>
            <Table.Cell
              colspan={5}
              class="h-48 text-center text-muted-foreground italic font-medium"
            >
              <div class="flex flex-col items-center gap-2">
                <Inbox class="size-8 opacity-20" />
                No inquiries found yet.
              </div>
            </Table.Cell>
          </Table.Row>
        {:else}
          {#each data.inquiries as item}
            <Table.Row class="group hover:bg-muted/10 transition-colors">
              <Table.Cell>
                <div class="flex items-center gap-2">
                  <form method="POST" action="?/updateStatus" use:enhance>
                    <input type="hidden" name="id" value={item.id} />
                    <Select.Root
                      type="single"
                      name="status"
                      value={item.status}
                      onValueChange={(v) => {
                        const form = document.querySelector(
                          `form[data-id="${item.id}"]`,
                        ) as HTMLFormElement;
                        // Manual submission handled by enhance usually, but Select needs a way to trigger
                      }}
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
                    <input
                      type="hidden"
                      name="status"
                      value={item.status}
                      id="status-{item.id}"
                    />
                  </form>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div class="flex flex-col">
                  <span class="text-sm font-bold flex items-center gap-1.5">
                    {item.name}
                    {#if item.company}
                      <Badge
                        variant="outline"
                        class="text-[8px] h-4 px-1 font-medium"
                        >{item.company}</Badge
                      >
                    {/if}
                  </span>
                  <span class="text-[10px] text-muted-foreground font-medium"
                    >{item.email}</span
                  >
                </div>
              </Table.Cell>
              <Table.Cell>
                <span class="text-sm font-medium line-clamp-1"
                  >{item.subject || "(No Subject)"}</span
                >
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
                    onclick={() =>
                      (expandedInquiryId =
                        expandedInquiryId === item.id ? null : item.id)}
                    class="size-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-transform {expandedInquiryId ===
                    item.id
                      ? 'rotate-180'
                      : ''}"
                  >
                    <ChevronDown class="size-4" />
                  </Button>
                  <form
                    method="POST"
                    action="?/delete"
                    use:enhance={() => {
                      return async ({ result }) => {
                        if (result.type === "success") {
                          toast.success("Inquiry deleted");
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
            {#if expandedInquiryId === item.id}
              <Table.Row class="bg-muted/30">
                <Table.Cell colspan={5} class="p-6">
                  <div class="grid gap-6 md:grid-cols-2">
                    <div class="space-y-4">
                      <div class="space-y-1">
                        <p
                          class="text-[9px] font-bold uppercase tracking-widest text-primary"
                        >
                          Message Details
                        </p>
                        <p
                          class="text-sm font-medium leading-relaxed whitespace-pre-wrap rounded-xl bg-background/50 p-4 border border-border/50"
                        >
                          {item.message}
                        </p>
                      </div>
                    </div>
                    <div class="space-y-4">
                      <div class="grid gap-4">
                        <div
                          class="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
                        >
                          <User class="size-4 text-primary" />
                          <div>
                            <p
                              class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                            >
                              Full Name
                            </p>
                            <p class="text-xs font-bold">{item.name}</p>
                          </div>
                        </div>
                        <div
                          class="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
                        >
                          <Mail class="size-4 text-primary" />
                          <div>
                            <p
                              class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                            >
                              Email Address
                            </p>
                            <p class="text-xs font-bold">{item.email}</p>
                          </div>
                        </div>
                        {#if item.company}
                          <div
                            class="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
                          >
                            <Building2 class="size-4 text-primary" />
                            <div>
                              <p
                                class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                              >
                                Company
                              </p>
                              <p class="text-xs font-bold">{item.company}</p>
                            </div>
                          </div>
                        {/if}
                        <div
                          class="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
                        >
                          <Clock class="size-4 text-primary" />
                          <div>
                            <p
                              class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                            >
                              Submitted At
                            </p>
                            <p class="text-xs font-bold">
                              {format(new Date(item.createdAt), "PPP p")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          class="flex-1 gap-2 rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest"
                          href="mailto:{item.email}"
                        >
                          <Mail class="size-3.5" /> Reply via Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </Table.Cell>
              </Table.Row>
            {/if}
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </Card.Root>
</div>
