<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Star,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Loader2,
    Package,
  } from "@lucide/svelte";
  import * as Table from "$lib/components/ui/table";
  import { format } from "date-fns";
  import { Badge } from "$lib/components/ui/badge";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const { reviews } = $derived(data);

  let processingId = $state<string | null>(null);
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <h1 class="text-3xl font-bold tracking-tight">Reviews</h1>
    <p class="text-muted-foreground">
      Monitor customer feedback and moderate product reviews.
    </p>
  </div>

  <div class="rounded-xl border bg-card overflow-hidden">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Product</Table.Head>
          <Table.Head>Customer</Table.Head>
          <Table.Head>Rating</Table.Head>
          <Table.Head>Comment</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head class="text-right">Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each reviews as item (item.review.id)}
          <Table.Row>
            <Table.Cell class="font-medium max-w-[200px] truncate">
              {item.productName}
            </Table.Cell>
            <Table.Cell>{item.userName}</Table.Cell>
            <Table.Cell>
              <div class="flex items-center gap-1">
                <Star class="size-3.5 fill-yellow-400 text-yellow-400" />
                <span>{item.review.rating}</span>
              </div>
            </Table.Cell>
            <Table.Cell class="max-w-[300px] whitespace-normal">
              <p class="text-sm line-clamp-2" title={item.review.comment}>
                {item.review.comment}
              </p>
            </Table.Cell>
            <Table.Cell>
              {#if item.review.isApproved}
                <Badge
                  variant="outline"
                  class="text-emerald-600 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                  >Approved</Badge
                >
              {:else}
                <Badge
                  variant="outline"
                  class="text-amber-600 border-amber-600 bg-amber-50 dark:bg-amber-950/20"
                  >Pending</Badge
                >
              {/if}
            </Table.Cell>
            <Table.Cell class="text-right">
              <div class="flex justify-end gap-2">
                {#if !item.review.isApproved}
                  <form
                    method="POST"
                    action="?/approve"
                    use:enhance={() => {
                      processingId = item.review.id;
                      return async ({ result }) => {
                        processingId = null;
                        if (result.type === "success") {
                          toast.success("Review approved");
                          await invalidateAll();
                        } else {
                          toast.error("Failed to approve review");
                        }
                      };
                    }}
                  >
                    <input type="hidden" name="id" value={item.review.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      class="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      disabled={processingId === item.review.id}
                    >
                      {#if processingId === item.review.id}
                        <Loader2 class="size-4 mr-1 animate-spin" />
                      {:else}
                        <CheckCircle2 class="size-4 mr-1" />
                      {/if}
                      Approve
                    </Button>
                  </form>
                {:else}
                  <form
                    method="POST"
                    action="?/reject"
                    use:enhance={() => {
                      processingId = item.review.id;
                      return async ({ result }) => {
                        processingId = null;
                        if (result.type === "success") {
                          toast.success("Review rejected");
                          await invalidateAll();
                        } else {
                          toast.error("Failed to reject review");
                        }
                      };
                    }}
                  >
                    <input type="hidden" name="id" value={item.review.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      class="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={processingId === item.review.id}
                    >
                      {#if processingId === item.review.id}
                        <Loader2 class="size-4 mr-1 animate-spin" />
                      {:else}
                        <XCircle class="size-4 mr-1" />
                      {/if}
                      Reject
                    </Button>
                  </form>
                {/if}
              </div>
            </Table.Cell>
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell
              colspan={6}
              class="h-32 text-center text-muted-foreground"
            >
              <MessageSquare class="size-8 mx-auto mb-2 opacity-20" />
              No reviews found.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
