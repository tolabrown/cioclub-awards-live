<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { iParent } from "$lib/interface";
  import { toast } from "svelte-sonner";
  import LoadingSpinner from "$lib/authentication/ui/loading-spinner.svelte";
  import SelectComponent, {
    type iSelect,
  } from "$lib/components/ui/select/select-component.svelte";
  import { goto } from "$app/navigation";
  import * as Card from "$lib/components/ui/card";

  interface Props {
    parent?: iParent;
  }

  let { parent }: Props = $props();

  const isEditing = !!parent;

  // Form state
  let name = $state(parent?.name || "");
  let phone = $state(parent?.phone || "");
  let email = $state(parent?.email || "");
  let parentType = $state(parent?.parentType || "");

  let isLoading = $state(false);

  const parentTypeOptions: iSelect[] = [
    { label: "Father", value: "father" },
    { label: "Mother", value: "mother" },
    { label: "Guardian", value: "guardian" },
  ];

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    isLoading = true;

    try {
      if (!name.trim()) {
        toast.error("Parent name is required");
        return;
      }

      if (!phone.trim()) {
        toast.error("Phone number is required");
        return;
      }

      if (!parentType) {
        toast.error("Parent type is required");
        return;
      }

      const parentData = {
        name,
        phone,
        email: email || null,
        parentType,
      };

      const url = isEditing ? `/api/parents/${parent.id}` : "/api/parents";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parentData),
      });

      const result = await response.json();

      if (result.status === "error") {
        throw new Error(result.message);
      }

      toast.success(
        isEditing
          ? "Parent updated successfully"
          : "Parent created successfully",
      );

      goto("/parents");
    } catch (error: any) {
      console.error("Failed to save parent:", error);
      toast.error(error.message || "Failed to save parent");
    } finally {
      isLoading = false;
    }
  };
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <Card.Root>
    <Card.Header>
      <Card.Title>Parent Information</Card.Title>
      <Card.Description>Enter the parent's details</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="space-y-2">
        <Label for="name">Full Name *</Label>
        <Input
          id="name"
          bind:value={name}
          placeholder="e.g., John Doe"
          required
        />
      </div>

      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            bind:value={phone}
            placeholder="e.g., +234 800 000 0000"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            bind:value={email}
            placeholder="e.g., john@example.com"
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label for="parentType">Parent Type *</Label>
        <SelectComponent
          options={parentTypeOptions}
          bind:value={parentType}
          placeholder="Select type"
          name="parentType"
        />
      </div>

      {#if isEditing && parent?.children && parent.children.length > 0}
        <div class="space-y-2">
          <Label>Children</Label>
          <div class="rounded-lg border p-4">
            <div class="space-y-2">
              {#each parent.children as child}
                <div class="flex items-center gap-3">
                  {#if child.image && typeof child.image === "object"}
                    <img
                      src={child.image.url}
                      alt={child.name}
                      class="h-10 w-10 rounded-full object-cover"
                    />
                  {:else}
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium"
                    >
                      {child.name.charAt(0)}
                    </div>
                  {/if}
                  <div class="flex-1">
                    <p class="font-medium">{child.name}</p>
                    {#if child.ageGroup}
                      <p class="text-sm text-muted-foreground">
                        {child.ageGroup}
                      </p>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <!-- Actions -->
  <div class="flex flex-col gap-3 sm:flex-row">
    <Button
      type="button"
      variant="outline"
      href="/parents"
      disabled={isLoading}
    >
      Cancel
    </Button>
    <Button type="submit" disabled={isLoading}>
      {#if isLoading}
        <LoadingSpinner class="mr-2" />
        Saving...
      {:else}
        {isEditing ? "Update Parent" : "Create Parent"}
      {/if}
    </Button>
  </div>
</form>
