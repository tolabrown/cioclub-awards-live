<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import {
    HeartHandshake,
    Search,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    Eye,
    Trash2,
    Mail,
    Phone,
    Calendar,
    Check,
    X,
    UserCheck,
    Sparkles,
    Filter,
  } from "@lucide/svelte";

  let { data } = $props();

  let selectedApp = $state<any>(null);
  let isDetailOpen = $state(false);
  let searchInput = $state(data.filters?.q || "");
  let statusFilter = $state(data.filters?.status || "all");

  function openDetail(app: any) {
    selectedApp = app;
    isDetailOpen = true;
  }

  function handleFilterChange(newStatus: string) {
    statusFilter = newStatus;
    const url = new URL(page.url);
    if (newStatus === "all") {
      url.searchParams.delete("status");
    } else {
      url.searchParams.set("status", newStatus);
    }
    url.searchParams.set("page", "1");
    goto(url.toString(), { keepFocus: true });
  }

  function handleSearchSubmit(e: Event) {
    e.preventDefault();
    const url = new URL(page.url);
    if (searchInput.trim()) {
      url.searchParams.set("q", searchInput.trim());
    } else {
      url.searchParams.delete("q");
    }
    url.searchParams.set("page", "1");
    goto(url.toString(), { keepFocus: true });
  }

  function parseHelpAreas(jsonStr: string): string[] {
    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [jsonStr];
    } catch {
      return [jsonStr];
    }
  }

  function exportCSV() {
    if (!data.applications || data.applications.length === 0) return;

    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Age Range",
      "Help Areas",
      "Other Help Area",
      "Status",
      "Previous Experience",
      "Full Day Available",
      "Briefing Available",
      "About Candidate",
      "Why Volunteer",
      "Submitted At"
    ];

    const rows = data.applications.map((app: any) => [
      `"${app.firstName.replace(/"/g, '""')}"`,
      `"${app.lastName.replace(/"/g, '""')}"`,
      `"${app.email}"`,
      `"${app.phone}"`,
      `"${app.ageRange}"`,
      `"${parseHelpAreas(app.helpAreas).join(", ").replace(/"/g, '""')}"`,
      `"${(app.helpAreasOther || "").replace(/"/g, '""')}"`,
      `"${app.status || "pending"}"`,
      `"${app.hasPreviousExperience ? "Yes" : "No"}"`,
      `"${app.availableFullDay ? "Yes" : "No"}"`,
      `"${app.availableBriefing ? "Yes" : "No"}"`,
      `"${(app.aboutYourself || "").replace(/"/g, '""')}"`,
      `"${(app.whyVolunteer || "").replace(/"/g, '""')}"`,
      `"${new Date(app.createdAt).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `volunteer_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "accepted":
        return { label: "Accepted", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      case "reviewed":
        return { label: "Reviewed", class: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
      case "declined":
        return { label: "Declined", class: "bg-rose-500/10 text-rose-600 border-rose-500/20" };
      default:
        return { label: "Pending", class: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
    }
  }
</script>

<div class="flex-1 space-y-6 pt-6">
  <!-- Header Title -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
    <div>
      <h2 class="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
        <HeartHandshake class="size-8 text-amber-500" />
        Volunteer Applications
      </h2>
      <p class="text-muted-foreground text-sm font-medium mt-1">
        Review, manage and coordinate volunteer applications for The CIO & C-Suite Awards Africa 2026.
      </p>
    </div>
    <div class="flex items-center gap-3">
      <Button
        variant="outline"
        onclick={exportCSV}
        disabled={!data.applications || data.applications.length === 0}
        class="gap-2 font-bold rounded-xl shadow-xs"
      >
        <Download class="size-4" />
        Export CSV
      </Button>
    </div>
  </div>

  <!-- Metric Overview Cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="rounded-2xl border border-border/50 bg-card p-5 shadow-xs flex items-center gap-4">
      <div class="size-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
        <HeartHandshake class="size-6" />
      </div>
      <div>
        <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Applications</p>
        <p class="text-2xl font-black text-foreground mt-0.5">{data.stats.total}</p>
      </div>
    </div>

    <div class="rounded-2xl border border-border/50 bg-card p-5 shadow-xs flex items-center gap-4">
      <div class="size-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
        <Clock class="size-6" />
      </div>
      <div>
        <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Review</p>
        <p class="text-2xl font-black text-foreground mt-0.5">{data.stats.pending}</p>
      </div>
    </div>

    <div class="rounded-2xl border border-border/50 bg-card p-5 shadow-xs flex items-center gap-4">
      <div class="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
        <CheckCircle2 class="size-6" />
      </div>
      <div>
        <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Accepted</p>
        <p class="text-2xl font-black text-foreground mt-0.5">{data.stats.accepted}</p>
      </div>
    </div>

    <div class="rounded-2xl border border-border/50 bg-card p-5 shadow-xs flex items-center gap-4">
      <div class="size-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
        <UserCheck class="size-6" />
      </div>
      <div>
        <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reviewed</p>
        <p class="text-2xl font-black text-foreground mt-0.5">{data.stats.reviewed}</p>
      </div>
    </div>
  </div>

  <!-- Search & Filter Controls -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 border border-border/40 rounded-2xl p-4 shadow-xs">
    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors {statusFilter === 'all' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}"
        onclick={() => handleFilterChange('all')}
      >
        All ({data.stats.total})
      </button>
      <button
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors {statusFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}"
        onclick={() => handleFilterChange('pending')}
      >
        Pending ({data.stats.pending})
      </button>
      <button
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors {statusFilter === 'accepted' ? 'bg-emerald-500 text-white font-extrabold shadow-xs' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}"
        onclick={() => handleFilterChange('accepted')}
      >
        Accepted ({data.stats.accepted})
      </button>
      <button
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors {statusFilter === 'reviewed' ? 'bg-blue-500 text-white font-extrabold shadow-xs' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}"
        onclick={() => handleFilterChange('reviewed')}
      >
        Reviewed ({data.stats.reviewed})
      </button>
      <button
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors {statusFilter === 'declined' ? 'bg-rose-500 text-white font-extrabold shadow-xs' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}"
        onclick={() => handleFilterChange('declined')}
      >
        Declined ({data.stats.declined})
      </button>
    </div>

    <form onsubmit={handleSearchSubmit} class="relative flex-1 max-w-sm">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        type="text"
        bind:value={searchInput}
        placeholder="Search candidate name, email, phone..."
        class="pl-10 h-10 rounded-xl bg-background border-border/60 text-sm"
      />
    </form>
  </div>

  <!-- Applications Table -->
  <div class="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xs">
    <Table.Root>
      <Table.Header>
        <Table.Row class="bg-muted/30 hover:bg-muted/30">
          <Table.Head class="font-extrabold text-foreground text-xs uppercase tracking-wider py-4">Candidate</Table.Head>
          <Table.Head class="font-extrabold text-foreground text-xs uppercase tracking-wider py-4">Contact</Table.Head>
          <Table.Head class="font-extrabold text-foreground text-xs uppercase tracking-wider py-4">Age Range</Table.Head>
          <Table.Head class="font-extrabold text-foreground text-xs uppercase tracking-wider py-4">Help Areas</Table.Head>
          <Table.Head class="font-extrabold text-foreground text-xs uppercase tracking-wider py-4">Status</Table.Head>
          <Table.Head class="font-extrabold text-foreground text-xs uppercase tracking-wider py-4">Applied Date</Table.Head>
          <Table.Head class="text-right font-extrabold text-foreground text-xs uppercase tracking-wider py-4">Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if !data.applications || data.applications.length === 0}
          <Table.Row>
            <Table.Cell colspan={7} class="text-center py-16 text-muted-foreground">
              <div class="size-16 rounded-2xl bg-muted/40 text-muted-foreground flex items-center justify-center mx-auto mb-3">
                <HeartHandshake class="size-8 opacity-60" />
              </div>
              <p class="text-base font-bold text-foreground">No volunteer applications found</p>
              <p class="text-xs text-muted-foreground mt-1">Applications submitted on the Awards site will appear here.</p>
            </Table.Cell>
          </Table.Row>
        {:else}
          {#each data.applications as app}
            {@const badge = getStatusBadge(app.status || 'pending')}
            {@const areas = parseHelpAreas(app.helpAreas)}
            <Table.Row class="hover:bg-muted/20 transition-colors">
              <!-- Candidate Name -->
              <Table.Cell class="font-bold text-foreground py-4">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-full bg-primary/10 text-primary font-black text-sm flex items-center justify-center shrink-0">
                    {app.firstName[0]}{app.lastName[0]}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-foreground leading-snug">{app.firstName} {app.lastName}</p>
                    {#if app.hasPreviousExperience}
                      <span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <Sparkles class="size-2.5" /> Experienced Volunteer
                      </span>
                    {/if}
                  </div>
                </div>
              </Table.Cell>

              <!-- Contact -->
              <Table.Cell class="py-4">
                <div class="space-y-1 text-xs">
                  <a href="mailto:{app.email}" class="flex items-center gap-1.5 text-foreground hover:text-primary font-medium">
                    <Mail class="size-3 text-muted-foreground shrink-0" />
                    <span class="truncate max-w-[180px]">{app.email}</span>
                  </a>
                  <a href="tel:{app.phone}" class="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                    <Phone class="size-3 text-muted-foreground shrink-0" />
                    <span>{app.phone}</span>
                  </a>
                </div>
              </Table.Cell>

              <!-- Age Range -->
              <Table.Cell class="py-4">
                <Badge variant="outline" class="text-xs font-bold rounded-lg bg-muted/40">
                  {app.ageRange}
                </Badge>
              </Table.Cell>

              <!-- Help Areas -->
              <Table.Cell class="py-4 max-w-[240px]">
                <div class="flex flex-wrap gap-1">
                  {#each areas.slice(0, 2) as area}
                    <Badge variant="secondary" class="text-[10px] font-medium px-2 py-0.5 rounded-md truncate max-w-[140px]">
                      {area}
                    </Badge>
                  {/each}
                  {#if areas.length > 2}
                    <Badge variant="outline" class="text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      +{areas.length - 2} more
                    </Badge>
                  {/if}
                </div>
              </Table.Cell>

              <!-- Status -->
              <Table.Cell class="py-4">
                <Badge variant="outline" class="text-xs font-extrabold px-2.5 py-1 rounded-full border {badge.class}">
                  {badge.label}
                </Badge>
              </Table.Cell>

              <!-- Applied Date -->
              <Table.Cell class="text-xs text-muted-foreground font-medium py-4">
                {new Date(app.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              </Table.Cell>

              <!-- Actions -->
              <Table.Cell class="text-right py-4">
                <div class="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 px-2.5 rounded-lg text-xs font-bold gap-1.5"
                    onclick={() => openDetail(app)}
                  >
                    <Eye class="size-3.5" /> View
                  </Button>
                  <form method="POST" action="?/delete" use:enhance class="inline">
                    <input type="hidden" name="id" value={app.id} />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="submit"
                      class="size-8 text-destructive hover:bg-destructive/10 rounded-lg"
                      onclick={(e) => {
                        if (!confirm(`Are you sure you want to delete ${app.firstName}'s application?`)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 class="size-3.5" />
                    </Button>
                  </form>
                </div>
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
</div>

<!-- Detailed Candidate View Modal -->
<Dialog.Root bind:open={isDetailOpen}>
  <Dialog.Content class="sm:max-w-[620px] p-6 max-h-[90vh] overflow-y-auto rounded-2xl">
    {#if selectedApp}
      {@const areas = parseHelpAreas(selectedApp.helpAreas)}
      {@const badge = getStatusBadge(selectedApp.status || 'pending')}
      
      <Dialog.Header>
        <div class="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div class="flex items-center gap-3">
            <div class="size-12 rounded-2xl bg-amber-500/10 text-amber-600 font-black text-lg flex items-center justify-center shrink-0">
              {selectedApp.firstName[0]}{selectedApp.lastName[0]}
            </div>
            <div>
              <Dialog.Title class="text-2xl font-black text-foreground">
                {selectedApp.firstName} {selectedApp.lastName}
              </Dialog.Title>
              <p class="text-xs text-muted-foreground font-medium">
                Submitted on {new Date(selectedApp.createdAt).toLocaleString("en-NG")}
              </p>
            </div>
          </div>
          <Badge variant="outline" class="text-xs font-extrabold px-3 py-1 rounded-full border {badge.class}">
            {badge.label}
          </Badge>
        </div>
      </Dialog.Header>

      <div class="space-y-6 py-4 text-sm">
        <!-- Contact Grid -->
        <div class="grid grid-cols-2 gap-3 bg-muted/30 p-4 rounded-xl border border-border/40">
          <div>
            <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address</span>
            <a href="mailto:{selectedApp.email}" class="text-sm font-bold text-primary hover:underline break-all mt-0.5 block">
              {selectedApp.email}
            </a>
          </div>
          <div>
            <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Phone / WhatsApp</span>
            <a href="tel:{selectedApp.phone}" class="text-sm font-bold text-foreground hover:underline mt-0.5 block">
              {selectedApp.phone}
            </a>
          </div>
          <div>
            <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Age Range</span>
            <span class="text-sm font-bold text-foreground mt-0.5 block">{selectedApp.ageRange}</span>
          </div>
          <div>
            <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Prior Volunteer Exp.</span>
            <span class="text-sm font-bold text-foreground mt-0.5 block">{selectedApp.hasPreviousExperience ? "Yes" : "No"}</span>
          </div>
        </div>

        <!-- Help Areas -->
        <div class="space-y-2">
          <span class="text-xs font-extrabold text-foreground uppercase tracking-wider block">Selected Help Areas</span>
          <div class="flex flex-wrap gap-2">
            {#each areas as area}
              <Badge variant="secondary" class="px-3 py-1 rounded-lg font-bold text-xs">
                {area}
              </Badge>
            {/each}
            {#if selectedApp.helpAreasOther}
              <Badge variant="outline" class="px-3 py-1 rounded-lg font-bold text-xs border-amber-500/30 bg-amber-500/10 text-amber-600">
                Other: {selectedApp.helpAreasOther}
              </Badge>
            {/if}
          </div>
        </div>

        <!-- Availability -->
        <div class="space-y-2">
          <span class="text-xs font-extrabold text-foreground uppercase tracking-wider block">Event Day Availability</span>
          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-2 p-3 rounded-xl border border-border/40 bg-card">
              {#if selectedApp.availableFullDay}
                <Check class="size-4 text-emerald-500 shrink-0" />
              {:else}
                <X class="size-4 text-rose-500 shrink-0" />
              {/if}
              <span class="text-xs font-bold">Full Day (Tue 27 Oct 2026)</span>
            </div>
            <div class="flex items-center gap-2 p-3 rounded-xl border border-border/40 bg-card">
              {#if selectedApp.availableBriefing}
                <Check class="size-4 text-emerald-500 shrink-0" />
              {:else}
                <X class="size-4 text-rose-500 shrink-0" />
              {/if}
              <span class="text-xs font-bold">Pre-Event Briefing Session</span>
            </div>
          </div>
        </div>

        <!-- About Candidate -->
        <div class="space-y-2">
          <span class="text-xs font-extrabold text-foreground uppercase tracking-wider block">About Candidate & Background</span>
          <div class="p-4 rounded-xl bg-muted/40 border border-border/40 text-foreground leading-relaxed whitespace-pre-wrap">
            {selectedApp.aboutYourself}
          </div>
        </div>

        <!-- Why Volunteer -->
        <div class="space-y-2">
          <span class="text-xs font-extrabold text-foreground uppercase tracking-wider block">Why Volunteer Statement</span>
          <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-foreground leading-relaxed whitespace-pre-wrap">
            {selectedApp.whyVolunteer}
          </div>
        </div>

        <!-- Status Actions Bar -->
        <div class="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span class="text-xs font-bold text-muted-foreground">Change Status:</span>
          <div class="flex flex-wrap items-center gap-2">
            <form method="POST" action="?/updateStatus" use:enhance>
              <input type="hidden" name="id" value={selectedApp.id} />
              <input type="hidden" name="status" value="accepted" />
              <Button size="sm" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-1">
                <CheckCircle2 class="size-3.5" /> Accept Candidate
              </Button>
            </form>
            <form method="POST" action="?/updateStatus" use:enhance>
              <input type="hidden" name="id" value={selectedApp.id} />
              <input type="hidden" name="status" value="reviewed" />
              <Button size="sm" variant="outline" class="font-bold rounded-xl gap-1">
                <UserCheck class="size-3.5" /> Mark Reviewed
              </Button>
            </form>
            <form method="POST" action="?/updateStatus" use:enhance>
              <input type="hidden" name="id" value={selectedApp.id} />
              <input type="hidden" name="status" value="declined" />
              <Button size="sm" variant="outline" class="text-rose-600 hover:bg-rose-500/10 font-bold rounded-xl gap-1">
                <XCircle class="size-3.5" /> Decline
              </Button>
            </form>
          </div>
        </div>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
