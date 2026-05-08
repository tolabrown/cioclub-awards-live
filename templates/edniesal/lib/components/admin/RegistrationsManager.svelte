<script lang="ts">
  import { onMount } from "svelte";
  import {
    Search,
    Download,
    Filter,
    ArrowLeft,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    UserCircle2,
    Mail,
    Building2,
    CreditCard,
    ChevronDown,
    Trash2,
    Briefcase,
    Globe,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { toast } from "svelte-sonner";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";

  let registrations = $state<any[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");
  let filterEvent = $state("");
  let events = $state<any[]>([]);
  let expandedId = $state<string | null>(null);

  const selectOptions = $derived([
    { label: "All Events", value: "" },
    ...events.map((e) => ({ label: e.title, value: e.id })),
  ]);

  async function fetchRegistrations() {
    isLoading = true;
    try {
      const url = new URL(
        "/api/admin/ladies-in-tech/registrations",
        window.location.origin,
      );
      if (searchQuery) url.searchParams.set("search", searchQuery);
      if (filterEvent) url.searchParams.set("eventId", filterEvent);

      const response = await fetch(url);
      if (response.ok) {
        registrations = await response.json();
      } else {
        toast.error("Failed to load registrations");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    } finally {
      isLoading = false;
    }
  }

  async function fetchEvents() {
    try {
      const response = await fetch("/api/admin/ladies-in-tech");
      if (response.ok) {
        const data = await response.json();
        events = data.results || [];
      }
    } catch (error) {}
  }

  onMount(() => {
    fetchEvents();
    fetchRegistrations();
  });

  function exportData() {
    const headers = [
      "Date",
      "Event",
      "Name",
      "Email",
      "Phone",
      "Country",
      "Org",
      "Designation",
      "Category",
      "Amount",
      "Status",
      "Payment Ref",
    ];
    const rows = registrations.map((reg) => [
      new Date(reg.createdAt).toLocaleDateString(),
      reg.eventName,
      `${reg.firstName} ${reg.lastName}`,
      reg.email,
      reg.phone,
      reg.country,
      reg.organization,
      reg.designation,
      reg.category,
      reg.amount,
      reg.status,
      reg.paymentRef,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `registrations_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
  }
</script>

<div class="space-y-6 pt-4">
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold uppercase tracking-tighter">
        Event Registrations
      </h1>
      <p
        class="text-xs font-bold text-muted-foreground uppercase tracking-widest"
      >
        Manage Ladies in Tech & Leadership Attendees
      </p>
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        onclick={exportData}
        class="rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 shadow-sm"
      >
        <Download class="size-3.5" /> Export CSV
      </Button>
      <Button
        variant="outline"
        onclick={fetchRegistrations}
        class="rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 shadow-sm"
      >
        <RefreshCw class="size-3.5 {isLoading ? 'animate-spin' : ''}" /> Refresh
      </Button>
    </div>
  </div>

  <!-- Filters -->
  <Card.Root
    class="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden"
  >
    <Card.Content class="p-4 grid md:grid-cols-3 gap-4">
      <div class="relative">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
        />
        <Input
          bind:value={searchQuery}
          placeholder="Search by name, email, organization..."
          onkeydown={(e) => e.key === "Enter" && fetchRegistrations()}
          class="h-10 pl-10 rounded-xl bg-background/50 border-border/50 text-sm"
        />
      </div>
      <SelectComponent
        name="eventFilter"
        placeholder="All Events"
        options={selectOptions}
        bind:value={filterEvent}
        onValueChange={() => fetchRegistrations()}
        class="h-10 bg-background/50 border-border/50"
      />
      <Button
        onclick={fetchRegistrations}
        class="h-10 rounded-xl font-bold uppercase tracking-widest text-xs"
      >
        Filter Results
      </Button>
    </Card.Content>
  </Card.Root>

  <!-- Table -->
  <Card.Root
    class="border-border/50 bg-card/40 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden min-h-[400px]"
  >
    <Table.Root>
      <Table.Header class="bg-muted/30">
        <Table.Row class="hover:bg-transparent border-border/50">
          <Table.Head
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Attendee</Table.Head
          >
          <Table.Head
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Event</Table.Head
          >
          <Table.Head
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Package</Table.Head
          >
          <Table.Head
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Amount</Table.Head
          >
          <Table.Head
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center"
            >Status</Table.Head
          >
          <Table.Head
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right border-l border-border/50"
            >Details</Table.Head
          >
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if isLoading}
          <Table.Row>
            <Table.Cell colspan={6} class="text-center py-20">
              <RefreshCw
                class="size-8 text-primary/30 animate-spin mx-auto mb-2"
              />
              <p
                class="text-xs font-bold text-muted-foreground uppercase tracking-widest italic"
              >
                Loading attendee data...
              </p>
            </Table.Cell>
          </Table.Row>
        {:else if registrations.length === 0}
          <Table.Row>
            <Table.Cell colspan={6} class="text-center py-20">
              <Clock class="size-8 text-muted-foreground/20 mx-auto mb-2" />
              <p
                class="text-xs font-bold text-muted-foreground uppercase tracking-widest italic"
              >
                No registrations found
              </p>
            </Table.Cell>
          </Table.Row>
        {:else}
          {#each registrations as reg}
            <Table.Row
              class="border-border/50 group hover:bg-primary/5 transition-colors cursor-pointer {expandedId ===
              reg.id
                ? 'bg-primary/5'
                : ''}"
              onclick={() =>
                (expandedId = expandedId === reg.id ? null : reg.id)}
            >
              <Table.Cell>
                <div class="flex items-center gap-3">
                  <div
                    class="size-9 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0 border border-pink-500/20"
                  >
                    <UserCircle2 class="size-5 text-pink-600" />
                  </div>
                  <div class="space-y-0.5">
                    <p class="font-bold text-sm leading-none">
                      {reg.firstName}
                      {reg.lastName}
                    </p>
                    <p
                      class="text-[10px] font-medium text-muted-foreground flex items-center gap-1 italic"
                    >
                      <Mail class="size-2.5" />
                      {reg.email}
                    </p>
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell>
                <p class="font-bold text-xs uppercase tracking-tight">
                  {reg.eventName}
                </p>
                <p
                  class="text-[9px] font-bold text-muted-foreground tracking-widest opacity-60"
                >
                  {new Date(reg.createdAt).toLocaleDateString()}
                </p>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  variant="outline"
                  class="rounded-lg text-[9px] font-bold uppercase tracking-widest border-primary/20 bg-primary/5 text-primary"
                >
                  {reg.category === "package"
                    ? "Full Experience"
                    : "Conf. Pass"}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <div class="flex items-center gap-1 font-bold text-xs">
                  <span class="text-pink-600">$</span>{reg.amount}
                </div>
              </Table.Cell>
              <Table.Cell class="text-center">
                {#if reg.status === "success"}
                  <Badge
                    class="bg-emerald-500/10 text-emerald-600 border-none rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                    >Confirmed</Badge
                  >
                {:else if reg.status === "failed"}
                  <Badge
                    class="bg-rose-500/10 text-rose-600 border-none rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                    >Failed</Badge
                  >
                {:else}
                  <Badge
                    class="bg-amber-500/10 text-amber-600 border-none rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                    >Pending</Badge
                  >
                {/if}
              </Table.Cell>
              <Table.Cell class="text-right border-l border-border/50">
                <div class="flex items-center justify-end gap-2">
                  <div class="space-y-1 text-right">
                    {#if reg.organization}
                      <div
                        class="flex items-center justify-end gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest"
                      >
                        <Building2 class="size-2.5" />
                        {reg.organization}
                      </div>
                    {/if}
                    <div
                      class="flex items-center justify-end gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest"
                    >
                      <Globe class="size-2.5" />
                      {reg.country}
                    </div>
                  </div>
                  <ChevronDown
                    class="size-4 text-muted-foreground transition-transform {expandedId ===
                    reg.id
                      ? 'rotate-180'
                      : ''}"
                  />
                </div>
              </Table.Cell>
            </Table.Row>

            {#if expandedId === reg.id}
              <Table.Row class="bg-muted/30 border-none">
                <Table.Cell colspan={6} class="p-8">
                  <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <!-- Personal Details -->
                    <div class="space-y-4">
                      <h4
                        class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
                      >
                        Attendee Details
                      </h4>
                      <div class="space-y-3">
                        <div
                          class="bg-background/50 rounded-xl p-3 border border-border/50 flex items-center gap-3"
                        >
                          <UserCircle2 class="size-4 text-primary" />
                          <div>
                            <p
                              class="text-[8px] font-bold uppercase text-muted-foreground tracking-widest"
                            >
                              Full Name
                            </p>
                            <p class="text-xs font-bold">
                              {reg.firstName}
                              {reg.lastName}
                            </p>
                          </div>
                        </div>
                        <div
                          class="bg-background/50 rounded-xl p-3 border border-border/50 flex items-center gap-3"
                        >
                          <Mail class="size-4 text-primary" />
                          <div>
                            <p
                              class="text-[8px] font-bold uppercase text-muted-foreground tracking-widest"
                            >
                              Email Address
                            </p>
                            <p class="text-xs font-bold">{reg.email}</p>
                          </div>
                        </div>
                        <div
                          class="bg-background/50 rounded-xl p-3 border border-border/50 flex items-center gap-3"
                        >
                          <Briefcase class="size-4 text-primary" />
                          <div>
                            <p
                              class="text-[8px] font-bold uppercase text-muted-foreground tracking-widest"
                            >
                              Designation
                            </p>
                            <p class="text-xs font-bold">
                              {reg.designation || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Organization & Location -->
                    <div class="space-y-4">
                      <h4
                        class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
                      >
                        Employment & Origin
                      </h4>
                      <div class="space-y-3">
                        <div
                          class="bg-background/50 rounded-xl p-3 border border-border/50 flex items-center gap-3"
                        >
                          <Building2 class="size-4 text-primary" />
                          <div>
                            <p
                              class="text-[8px] font-bold uppercase text-muted-foreground tracking-widest"
                            >
                              Organization
                            </p>
                            <p class="text-xs font-bold">
                              {reg.organization || "Private Individual"}
                            </p>
                          </div>
                        </div>
                        <div
                          class="bg-background/50 rounded-xl p-3 border border-border/50 flex items-center gap-3"
                        >
                          <Globe class="size-4 text-primary" />
                          <div>
                            <p
                              class="text-[8px] font-bold uppercase text-muted-foreground tracking-widest"
                            >
                              Country
                            </p>
                            <p class="text-xs font-bold">{reg.country}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Payment Info -->
                    <div class="space-y-4">
                      <h4
                        class="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-600"
                      >
                        Payment Verification
                      </h4>
                      <div class="space-y-3">
                        <div
                          class="bg-background/50 rounded-xl p-3 border border-border/50 flex items-center gap-3"
                        >
                          <CreditCard class="size-4 text-pink-600" />
                          <div>
                            <p
                              class="text-[8px] font-bold uppercase text-muted-foreground tracking-widest"
                            >
                              Reference Number
                            </p>
                            <p class="text-xs font-mono font-bold">
                              {reg.paymentRef || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div
                          class="bg-background/50 rounded-xl p-3 border border-border/50 flex items-center gap-3"
                        >
                          <Clock class="size-4 text-pink-600" />
                          <div>
                            <p
                              class="text-[8px] font-bold uppercase text-muted-foreground tracking-widest"
                            >
                              Registration Date
                            </p>
                            <p class="text-xs font-bold">
                              {new Date(reg.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
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
