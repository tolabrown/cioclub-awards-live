<script lang="ts">
  import { onMount } from "svelte";
  import {
    Users,
    Search,
    Plus,
    Edit2,
    Trash2,
    User,
    Loader2,
    Linkedin,
    Mail,
    X,
    ImageIcon,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Card from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import { toast } from "svelte-sonner";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import SectionWrapper from "./SectionWrapper.svelte";
  import { resizeImage } from "$lib/authentication/imageresize";
  import { dndzone, type DndEvent } from "svelte-dnd-action";

  let { onchange = () => {} } = $props();

  let innerWidth = $state(0);
  let isMobile = $derived(innerWidth < 768);

  let members = $state<any[]>([]);
  let isLoading = $state(true);
  let isSubmitting = $state(false);
  let isReordering = $state(false);
  let searchTerm = $state("");
  let typeFilter = $state("");

  let isModalOpen = $state(false);
  let memberToEdit = $state<any>(null);
  let uploadingImage = $state(false);
  let deletingImage = $state(false);

  // Reordering flag - only allow reordering if no filters are active
  const canReorder = $derived(!searchTerm && !typeFilter);

  const teamTypeOptions = [
    { label: "Executive Team", value: "executive" },
    { label: "Board of Directors", value: "leadership" },
  ];

  async function fetchMembers() {
    isLoading = true;
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (typeFilter) params.append("type", typeFilter);

      const response = await fetch(`/api/admin/team?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        members = result.results;
      }
    } catch (error) {
      toast.error("Failed to fetch team members");
    } finally {
      isLoading = false;
    }
  }

  onMount(fetchMembers);

  $effect(() => {
    const debounced = setTimeout(fetchMembers, 300);
    return () => clearTimeout(debounced);
  });

  function handleDndConsider(e: CustomEvent<DndEvent<any>>) {
    members = e.detail.items;
  }

  async function handleDndFinalize(e: CustomEvent<DndEvent<any>>) {
    members = e.detail.items;
    await saveNewOrder();
  }

  async function saveNewOrder() {
    if (isReordering) return;
    isReordering = true;

    // Create the items for reordering
    const items = members.map((m, index) => ({
      id: m.id,
      displayOrder: index,
    }));

    try {
      const response = await fetch("/api/admin/team/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Team order saved");
        if (onchange) onchange();
      } else {
        toast.error(result.error || "Failed to save order");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    } finally {
      isReordering = false;
    }
  }

  function openModal(member: any = null) {
    memberToEdit = member
      ? { ...member }
      : {
          name: "",
          role: "",
          bio: "",
          type: "executive",
          linkedinUrl: "",
          imageId: "",
          imageUrl: "",
        };
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    memberToEdit = null;
  }

  async function onImageUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length || !memberToEdit) return;

    const file = input.files[0];
    uploadingImage = true;

    try {
      // Resize/Compress image before upload
      const resizedFile = await resizeImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.8,
      });

      const formData = new FormData();
      formData.append("file", resizedFile);

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        memberToEdit.imageUrl = result.url;
        memberToEdit.imageId = result.id; // result.id is now the database UUID from the file table
        toast.success("Image uploaded and optimized");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      uploadingImage = false;
      input.value = "";
    }
  }

  async function handleDeleteImage() {
    if (!memberToEdit?.imageId) return;
    deletingImage = true;
    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        body: JSON.stringify({ id: memberToEdit.imageId }),
      });
      if (response.ok) {
        memberToEdit.imageUrl = "";
        memberToEdit.imageId = "";
        toast.success("Image removed");
      }
    } catch (error) {
      toast.error("Failed to remove image");
    } finally {
      deletingImage = false;
    }
  }

  async function handleSaveMember(e: Event) {
    if (!memberToEdit) return;
    e.preventDefault();
    isSubmitting = true;
    try {
      const response = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberToEdit),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        closeModal();
        fetchMembers();
        if (onchange) onchange();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error saving member");
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDeleteMember(id: string) {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      const response = await fetch("/api/admin/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        toast.success("Member deleted");
        fetchMembers();
        if (onchange) onchange();
      }
    } catch (error) {
      toast.error("Error deleting member");
    }
  }
</script>

<svelte:window bind:innerWidth />

<SectionWrapper
  id="team-members"
  title="Team Members"
  description="Manage your board of directors and executive leadership team"
  icon={Users}
>
  {#snippet headerAction()}
    <Button
      variant="outline"
      size="sm"
      onclick={() => openModal()}
      class="gap-2 rounded-lg text-primary border-primary/20 hover:bg-primary/10"
    >
      <Plus class="size-4" /> Add Member
    </Button>
  {/snippet}

  <div class="space-y-6">
    <!-- Search & Filter Bar -->
    <div class="flex flex-col md:flex-row gap-4">
      <div class="relative flex-1">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
        />
        <Input
          bind:value={searchTerm}
          placeholder="Search team members..."
          class="pl-10 h-11 rounded-xl border-border/50 focus:ring-primary/20"
        />
      </div>
      <div class="flex items-center gap-2 w-full md:w-[200px]">
        <SelectComponent
          name="type"
          placeholder="All Types"
          options={[{ label: "All Types", value: "" }, ...teamTypeOptions]}
          bind:value={typeFilter}
          class="rounded-xl border-border/50"
        />
      </div>
    </div>

    <!-- Members List -->
    {#if isLoading}
      <div class="flex justify-center p-20">
        <Loader2 class="size-8 animate-spin text-primary/50" />
      </div>
    {:else}
      <div
        class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        use:dndzone={{
          items: members,
          flipDurationMs: 200,
          dragDisabled: !canReorder,
        }}
        onconsider={handleDndConsider}
        onfinalize={handleDndFinalize}
      >
        {#each members as member (member.id)}
          <div class="w-full h-full animate-in fade-in duration-300">
            <button
              type="button"
              onclick={() => openModal(member)}
              class="group relative overflow-hidden rounded-2xl border bg-card/30 text-left transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex flex-col aspect-square w-full {canReorder
                ? 'cursor-grab active:cursor-grabbing'
                : ''}"
            >
              <!-- Image Section -->
              <div class="relative overflow-hidden bg-muted w-full h-full">
                {#if member.imageUrl}
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                {:else}
                  <div
                    class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-transparent"
                  >
                    <User class="h-12 w-12 text-primary/20" />
                  </div>
                {/if}

                <!-- Gradient Overlay -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                ></div>

                <!-- Reorder Handle Hint -->
                {#if canReorder}
                  <div
                    class="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div
                      class="p-1 rounded bg-white/10 backdrop-blur-sm border border-white/10"
                    >
                      <svg
                        class="size-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><circle cx="9" cy="5" r="1" /><circle
                          cx="9"
                          cy="12"
                          r="1"
                        /><circle cx="9" cy="19" r="1" /><circle
                          cx="15"
                          cy="5"
                          r="1"
                        /><circle cx="15" cy="12" r="1" /><circle
                          cx="15"
                          cy="19"
                          r="1"
                        /></svg
                      >
                    </div>
                  </div>
                {/if}

                <!-- Hover Action Buttons -->
                <div
                  class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Button
                    variant="secondary"
                    size="icon"
                    class="size-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/10 hover:bg-white/40"
                    onclick={(e) => {
                      e.stopPropagation();
                      openModal(member);
                    }}
                  >
                    <Edit2 class="size-4 text-white" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    class="size-8 rounded-lg"
                    onclick={(e) => {
                      e.stopPropagation();
                      handleDeleteMember(member.id);
                    }}
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </div>

              <!-- Content Overlay -->
              <div
                class="absolute bottom-0 left-0 w-full p-4 pointer-events-none"
              >
                <h3
                  class="font-bold leading-tight line-clamp-1 text-base text-white"
                >
                  {member.name}
                </h3>
                <p class="text-[10px] text-white/70 line-clamp-1 mb-2">
                  {member.role}
                </p>
                <div class="flex items-center gap-2">
                  <span
                    class="text-[9px] font-bold uppercase tracking-widest text-white/90 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/10"
                  >
                    {member.type === "leadership" ? "Board" : "Executive"}
                  </span>
                </div>
              </div>
            </button>
          </div>
        {/each}

        {#if members.length === 0}
          <div
            class="col-span-full flex flex-col items-center justify-center p-20 text-muted-foreground bg-accent/5 rounded-2xl border-2 border-dashed"
          >
            <Users class="size-12 mb-4 opacity-20" />
            <p class="font-bold uppercase tracking-widest text-xs">
              No members found
            </p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</SectionWrapper>

{#snippet memberForm()}
  {#if memberToEdit}
    <form onsubmit={handleSaveMember} class="p-5 md:p-6 space-y-3 bg-card">
      <div class="grid gap-4">
        <!-- Image Upload Area -->
        <div class="space-y-2">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Profile Image</Label
          >
          <div class="flex items-center gap-4">
            <div
              class="relative size-20 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0 group"
            >
              {#if uploadingImage || deletingImage}
                <div
                  class="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-sm"
                >
                  <Loader2 class="size-5 animate-spin text-primary" />
                </div>
              {/if}
              {#if memberToEdit.imageUrl}
                <img
                  src={memberToEdit.imageUrl}
                  alt="Profile"
                  class="w-full h-full object-cover"
                />
              {:else}
                <div class="flex flex-col items-center gap-1 p-3 text-center">
                  <ImageIcon
                    class="size-5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors"
                  />
                  <span
                    class="text-[7px] text-muted-foreground font-medium line-clamp-1"
                    >Upload Image</span
                  >
                </div>
                <input
                  type="file"
                  accept="image/*"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                  onchange={onImageUpload}
                />
              {/if}
            </div>
            <div class="space-y-1.5">
              {#if memberToEdit.imageUrl}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  class="h-8 px-3 gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/20 rounded-lg text-xs"
                  onclick={handleDeleteImage}
                >
                  <X class="size-3" /> Remove Photo
                </Button>
              {/if}
              <p class="text-[9px] text-muted-foreground leading-tight">
                Recommended: 500x500px square.
              </p>
            </div>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-1.5">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Full Name</Label
            >
            <Input
              bind:value={memberToEdit.name}
              placeholder="e.g. Abiola Laseinde"
              class="h-9 rounded-lg"
              required
            />
          </div>
          <div class="space-y-1.5">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Team Type</Label
            >
            <SelectComponent
              name="type"
              placeholder="Select type"
              options={teamTypeOptions}
              bind:value={memberToEdit.type}
              class="h-9 rounded-lg"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Official Role</Label
          >
          <Input
            bind:value={memberToEdit.role}
            placeholder="e.g. CEO & Founder"
            class="h-9 rounded-lg"
            required
          />
        </div>

        <div class="space-y-1.5">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Short Bio</Label
          >
          <Textarea
            bind:value={memberToEdit.bio}
            placeholder="A brief professional summary..."
            rows={2}
            class="rounded-lg resize-none text-xs"
          />
        </div>

        <div class="space-y-1.5">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >LinkedIn URL</Label
          >
          <div class="relative">
            <Linkedin
              class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
            <Input
              bind:value={memberToEdit.linkedinUrl}
              placeholder="https://linkedin.com/in/..."
              class="h-9 pl-9 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      <div class="pt-4 flex gap-3">
        <Button
          variant="ghost"
          type="button"
          class="flex-1 h-10 rounded-lg text-xs"
          onclick={closeModal}>Cancel</Button
        >
        <Button
          type="submit"
          class="flex-1 h-10 rounded-lg uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10"
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <Loader2 class="size-4 animate-spin mr-2" /> Saving...
          {:else}
            Save Member Details
          {/if}
        </Button>
      </div>
    </form>
  {/if}
{/snippet}

{#snippet header()}
  <div
    class="bg-primary p-5 md:p-6 text-primary-foreground relative overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:20px_20px] opacity-20"
    ></div>
    <div class="relative z-10">
      <h3 class="text-lg md:text-xl font-bold tracking-tight">
        {memberToEdit?.id ? "Edit Team Member" : "Add New Member"}
      </h3>
      <p
        class="text-primary-foreground/70 text-[10px] mt-0.5 uppercase tracking-wider font-semibold"
      >
        Member Configuration
      </p>
    </div>
  </div>
{/snippet}

{#if !isMobile}
  <Dialog.Root bind:open={isModalOpen}>
    <Dialog.Content
      class="sm:max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-2xl z-90"
    >
      {@render header()}
      <div class="max-h-[70vh] overflow-y-auto">
        {@render memberForm()}
      </div>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open={isModalOpen}>
    <Drawer.Content class="max-h-[90vh] z-90">
      <div class="overflow-y-auto">
        {@render header()}
        {@render memberForm()}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}
