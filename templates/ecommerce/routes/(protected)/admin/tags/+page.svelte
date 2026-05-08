<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Tag, Plus, Search, Trash2, Edit2, Loader2 } from "@lucide/svelte";
  import * as Table from "$lib/components/ui/table";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Select from "$lib/components/ui/select";
  import { Badge } from "$lib/components/ui/badge";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const { tags } = $derived(data);

  let isDialogOpen = $state(false);
  let isSubmitting = $state(false);
  let isDeleting = $state<string | null>(null);

  let editingTag = $state<any>(null);
  let tagName = $state("");
  let tagType = $state("");
  let tagColor = $state("#3b82f6");

  function openCreateDialog() {
    editingTag = null;
    tagName = "";
    tagType = "general";
    tagColor = "#3b82f6";
    isDialogOpen = true;
  }

  function openEditDialog(tag: any) {
    editingTag = tag;
    tagName = tag.name;
    tagType = tag.type || "general";
    tagColor = tag.color || "#3b82f6";
    isDialogOpen = true;
  }
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Product Tags</h1>
      <Button onclick={openCreateDialog}
        ><Plus class="size-4 mr-2" /> Create Tag</Button
      >
    </div>
    <p class="text-muted-foreground">
      Manage product labels and categorization tags.
    </p>
  </div>

  <div class="rounded-md border bg-card overflow-hidden">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>ID</Table.Head>
          <Table.Head>Type</Table.Head>
          <Table.Head>Usage</Table.Head>
          <Table.Head class="text-right">Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each tags as tag}
          <Table.Row>
            <Table.Cell class="font-medium">
              <div class="flex items-center gap-2">
                <div
                  class="size-3 rounded-full"
                  style="background-color: {tag.color || '#ccc'}"
                ></div>
                {tag.name}
              </div>
            </Table.Cell>
            <Table.Cell
              ><code class="text-xs bg-muted px-1.5 py-0.5 rounded"
                >{tag.id}</code
              ></Table.Cell
            >
            <Table.Cell>
              <Badge variant="secondary" class="capitalize">{tag.type}</Badge>
            </Table.Cell>
            <Table.Cell>
              <span class="text-sm">{tag.productCount} products</span>
            </Table.Cell>
            <Table.Cell class="text-right">
              <div class="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onclick={() => openEditDialog(tag)}
                >
                  <Edit2 class="size-4" />
                </Button>
                <form
                  method="POST"
                  action="?/delete"
                  use:enhance={() => {
                    isDeleting = tag.id;
                    return async ({ result }) => {
                      isDeleting = null;
                      if (result.type === "success") {
                        toast.success("Tag deleted successfully");
                        await invalidateAll();
                      } else {
                        toast.error("Failed to delete tag");
                      }
                    };
                  }}
                >
                  <input type="hidden" name="id" value={tag.id} />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="submit"
                    class="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isDeleting === tag.id}
                  >
                    {#if isDeleting === tag.id}
                      <Loader2 class="size-4 animate-spin" />
                    {:else}
                      <Trash2 class="size-4" />
                    {/if}
                  </Button>
                </form>
              </div>
            </Table.Cell>
          </Table.Row>
        {/each}
        {#if tags.length === 0}
          <Table.Row>
            <Table.Cell colspan={5} class="h-24 text-center">
              No tags found.
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
</div>

<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{editingTag ? "Edit Tag" : "Create Tag"}</Dialog.Title>
    </Dialog.Header>
    <form
      method="POST"
      action="?/save"
      use:enhance={() => {
        isSubmitting = true;
        return async ({ result }) => {
          isSubmitting = false;
          if (result.type === "success") {
            isDialogOpen = false;
            toast.success(
              `Tag ${editingTag ? "updated" : "created"} successfully`,
            );
            await invalidateAll();
          } else {
            toast.error("Failed to save tag");
          }
        };
      }}
      class="space-y-4 pt-4"
    >
      {#if editingTag}
        <input type="hidden" name="id" value={editingTag.id} />
      {/if}
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input
          id="name"
          name="name"
          bind:value={tagName}
          placeholder="e.g. New Arrival"
          required
        />
      </div>
      <div class="space-y-2">
        <Label for="type">Type</Label>
        <Select.Root type="single" name="type" bind:value={tagType}>
          <Select.Trigger>
            <span class="capitalize">{tagType || "Select type"}</span>
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="general">General</Select.Item>
            <Select.Item value="promotion">Promotion</Select.Item>
            <Select.Item value="style">Style</Select.Item>
            <Select.Item value="material">Material</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
      <div class="space-y-2">
        <Label for="color">Color</Label>
        <div class="flex items-center gap-3">
          <Input
            id="color"
            name="color"
            type="color"
            bind:value={tagColor}
            class="h-10 w-20 p-1"
          />
          <Input bind:value={tagColor} placeholder="#000000" class="flex-1" />
        </div>
      </div>
      <Dialog.Footer>
        <Button
          type="button"
          variant="outline"
          onclick={() => (isDialogOpen = false)}>Cancel</Button
        >
        <Button type="submit" disabled={isSubmitting}>
          {#if isSubmitting}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Saving...
          {:else}
            Save Tag
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
