<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import * as Select from "$lib/components/ui/select/index.js";
  import {
    Briefcase,
    Trash2,
    Mail,
    Phone,
    User,
    FileText,
    ChevronDown,
    Clock,
    Inbox,
    Download,
    ExternalLink,
  } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import { format } from "date-fns";

  let { data } = $props();
  let expandedId = $state<string | null>(null);

  const statusColors: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    reviewed: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    shortlisted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    archived: "bg-muted text-muted-foreground border-border",
  };

  const statuses = ["new", "reviewed", "shortlisted", "rejected", "archived"];
</script>

<div class="space-y-6 pt-4 pb-20">
  <div
    class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
        <Briefcase class="size-8 text-primary" />
        CV Applications
      </h1>
      <p
        class="text-sm font-bold text-muted-foreground uppercase tracking-widest"
      >
        Review applications submitted through the team page
      </p>
    </div>
    <Badge variant="outline" class="text-xs">
      {data.applications.length} total
    </Badge>
  </div>

  <Card.Root
    class="border-border/50 bg-card/50 backdrop-blur-md shadow-lg overflow-hidden"
  >
    <!-- Desktop Table -->
    <div class="hidden md:block">
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
              >CV File</Table.Head
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
          {#if data.applications.length === 0}
            <Table.Row>
              <Table.Cell
                colspan={5}
                class="h-48 text-center text-muted-foreground italic font-medium"
              >
                <div class="flex flex-col items-center gap-2">
                  <Inbox class="size-8 opacity-20" />
                  No applications received yet.
                </div>
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each data.applications as item}
              <Table.Row class="group hover:bg-muted/10 transition-colors">
                <Table.Cell>
                  <form method="POST" action="?/updateStatus" use:enhance>
                    <input type="hidden" name="id" value={item.id} />
                    <Select.Root
                      type="single"
                      name="status"
                      value={item.status ?? undefined}
                    >
                      <Select.Trigger
                        class="h-7 w-[110px] text-[9px] font-bold uppercase tracking-widest rounded-md {statusColors[
                          item.status || 'new'
                        ]}"
                      >
                        {item.status || "NEW"}
                      </Select.Trigger>
                      <Select.Content
                        class="rounded-lg border-border/50 shadow-lg"
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
                  </form>
                </Table.Cell>
                <Table.Cell>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold">{item.name}</span>
                    <span class="text-[10px] text-muted-foreground font-medium"
                      >{item.email}</span
                    >
                    <span class="text-[10px] text-muted-foreground font-medium"
                      >{item.phone}</span
                    >
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {#if item.cvFile?.url}
                    <Button
                      variant="outline"
                      size="sm"
                      href={item.cvFile.url}
                      target="_blank"
                    >
                      <Download class="size-3.5 mr-1.5" />
                      {item.cvFile.name || "Download CV"}
                    </Button>
                  {:else}
                    <span class="text-xs text-muted-foreground italic"
                      >No file</span
                    >
                  {/if}
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
                        (expandedId = expandedId === item.id ? null : item.id)}
                      class="size-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-transform {expandedId ===
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
                          if (result.type === "success")
                            toast.success("Application deleted");
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
              {#if expandedId === item.id}
                <Table.Row class="bg-muted/30">
                  <Table.Cell colspan={5} class="p-6">
                    <div class="grid gap-6 md:grid-cols-2">
                      <!-- Cover Letter -->
                      <div class="space-y-4">
                        <div class="space-y-1">
                          <p
                            class="text-[9px] font-bold uppercase tracking-widest text-primary"
                          >
                            Cover Letter
                          </p>
                          {#if item.coverLetter}
                            <div
                              class="text-sm font-medium leading-relaxed rounded-lg bg-background/50 p-4 border border-border/50 prose prose-sm max-w-none dark:prose-invert"
                            >
                              {@html item.coverLetter}
                            </div>
                          {:else}
                            <p
                              class="text-sm text-muted-foreground italic p-4 rounded-lg bg-background/50 border border-border/50"
                            >
                              No cover letter provided.
                            </p>
                          {/if}
                        </div>
                      </div>
                      <!-- Contact Details -->
                      <div class="space-y-4">
                        <div class="grid gap-4">
                          <div
                            class="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
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
                            class="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
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
                          <div
                            class="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                          >
                            <Phone class="size-4 text-primary" />
                            <div>
                              <p
                                class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground"
                              >
                                Phone Number
                              </p>
                              <p class="text-xs font-bold">{item.phone}</p>
                            </div>
                          </div>
                          <div
                            class="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
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
                            href="mailto:{item.email}"
                          >
                            <Mail class="size-3.5 mr-1.5" /> Reply via Email
                          </Button>
                          {#if item.cvFile?.url}
                            <Button
                              variant="outline"
                              size="sm"
                              href={item.cvFile.url}
                              target="_blank"
                            >
                              <ExternalLink class="size-3.5 mr-1.5" /> View CV
                            </Button>
                          {/if}
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
    </div>

    <!-- Mobile Card Layout -->
    <div class="md:hidden divide-y divide-border/50">
      {#if data.applications.length === 0}
        <div
          class="flex flex-col items-center gap-2 p-12 text-muted-foreground"
        >
          <Inbox class="size-8 opacity-20" />
          <p class="text-sm italic font-medium">
            No applications received yet.
          </p>
        </div>
      {:else}
        {#each data.applications as item}
          <div class="p-4 space-y-3">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-bold text-sm">{item.name}</p>
                <p class="text-xs text-muted-foreground">{item.email}</p>
                <p class="text-xs text-muted-foreground">{item.phone}</p>
              </div>
              <Badge
                variant="outline"
                class="text-[8px] font-bold uppercase {statusColors[
                  item.status || 'new'
                ]}"
              >
                {item.status || "new"}
              </Badge>
            </div>

            <div
              class="flex items-center justify-between text-xs text-muted-foreground"
            >
              <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
              {#if item.cvFile?.url}
                <Button
                  variant="outline"
                  size="sm"
                  href={item.cvFile.url}
                  target="_blank"
                >
                  <Download class="size-3.5 mr-1.5" /> CV
                </Button>
              {/if}
            </div>

            <button
              type="button"
              class="w-full text-left"
              onclick={() =>
                (expandedId = expandedId === item.id ? null : item.id)}
            >
              <div
                class="flex items-center gap-1 text-xs text-primary font-bold"
              >
                <ChevronDown
                  class="size-3.5 transition-transform {expandedId === item.id
                    ? 'rotate-180'
                    : ''}"
                />
                {expandedId === item.id ? "Hide details" : "View details"}
              </div>
            </button>

            {#if expandedId === item.id}
              <div class="space-y-3 pt-2 border-t border-border/30">
                {#if item.coverLetter}
                  <div>
                    <p
                      class="text-[9px] font-bold uppercase tracking-widest text-primary mb-1"
                    >
                      Cover Letter
                    </p>
                    <div
                      class="text-sm leading-relaxed rounded-lg bg-background/50 p-3 border border-border/50 prose prose-sm max-w-none dark:prose-invert"
                    >
                      {@html item.coverLetter}
                    </div>
                  </div>
                {/if}
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    href="mailto:{item.email}"
                  >
                    <Mail class="size-3.5 mr-1.5" /> Email
                  </Button>
                  <form
                    method="POST"
                    action="?/delete"
                    use:enhance={() => {
                      return async ({ result }) => {
                        if (result.type === "success")
                          toast.success("Application deleted");
                      };
                    }}
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <Button variant="destructive" size="sm" type="submit">
                      <Trash2 class="size-3.5 mr-1.5" /> Delete
                    </Button>
                  </form>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </Card.Root>
</div>
