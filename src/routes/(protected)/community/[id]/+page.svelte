<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Avatar,
    AvatarImage,
    AvatarFallback,
  } from "$lib/components/ui/avatar";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import {
    MessageSquare,
    Heart,
    Share2,
    ArrowLeft,
    Loader2,
    Calendar,
    User as UserIcon,
  } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { cn } from "$lib/utils";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";
  import type { PageProps } from "./$types";
  import { toast } from "svelte-sonner";

  let { data }: PageProps = $props();
  let post = $derived(data.post);
  let currentUser = $derived(data.user);

  let isSubmitting = $state(false);
  let replyContent = $state("");
  let likingItems = $state<Set<string>>(new Set());

  function getInitials(name: string) {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "??"
    );
  }

  function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  function sharePost() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Post link copied to clipboard");
  }
</script>

<div class="min-h-screen bg-muted/30 pb-20 pt-32">
  <div class="container mx-auto px-4">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <a
          href="/community"
          class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
        >
          <ArrowLeft class="size-4" /> Back to Feed
        </a>
        <Badge
          class="bg-primary/10 text-primary border-none font-medium px-4 py-1"
        >
          {post.category}
        </Badge>
      </div>

      <!-- Main Post -->
      <Card
        class="rounded-3xl border-border/40 shadow-xl overflow-hidden bg-card"
      >
        <CardHeader class="p-8 pb-4">
          <div class="flex items-center gap-4">
            <Avatar class="size-14 rounded-2xl ring-4 ring-muted">
              {#if post.author.image}
                <AvatarImage src={post.author.image} />
              {/if}
              <AvatarFallback
                class="bg-primary/5 text-primary text-xl font-semibold"
              >
                {getInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-semibold tracking-tight">
                  {post.author.name}
                </h2>
                {#if post.author.role !== "user"}
                  <Badge
                    variant="secondary"
                    class="h-5 px-2 text-[10px] font-semibold bg-primary/10 text-primary border-none"
                  >
                    {post.author.role}
                  </Badge>
                {/if}
              </div>
              <p
                class="text-xs text-muted-foreground font-medium flex items-center gap-2"
              >
                <Calendar class="size-3" />
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-8 pt-4 space-y-6">
          {#if post.title}
            <h1
              class="text-2xl md:text-3xl font-bold text-foreground leading-tight"
            >
              {post.title}
            </h1>
          {/if}
          <div
            class="prose prose-invert prose-lg max-w-none text-muted-foreground font-medium leading-relaxed"
          >
            {@html post.content}
          </div>
        </CardContent>
        <CardFooter
          class="p-8 pt-4 border-t border-border/40 flex items-center justify-between"
        >
          <div class="flex items-center gap-8">
            <form
              method="POST"
              action="?/toggleLike"
              use:enhance={() => {
                likingItems.add(post.id);
                return async ({ update }) => {
                  await update();
                  likingItems.delete(post.id);
                };
              }}
            >
              <input type="hidden" name="postId" value={post.id} />
              <button
                type="submit"
                disabled={likingItems.has(post.id)}
                class={cn(
                  "flex items-center gap-3 transition-all group/btn",
                  post.likes.some((l) => l.userId === currentUser?.id)
                    ? "text-rose-500 scale-110"
                    : "text-muted-foreground hover:text-rose-500",
                )}
              >
                <div
                  class="size-10 rounded-xl flex items-center justify-center bg-muted/50 group-hover/btn:bg-rose-500/10 transition-colors"
                >
                  {#if likingItems.has(post.id)}
                    <Loader2 class="size-5 animate-spin" />
                  {:else}
                    <Heart
                      class={cn(
                        "size-6",
                        post.likes.some((l) => l.userId === currentUser?.id) &&
                          "fill-current",
                      )}
                    />
                  {/if}
                </div>
                <span class="text-sm font-semibold"
                  >{post.likes.length} Likes</span
                >
              </button>
            </form>

            <div class="flex items-center gap-3 text-muted-foreground">
              <div
                class="size-10 rounded-xl flex items-center justify-center bg-muted/50"
              >
                <MessageSquare class="size-6" />
              </div>
              <span class="text-sm font-semibold"
                >{post.replies.length} Replies</span
              >
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            class="rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
            onclick={sharePost}
          >
            <Share2 class="size-5" />
          </Button>
        </CardFooter>
      </Card>

      <!-- Reply Section -->
      <div class="space-y-8 pt-8">
        <h3 class="text-xl font-bold text-white flex items-center gap-3">
          <MessageSquare class="size-7 text-primary" />
          Discussion
        </h3>

        <!-- New Reply Form -->
        <Card
          class="rounded-3xl border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden border-dashed"
        >
          <CardContent class="p-8">
            <form
              method="POST"
              action="?/createReply"
              use:enhance={() => {
                isSubmitting = true;
                return async ({ update }) => {
                  await update();
                  isSubmitting = false;
                  replyContent = "";
                };
              }}
              class="space-y-4"
            >
              <div class="flex gap-4">
                <Avatar
                  class="size-12 rounded-2xl ring-2 ring-primary/10 shrink-0"
                >
                  {#if currentUser.image}
                    <AvatarImage src={currentUser.image} />
                  {/if}
                  <AvatarFallback
                    class="bg-primary/5 text-primary font-semibold"
                  >
                    {getInitials(currentUser?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <div class="flex-1 space-y-4">
                  <RichEditor
                    bind:value={replyContent}
                    class="min-h-[150px] bg-background/50"
                  />
                  <input type="hidden" name="content" value={replyContent} />
                  <div class="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !replyContent}
                      class="px-8 font-semibold text-xs h-12 rounded-xl active:scale-95 transition-all"
                    >
                      {#if isSubmitting}
                        <Loader2 class="size-4 animate-spin mr-2" />
                        Replying...
                      {:else}
                        Post Reply
                      {/if}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- Replies List -->
        <div class="space-y-6">
          {#each post.replies as reply}
            <div class="flex gap-4 group">
              <Avatar
                class="size-12 rounded-2xl ring-2 ring-muted shrink-0 group-hover:ring-primary/20 transition-all"
              >
                {#if reply.author.image}
                  <AvatarImage src={reply.author.image} />
                {/if}
                <AvatarFallback class="bg-muted text-sm font-semibold">
                  {getInitials(reply.author.name)}
                </AvatarFallback>
              </Avatar>
              <div
                class="flex-1 space-y-3 p-6 rounded-2xl bg-card border border-border/40 group-hover:border-primary/20 transition-all shadow-sm"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <h4 class="font-semibold text-white">
                      {reply.author.name}
                    </h4>
                    {#if reply.author.role !== "user"}
                      <Badge
                        variant="secondary"
                        class="h-4 px-1.5 text-[8px] font-semibold bg-primary/5 text-primary border-none"
                      >
                        {reply.author.role}
                      </Badge>
                    {/if}
                  </div>
                  <span class="text-[10px] text-muted-foreground font-medium">
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                <div
                  class="prose prose-invert prose-sm max-w-none text-muted-foreground font-medium leading-relaxed"
                >
                  {@html reply.content}
                </div>
              </div>
            </div>
          {/each}
          {#if post.replies.length === 0}
            <div
              class="text-center py-12 space-y-4 bg-muted/20 rounded-3xl border border-dashed border-border/40"
            >
              <MessageSquare class="size-12 mx-auto text-muted-foreground/20" />
              <p class="text-muted-foreground font-medium italic">
                No replies yet. Start the conversation!
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
