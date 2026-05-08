<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { SearchableSelect } from "$lib/components/ui/searchable-select";
  import type { iAttendee, iChild, iFile, iMeeting } from "$lib/interface";
  import { Loader2 } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import { calculateAgeGroup } from "$lib/utils";

  import { onMount } from "svelte";
  import { editors, Role } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "$lib/components/ui/tabs";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "$lib/components/ui/avatar";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";

  interface Props {
    attendee?: iAttendee;
    mode?: "create" | "edit";
    onSuccess?: () => void;
  }

  let { attendee, mode = "create", onSuccess }: Props = $props();

  let meetings = $state<iMeeting[]>([]);
  let loadingData = $state(true);
  let loading = $state(false);
  let formError = $state<string | null>(null);
  let user = page.data.user as User;

  // Mode
  let entryMode = $state<"single" | "family">("single");

  // Family Mode State
  let parentId = $state("");
  let selectedParent = $state<any>(null);
  let familyChildren = $state<iChild[]>([]);
  let selectedFamilyChildren = $state<Set<string>>(new Set());
  let loadingFamily = $state(false);

  // Form State
  let childId = $state(
    attendee?.child
      ? typeof attendee.child === "string"
        ? attendee.child
        : attendee.child.id
      : "",
  );

  // Initialize selectedChild from prop if available as object
  let selectedChild = $state<iChild | null>(
    attendee?.child && typeof attendee.child === "object"
      ? (attendee.child as iChild)
      : null,
  );

  // If we have an ID but no object, fetch it on mount
  onMount(async () => {
    try {
      const meetingsRes = await fetch("/api/meetings?limit=1000");
      const meetingsData = await meetingsRes.json();
      if (meetingsData.data) meetings = meetingsData.data;
    } catch (error) {
      console.error("Failed to load meetings:", error);
      toast.error("Failed to load meetings");
    } finally {
      loadingData = false;
    }

    if (childId && !selectedChild) {
      try {
        const res = await fetch(`/api/children/${childId}`);
        const result = await res.json();
        if (result.data) selectedChild = result.data;
      } catch (error) {
        console.error("Failed to load selected child:", error);
      }
    }
  });

  let meetingId = $state(
    attendee?.meeting
      ? typeof attendee.meeting === "string"
        ? attendee.meeting
        : attendee.meeting.id
      : "",
  );
  let notes = $state(attendee?.notes || "");

  // Derived
  let selectedMeeting = $derived(meetings.find((m) => m.id === meetingId));

  // Transform selectedMeeting to match SearchableSelect's Item interface
  let selectedMeetingItem = $derived(
    selectedMeeting
      ? {
          ...selectedMeeting,
          name: selectedMeeting.type,
          description: new Date(selectedMeeting.datetime).toLocaleDateString(
            "en-US",
            {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            },
          ),
          image:
            selectedMeeting.image && typeof selectedMeeting.image === "object"
              ? { url: selectedMeeting.image.url }
              : null,
        }
      : null,
  );

  // Transform selectedChild to match SearchableSelect's Item interface
  let selectedChildItem = $derived(
    selectedChild
      ? {
          ...selectedChild,
          image:
            selectedChild.image && typeof selectedChild.image === "object"
              ? { url: selectedChild.image.url }
              : null,
        }
      : null,
  );

  // Fetch functions for SearchableSelect components
  async function fetchChildren(query: string) {
    try {
      const res = await fetch(`/api/children?search=${query}&limit=20`);
      const result = await res.json();
      if (result.data) {
        // Add description field for age group display
        return result.data.map((child: iChild) => ({
          ...child,
          description: child.ageGroup || calculateAgeGroup(child.dateOfBirth),
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch children:", error);
      return [];
    }
  }

  async function fetchMeetings(query: string) {
    try {
      const res = await fetch(`/api/meetings?search=${query}&limit=100`);
      const result = await res.json();
      if (result.data) {
        // Add description field for datetime display
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

  async function fetchParents(query: string) {
    try {
      const res = await fetch(`/api/parents?search=${query}&limit=20`);
      const result = await res.json();
      if (result.data) {
        return result.data.map((p: any) => ({
          ...p,
          description: p.phone,
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch parents:", error);
      return [];
    }
  }

  async function fetchFamilyChildren(pId: string) {
    if (!pId) return;
    loadingFamily = true;
    try {
      const res = await fetch(`/api/parents/${pId}/children`);
      const result = await res.json();
      if (result.status === "success" && result.data) {
        familyChildren = result.data;
        // Auto select all initially? Yes, simpler.
        selectedFamilyChildren = new Set(familyChildren.map((c) => c.id));
      } else {
        familyChildren = [];
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load children for this parent");
    } finally {
      loadingFamily = false;
    }
  }

  function handleChildSelect(item: { id: string } | null) {
    selectedChild = item as iChild | null;
    childId = item?.id || "";
  }

  function handleMeetingSelect(item: { id: string } | null) {
    meetingId = item?.id || "";
  }

  function handleParentSelect(item: { id: string } | null) {
    selectedParent = item;
    parentId = item?.id || "";
    if (parentId) {
      fetchFamilyChildren(parentId);
    } else {
      familyChildren = [];
      selectedFamilyChildren = new Set();
    }
  }

  const toggleFamilyChild = (cId: string) => {
    const newset = new Set(selectedFamilyChildren);
    if (newset.has(cId)) {
      newset.delete(cId);
    } else {
      newset.add(cId);
    }
    selectedFamilyChildren = newset;
  };

  const toggleAllFamily = () => {
    if (selectedFamilyChildren.size === familyChildren.length) {
      selectedFamilyChildren = new Set();
    } else {
      selectedFamilyChildren = new Set(familyChildren.map((c) => c.id));
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!editors.includes(user.role as Role)) {
      toast.error("You do not have permission to perform this action");
      return;
    }

    if (!meetingId) {
      toast.error("Please select a meeting");
      return;
    }

    loading = true;
    formError = null;

    try {
      if (entryMode === "single") {
        if (!childId) {
          throw new Error("Please select a child");
        }

        const payload = {
          child: childId,
          meeting: meetingId,
          notes,
        };

        const url =
          mode === "create"
            ? "/api/attendees"
            : `/api/attendees/${attendee?.id}`;
        const method = mode === "create" ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (result.status === "error") {
          throw new Error(result.message);
        }

        toast.success(
          `Attendance ${mode === "create" ? "recorded" : "updated"} successfully`,
        );
        if (onSuccess) onSuccess();
        else if (mode === "create") {
          // Reset child but keep meeting for single mode too?
          // Typically user might want to add another child to same meeting
          childId = "";
          selectedChild = null;
          // Keep meetingId
        } else goto("/attendees");
      } else {
        // Family Mode
        if (selectedFamilyChildren.size === 0) {
          throw new Error("Please select at least one child");
        }

        const res = await fetch("/api/attendees/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingId,
            childIds: Array.from(selectedFamilyChildren),
            notes,
          }),
        });

        const result = await res.json();

        if (result.status === "error") {
          throw new Error(result.message);
        }

        toast.success(result.message || "Family attendees added successfully");

        // Reset for next family
        parentId = "";
        selectedParent = null;
        familyChildren = [];
        selectedFamilyChildren = new Set();
        // Keep meetingId selected
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Something went wrong";
      formError = errorMessage;
      toast.error(errorMessage);
    } finally {
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6 w-full">
  {#if mode === "create"}
    <Tabs
      value={entryMode}
      onValueChange={(v) => (entryMode = v as "single" | "family")}
      class="w-full"
    >
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="single">Single Entry</TabsTrigger>
        <TabsTrigger value="family">By Family</TabsTrigger>
      </TabsList>
    </Tabs>
  {/if}

  <div class="grid gap-6 w-full md:grid-cols-2">
    <!-- Meeting Selection (Shared) -->
    <SearchableSelect
      bind:value={meetingId}
      label="Meeting"
      placeholder="Search meeting..."
      entityName="Meeting"
      fetchOptions={fetchMeetings}
      initialItem={selectedMeetingItem}
      onSelect={handleMeetingSelect}
      class={mode === "edit"
        ? "pointer-events-none opacity-60 md:col-span-2"
        : "md:col-span-2"}
    />

    {#if entryMode === "single"}
      <!-- Child Selection -->
      <SearchableSelect
        bind:value={childId}
        label="Child"
        placeholder="Search child by name..."
        entityName="Child"
        fetchOptions={fetchChildren}
        initialItem={selectedChildItem}
        onSelect={handleChildSelect}
        class={mode === "edit"
          ? "pointer-events-none opacity-60 md:col-span-2"
          : "md:col-span-2"}
      />
    {:else}
      <!-- Parent Selection -->
      <SearchableSelect
        bind:value={parentId}
        label="Family (Parent Source)"
        placeholder="Search parent by name..."
        entityName="Parent"
        fetchOptions={fetchParents}
        onSelect={handleParentSelect}
        class="md:col-span-2"
      />

      <!-- Family Children Table -->
      {#if parentId || loadingFamily}
        <div class="md:col-span-2 border rounded-md overflow-hidden">
          {#if loadingFamily}
            <div class="flex justify-center p-8">
              <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          {:else if familyChildren.length === 0}
            <div class="text-center p-8 text-muted-foreground">
              No children found for this parent.
            </div>
          {:else}
            <div
              class="bg-muted/30 p-2 border-b flex justify-between items-center"
            >
              <span class="text-sm font-medium">Children to Add</span>
              <Button
                variant="ghost"
                size="sm"
                class="h-auto py-1 text-xs"
                onclick={toggleAllFamily}
              >
                {selectedFamilyChildren.size === familyChildren.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <Table>
              <TableBody>
                {#each familyChildren as child (child.id)}
                  <TableRow
                    class="cursor-pointer hover:bg-muted/50"
                    onclick={() => toggleFamilyChild(child.id)}
                  >
                    <TableCell class="w-[50px]">
                      <Checkbox
                        checked={selectedFamilyChildren.has(child.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center gap-3">
                        <Avatar class="h-8 w-8">
                          <AvatarImage
                            src={(child.image as iFile)?.url}
                            alt={child.name}
                          />
                          <AvatarFallback
                            >{getInitials(child.name)}</AvatarFallback
                          >
                        </Avatar>
                        <div>
                          <div class="font-medium">{child.name}</div>
                          <div class="text-xs text-muted-foreground">
                            {child.ageGroup || "N/A"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          {/if}
        </div>
      {/if}
    {/if}

    <!-- Notes -->
    <div class="space-y-2 md:col-span-2">
      <Label>Notes (Optional)</Label>
      <Textarea
        bind:value={notes}
        placeholder="Add any additional notes about the attendance..."
        rows={4}
      />
    </div>

    {#if formError}
      <div
        class="md:col-span-2 p-4 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm"
      >
        <p class="font-medium">Error</p>
        <p>{formError}</p>
      </div>
    {/if}
  </div>

  <div class="flex justify-end gap-4">
    <Button type="button" variant="outline" href="/attendees">Cancel</Button>
    <Button type="submit" disabled={loading}>
      {#if loading}
        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      {/if}
      {mode === "create"
        ? entryMode === "single"
          ? "Record Attendance"
          : `Add ${selectedFamilyChildren.size} Attendees`
        : "Update Attendance"}
    </Button>
  </div>
</form>
