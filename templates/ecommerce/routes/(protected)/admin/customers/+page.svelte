<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Users } from "@lucide/svelte";
  import * as Table from "$lib/components/ui/table";
  import { format } from "date-fns";
  import { Badge } from "$lib/components/ui/badge";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const { users, total, search } = $derived(data);
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <h1 class="text-3xl font-bold tracking-tight">Customers</h1>
    <p class="text-muted-foreground">
      Manage your customer base, view profiles, and monitor activity.
    </p>
  </div>

  <div class="flex items-center gap-4">
    <form class="relative flex-1 max-w-sm">
      <Input
        name="search"
        value={search}
        placeholder="Search names or emails..."
        class="pl-10"
      />
      <Users
        class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
      />
    </form>
    <div class="ml-auto flex items-center gap-2">
      <Badge variant="outline" class="h-9 px-4">{total} Total Customers</Badge>
    </div>
  </div>

  <div class="rounded-md border bg-card overflow-hidden">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Customer</Table.Head>
          <Table.Head>Role</Table.Head>
          <Table.Head>Joined</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head class="text-right">Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each users as user}
          <Table.Row>
            <Table.Cell>
              <div class="flex flex-col">
                <span class="font-medium">{user.name}</span>
                <span class="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </Table.Cell>
            <Table.Cell>
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
                class="capitalize"
              >
                {user.role}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <span class="text-sm"
                >{format(new Date(user.createdAt), "MMM dd, yyyy")}</span
              >
            </Table.Cell>
            <Table.Cell>
              {#if user.banned}
                <Badge variant="destructive">Banned</Badge>
              {:else if user.emailVerified}
                <Badge variant="outline" class="text-green-600 border-green-600"
                  >Verified</Badge
                >
              {:else}
                <Badge variant="outline">Unverified</Badge>
              {/if}
            </Table.Cell>
            <Table.Cell class="text-right">
              <Button
                variant="ghost"
                size="sm"
                href="/admin/customers/{user.id}">View Details</Button
              >
            </Table.Cell>
          </Table.Row>
        {/each}
        {#if users.length === 0}
          <Table.Row>
            <Table.Cell colspan={5} class="h-24 text-center">
              No customers found.
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </div>
</div>
