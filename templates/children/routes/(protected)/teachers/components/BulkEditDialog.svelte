<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import { Label } from "$lib/components/ui/label";
  import type { iTeacher } from "$lib/interface";
  import { toast } from "svelte-sonner";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";
  import SelectComponent, {
    type iSelect,
  } from "$lib/components/ui/select/select-component.svelte";
  import { Switch } from "$lib/components/ui/switch";
  import { TeacherType, Locations } from "$lib/constants";

  interface Props {
    teachers: iTeacher[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: () => void;
  }

  let { teachers, open, onOpenChange, onComplete }: Props = $props();

  let isLoading = $state(false);
  let updateType = $state(false);
  let updateLocation = $state(false);
  let updateStatus = $state(false);

  let teacherType = $state("");
  let location = $state("");
  let active = $state(true);

  const teacherTypeOptions: iSelect[] = [
    { label: TeacherType.FULL_TIME, value: TeacherType.FULL_TIME },
    { label: TeacherType.VOLUNTEER, value: TeacherType.VOLUNTEER },
    { label: TeacherType.UTILITY, value: TeacherType.UTILITY },
  ];

  const locationOptions: iSelect[] = [
    { label: Locations.APOSTOLIC_CENTER, value: Locations.APOSTOLIC_CENTER },
    { label: Locations.MAGODO_CHURCH, value: Locations.MAGODO_CHURCH },
    { label: Locations.EGBEDA_CHURCH, value: Locations.EGBEDA_CHURCH },
    { label: Locations.ISLAND_CHURCH, value: Locations.ISLAND_CHURCH },
    { label: Locations.AJEGUNLE_CHURCH, value: Locations.AJEGUNLE_CHURCH },
  ];

  const handleBulkEdit = async () => {
    isLoading = true;
    try {
      const updates: any = {};
      if (updateType) updates.teacherType = teacherType;
      if (updateLocation) updates.location = location;
      if (updateStatus) updates.active = active;

      if (Object.keys(updates).length === 0) {
        toast.error("Please select at least one field to update");
        return;
      }

      const updatePromises = teachers.map((teacher) =>
        fetch(`/api/teachers/${teacher.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }),
      );

      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter((r) => !r.ok);

      if (failedUpdates.length > 0) {
        throw new Error(`Failed to update ${failedUpdates.length} teacher(s)`);
      }

      toast.success("Success", {
        description: `Successfully updated ${teachers.length} teacher(s)`,
      });

      onComplete();
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to update teachers:", err);
      toast.error("Error", {
        description: err.message || "Failed to update teachers",
      });
    } finally {
      isLoading = false;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
    }
  };
</script>

<Dialog {open} onOpenChange={handleOpenChange}>
  <DialogContent class="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Bulk Edit Teachers</DialogTitle>
      <DialogDescription>
        Update multiple teachers at once. Select which fields to update for{" "}
        <strong>{teachers.length} teacher(s)</strong>.
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-4 py-4">
      <!-- Teacher Type -->
      <div class="flex items-start gap-3">
        <Switch id="update-type" bind:checked={updateType} class="mt-1" />
        <div class="flex-1 space-y-2">
          <Label for="update-type">Update Teacher Type</Label>
          <SelectComponent
            options={teacherTypeOptions}
            bind:value={teacherType}
            placeholder="Select type"
            disabled={!updateType}
            name="bulk-teacher-type"
          />
        </div>
      </div>

      <!-- Location -->
      <div class="flex items-start gap-3">
        <Switch
          id="update-location"
          bind:checked={updateLocation}
          class="mt-1"
        />
        <div class="flex-1 space-y-2">
          <Label for="update-location">Update Location</Label>
          <SelectComponent
            options={locationOptions}
            bind:value={location}
            placeholder="Select location"
            disabled={!updateLocation}
            name="bulk-location"
          />
        </div>
      </div>

      <!-- Status -->
      <div class="flex items-start gap-3">
        <Switch id="update-status" bind:checked={updateStatus} class="mt-1" />
        <div class="flex-1 space-y-2">
          <Label for="update-status">Update Status</Label>
          <div class="flex items-center gap-2">
            <Switch
              id="bulk-active"
              bind:checked={active}
              disabled={!updateStatus}
            />
            <Label for="bulk-active" class="text-sm">
              {active ? "Active" : "Inactive"}
            </Label>
          </div>
        </div>
      </div>

      <!-- Selected Teachers Preview -->
      <div class="rounded-lg border bg-gray-50 p-3 dark:bg-secondary">
        <p class="text-sm font-medium mb-2">Selected Teachers:</p>
        <div class="max-h-32 overflow-y-auto">
          <ul class="list-disc list-inside text-sm space-y-1">
            {#each teachers.slice(0, 5) as teacher}
              <li>{teacher.name}</li>
            {/each}
            {#if teachers.length > 5}
              <li class="text-muted-foreground">
                ...and {teachers.length - 5} more
              </li>
            {/if}
          </ul>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        class="cursor-pointer"
        onclick={() => handleOpenChange(false)}
        disabled={isLoading}
      >
        Cancel
      </Button>

      {#if isLoading}
        <Button disabled={isLoading}>
          <LoadingSpinner />
          <span>Updating...</span>
        </Button>
      {:else}
        <Button
          type="button"
          onclick={handleBulkEdit}
          disabled={isLoading}
          class="cursor-pointer"
        >
          Update {teachers.length} Teacher{teachers.length > 1 ? "s" : ""}
        </Button>
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>
