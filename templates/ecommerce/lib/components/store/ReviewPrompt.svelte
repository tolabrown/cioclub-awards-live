<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { Star, X, MessageSquareQuote } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Label } from "$lib/components/ui/label";
  import { toast } from "svelte-sonner";
  import { slide } from "svelte/transition";

  let pendingReviews = $state<any[]>([]);
  let showNotification = $state(false);
  let selectedProduct = $state<any>(null);
  let isSubmitting = $state(false);
  let rating = $state(5);
  let comment = $state("");

  onMount(async () => {
    try {
      const res = await fetch("/api/reviews/pending");
      const result = await res.json();
      if (result.status === "success" && result.data.length > 0) {
        pendingReviews = result.data;
        // Check if user dismissed this session
        const dismissed = sessionStorage.getItem("review_dismissed");
        if (!dismissed) {
          showNotification = true;
        }
      }
    } catch (e) {
      console.error("Failed to fetch pending reviews", e);
    }
  });

  const dismiss = () => {
    showNotification = false;
    sessionStorage.setItem("review_dismissed", "true");
  };

  const submitReview = async () => {
    if (!selectedProduct || !comment.trim()) return;
    isSubmitting = true;
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          orderId: selectedProduct.orderId,
          rating,
          comment,
        }),
      });
      const result = await res.json();
      if (result.status === "success") {
        toast.success("Thank you!", {
          description: "Your review has been submitted.",
        });
        pendingReviews = pendingReviews.filter(
          (p) => p.productId !== selectedProduct.productId,
        );
        if (pendingReviews.length === 0) showNotification = false;
        selectedProduct = null;
        comment = "";
        rating = 5;
      } else {
        throw new Error(result.message);
      }
    } catch (e: any) {
      toast.error("Error", {
        description: e.message || "Failed to submit review",
      });
    } finally {
      isSubmitting = false;
    }
  };

  const ratingLabels = ["Very Poor", "Poor", "Average", "Good", "Excellent"];
</script>

{#if showNotification && pendingReviews.length > 0}
  <div
    class="fixed bottom-20 right-4 z-40 w-full max-w-sm px-4 sm:bottom-24 sm:right-6 lg:bottom-8"
    transition:slide={{ axis: "y" }}
  >
    <Card
      class="rounded-xl border-accent bg-gradient-to-br from-primary/10 via-background to-primary/5 shadow-lg"
    >
      <CardContent class="p-4">
        <div class="flex items-start gap-4">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary"
          >
            <MessageSquareQuote class="h-5 w-5" />
          </div>
          <div class="flex-1 space-y-1">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-bold text-foreground">
                Review your purchase
              </h4>
              <button
                onclick={dismiss}
                class="text-muted-foreground hover:text-foreground"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
            <p class="text-xs leading-relaxed text-muted-foreground">
              How do you like the <span class="font-medium text-foreground"
                >{pendingReviews[0].productName}</span
              >? Your feedback helps the community!
            </p>
            <div class="flex gap-2 pt-2">
              <Button
                size="sm"
                onclick={() => (selectedProduct = pendingReviews[0])}
                >Review Now</Button
              >
              <Button size="sm" variant="ghost" onclick={dismiss}>Later</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
{/if}

<Dialog.Root
  open={!!selectedProduct}
  onOpenChange={(o) => {
    if (!o) selectedProduct = null;
  }}
>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Share your feedback</Dialog.Title>
      <Dialog.Description>
        How was your experience with {selectedProduct?.productName}?
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-6 py-4">
      <div class="flex flex-col items-center justify-center gap-3">
        <div class="flex gap-1">
          {#each Array(5) as _, i}
            <button
              type="button"
              onclick={() => (rating = i + 1)}
              class="transition-transform active:scale-90"
            >
              <Star
                class="h-8 w-8 {rating > i
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground'}"
              />
            </button>
          {/each}
        </div>
        <span class="text-xs font-bold uppercase tracking-wider text-primary">
          {ratingLabels[rating - 1]}
        </span>
      </div>

      <div class="space-y-2">
        <Label for="review-comment">Your Review</Label>
        <Textarea
          id="review-comment"
          placeholder="What did you like or dislike? How was the quality?"
          bind:value={comment}
          rows={4}
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button
        variant="outline"
        onclick={() => (selectedProduct = null)}
        disabled={isSubmitting}>Cancel</Button
      >
      <Button
        onclick={submitReview}
        disabled={isSubmitting || !comment.trim()}
        class="shadow-lg shadow-primary/20">Submit Review</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
