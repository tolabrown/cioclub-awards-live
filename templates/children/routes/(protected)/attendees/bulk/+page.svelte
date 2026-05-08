<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { SearchableSelect } from "$lib/components/ui/searchable-select";
  import {
    Loader2,
    Search,
    Users,
    ChevronLeft,
    CheckSquare,
    Square,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import type { iChild, iFile, iMeeting } from "$lib/interface";
  import { calculateAgeGroup } from "$lib/utils";
  import {
    Avatar,
    AvatarImage,
    AvatarFallback,
  } from "$lib/components/ui/avatar";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";

  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";

  // State
  let loading = $state(false);
  let submitting = $state(false);
  let children = $state<iChild[]>([]);
  let selectedChildren = $state<Set<string>>(new Set());
  let searchInput = $state("");
  let meetingId = $state("");
  let meetingDetails = $state<any>(null);

  // Fetch functions
  async function fetchChildren(query: string = "") {
    loading = true;
    try {
      // Fetch more children for bulk selection (limit 50 initally)
      const res = await fetch(`/api/children?limit=50&search=${query}`);
      const result = await res.json();
      if (result.data) {
        children = result.data;
      }
    } catch (error) {
      console.error("Failed to fetch children:", error);
      toast.error("Failed to load children");
    } finally {
      loading = false;
    }
  }

  async function fetchMeetings(query: string) {
    try {
      const res = await fetch(`/api/meetings?search=${query}&limit=20`);
      const result = await res.json();
      if (result.data) {
        return result.data.map((meeting: iMeeting) => ({
          ...meeting,
          name: meeting.type,
          description: new Date(meeting.datetime).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
      return [];
    }
  }

  // Handlers
  let timeout: NodeJS.Timeout;
  const handleSearch = (value: string) => {
    searchInput = value;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fetchChildren(value);
    }, 500);
  };

  const handleMeetingSelect = (item: any) => {
    meetingId = item?.id || "";
    meetingDetails = item;
  };

  const toggleChild = (childId: string) => {
    const newset = new Set(selectedChildren);
    if (newset.has(childId)) {
      newset.delete(childId);
    } else {
      newset.add(childId);
    }
    selectedChildren = newset;
  };

  const toggleAll = () => {
    if (selectedChildren.size === children.length) {
      selectedChildren = new Set();
    } else {
      selectedChildren = new Set(children.map((c) => c.id));
    }
  };

  const handleSubmit = async () => {
    if (!meetingId) {
      toast.error("Please select a meeting first");
      return;
    }
    if (selectedChildren.size === 0) {
      toast.error("Please select at least one child");
      return;
    }

    submitting = true;
    try {
      const res = await fetch("/api/attendees/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId,
          childIds: Array.from(selectedChildren),
        }),
      });

      const result = await res.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      toast.success(result.message || "Attendees added successfully");

      // Clear selection but keep meeting?
      selectedChildren = new Set();

      // Optional: Add redirect or stay
      // goto("/attendees");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to add attendees");
    } finally {
      submitting = false;
    }
  };

  onMount(() => {
    fetchChildren();
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
</script>

<div class="flex flex-col gap-6 max-w-5xl mx-auto pb-20">
  <div class="flex items-center gap-4">
    <Button variant="outline" size="icon" href="/attendees">
      <ChevronLeft class="h-4 w-4" />
    </Button>
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Bulk Add Attendees</h1>
      <p class="text-muted-foreground">
        Select a meeting and add multiple children at once.
      </p>
    </div>
  </div>

  <div class="grid gap-6 md:grid-cols-[300px_1fr]">
    <!-- Sidebar / Meeting Selection -->
    <div class="flex flex-col gap-4">
      <div class="p-4 border rounded-xl bg-card space-y-4">
        <h3 class="font-semibold flex items-center gap-2">
          <Users class="h-4 w-4" />
          Select Meeting
        </h3>
        <SearchableSelect
          bind:value={meetingId}
          label=""
          placeholder="Search meeting..."
          entityName="Meeting"
          fetchOptions={fetchMeetings}
          onSelect={handleMeetingSelect}
        />
        {#if meetingDetails}
          <div class="bg-muted/50 p-3 rounded-md text-sm space-y-1">
            <p class="font-medium text-primary">{meetingDetails.name}</p>
            <p class="text-muted-foreground">{meetingDetails.description}</p>
          </div>
        {/if}
      </div>

      <div class="p-4 border rounded-xl bg-card space-y-4 sticky top-20">
        <div class="space-y-1">
          <p class="text-sm font-medium text-muted-foreground">
            Selected Children
          </p>
          <p class="text-3xl font-bold text-primary">{selectedChildren.size}</p>
        </div>
        <Button
          class="w-full"
          disabled={submitting || !meetingId || selectedChildren.size === 0}
          onclick={handleSubmit}
        >
          {#if submitting}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Adding...
          {:else}
            Add Attendees
          {/if}
        </Button>
      </div>
    </div>

    <!-- Main Content / Child Selection -->
    <div class="flex flex-col gap-4">
      <!-- Search Toolbar -->
      <div class="flex items-center gap-2 p-1">
        <div class="relative flex-1">
          <Search
            class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search children by name..."
            class="pl-9"
            value={searchInput}
            oninput={(e) => handleSearch(e.currentTarget.value)}
          />
        </div>
      </div>

      <!-- Children List -->
      <div class="rounded-xl border bg-card overflow-hidden">
        {#if loading && children.length === 0}
          <div class="flex justify-center p-12">
            <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        {:else if children.length === 0}
          <div class="text-center p-12 text-muted-foreground">
            <p>No children found</p>
          </div>
        {:else}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[50px]">
                  <Checkbox
                    checked={selectedChildren.size === children.length &&
                      children.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Child</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead class="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each children as child (child.id)}
                <TableRow
                  class="cursor-pointer hover:bg-muted/50"
                  onclick={() => toggleChild(child.id)}
                  data-state={selectedChildren.has(child.id) ? "selected" : ""}
                >
                  <TableCell class="w-[50px]">
                    <Checkbox checked={selectedChildren.has(child.id)} />
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-3">
                      <Avatar class="h-9 w-9">
                        <AvatarImage src={(child.image as iFile)?.url} alt={child.name} />
                        <AvatarFallback
                          >{getInitials(child.name)}</AvatarFallback
                        >
                      </Avatar>
                      <div class="font-medium">{child.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" class="font-normal opacity-80">
                      {child.ageGroup || calculateAgeGroup(child.dateOfBirth)}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    {#if selectedChildren.has(child.id)}
                      <span class="text-primary text-xs font-semibold"
                        >Selected</span
                      >
                    {/if}
                  </TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        {/if}
      </div>

      {#if children.length >= 50}
        <p class="text-center text-xs text-muted-foreground mt-2">
          Showing first 50 results. Use search to find specific children.
        </p>
      {/if}
    </div>
  </div>
</div>
