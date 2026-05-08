<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
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
    MoreHorizontal,
    Plus,
    Search,
    TrendingUp,
    Users,
    Filter,
    Loader2,
  } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import { fade, slide } from "svelte/transition";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import { cn } from "$lib/utils.js";

  let { data, form } = $props();

  let postList = $state<any[]>([]);
  $effect(() => {
    postList = data.posts || [];
  });

  const currentUser = $derived(data.user);
  const paidRoles = [
    "admin",
    "editor",
    "member_individual",
    "member_corporate",
    "executive",
    "sponsor",
    "partner",
  ];
  const isPaidMember = $derived(paidRoles.includes(currentUser?.role || ""));

  let isSubmitting = $state(false);
  let showNewPostForm = $state(false);
  let activePostId = $state<string | null>(null);

  let newPost = $state({
    title: "",
    content: "",
    category: "General",
  });

  let replyContents = $state<Record<string, string>>({});
  let likingPosts = $state<Set<string>>(new Set());

  const categoryOptions = [
    { label: "General", value: "General" },
    { label: "News", value: "News" },
    { label: "Help", value: "Help" },
    { label: "Announcement", value: "Announcement" },
  ];

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
    const d = new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  function sharePost(id?: string) {
    const url = id
      ? `${window.location.origin}/community/${id}`
      : window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }
</script>

<div class="min-h-screen bg-muted/30 pb-20">
  <!-- Hero / Header -->
  <section
    class="bg-primary pt-32 pb-20 text-primary-foreground relative overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
    ></div>
    <div class="container mx-auto px-4 relative z-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="space-y-4 max-w-2xl">
          <Badge
            variant="outline"
            class="text-primary-foreground border-primary-foreground/20 px-4 py-1 text-xs"
          >
            Community Hub
          </Badge>
          <h1 class="text-4xl lg:text-6xl font-bold tracking-tight">
            Africa's Elite <span class="italic text-accent-gold"
              >IT Network</span
            >
          </h1>
          <p
            class="text-lg text-primary-foreground/80 font-medium leading-relaxed"
          >
            Connect, collaborate, and share insights with the visionaries
            shaping the digital future of Africa.
          </p>
        </div>

        {#if isPaidMember}
          <Button
            onclick={() => (showNewPostForm = !showNewPostForm)}
            class="h-12 px-6 rounded-xl font-semibold gap-4 active:scale-95 transition-all shadow-md"
          >
            <Plus class="size-4" />
            Start a Thread
          </Button>
        {:else}
          <Button
            disabled
            class="h-12 px-6 rounded-xl font-semibold gap-4 opacity-50 cursor-not-allowed"
          >
            <Plus class="size-4" />
            Join to Post
          </Button>
        {/if}
      </div>
    </div>
  </section>

  <div class="container mx-auto px-4 -mt-10 relative z-20">
    <div class="grid lg:grid-cols-12 gap-4">
      <!-- Left Sidebar: Filters & Trending (Hidden on Mobile) -->
      <aside class="hidden lg:block lg:col-span-3 space-y-4">
        <Card class="rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader class="pb-2">
            <CardTitle
              class="text-xs font-semibold text-muted-foreground flex items-center gap-4"
            >
              <Filter class="size-4" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent class="grid gap-1 px-1">
            {#each ["All Discussions", "Announcements", "Tech Insights", "Help & Advice", "Networking"] as cat}
              <button
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-left"
              >
                <div class="size-2 rounded-full bg-primary/40"></div>
                {cat}
              </button>
            {/each}
          </CardContent>
        </Card>

        <Card class="rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader class="pb-4">
            <CardTitle
              class="text-xs font-semibold text-muted-foreground flex items-center gap-4"
            >
              <TrendingUp class="size-4" />
              Popular Topics
            </CardTitle>
          </CardHeader>
          <CardContent class="grid gap-4">
            {#each ["#DigitalTransformation", "#AIAfrica", "#FintechInnovation", "#CyberSecurity"] as tag}
              <div class="group cursor-pointer">
                <p
                  class="text-sm font-semibold group-hover:text-primary transition-colors"
                >
                  {tag}
                </p>
                <p class="text-[10px] text-muted-foreground font-medium">
                  12+ active threads
                </p>
              </div>
            {/each}
          </CardContent>
        </Card>
      </aside>

      <!-- Main Feed -->
      <main class="lg:col-span-9 space-y-4">
        {#if showNewPostForm}
          <div transition:slide>
            <Card
              class="rounded-2xl border-primary/20 shadow-xl overflow-hidden mb-8"
            >
              <CardHeader>
                <CardTitle class="text-xl font-bold"
                  >What's on your mind, {currentUser?.name?.split(
                    " ",
                  )[0]}?</CardTitle
                >
              </CardHeader>
              <CardContent>
                <form
                  method="POST"
                  action="?/createPost"
                  use:enhance={() => {
                    isSubmitting = true;
                    return async ({ update }) => {
                      await update();
                      isSubmitting = false;
                      showNewPostForm = false;
                    };
                  }}
                  class="space-y-4"
                >
                  <div class="space-y-4">
                    <Label class="text-xs font-semibold text-muted-foreground"
                      >Title</Label
                    >
                    <Input
                      bind:value={newPost.title}
                      placeholder="Thread Title (Optional)"
                      class="h-12 border-border/50"
                    />
                  </div>

                  <div class="space-y-4">
                    <Label class="text-xs font-semibold text-muted-foreground"
                      >Content</Label
                    >
                    <RichEditor
                      bind:value={newPost.content}
                      class="min-h-[200px]"
                    />
                    <input
                      type="hidden"
                      name="content"
                      value={newPost.content}
                    />
                  </div>

                  <div
                    class="flex items-center justify-between pt-4 border-t border-border/50"
                  >
                    <div class="flex gap-2 w-48">
                      <SelectComponent
                        options={categoryOptions}
                        bind:value={newPost.category}
                        name="category"
                        placeholder="Select Category"
                      />
                    </div>
                    <div class="flex gap-4">
                      <Button
                        variant="ghost"
                        onclick={() => (showNewPostForm = false)}
                        type="button">Cancel</Button
                      >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        class="px-8 font-semibold text-xs"
                      >
                        {#if isSubmitting}
                          <Loader2
                            class="size-4 animate-[spin_0.6s_linear_infinite] mr-2"
                          />
                          Posting...
                        {:else}
                          Post to Feed
                        {/if}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        {/if}

        <div class="space-y-6">
          {#each postList as post (post.id)}
            <Card
              class="rounded-2xl border-border/40 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden bg-card group"
            >
              <CardHeader
                class="flex flex-row items-center justify-between gap-4 pb-4"
              >
                <div class="flex items-center gap-4">
                  <Avatar
                    class="size-12 rounded-xl ring-2 ring-muted group-hover:ring-primary/20 transition-all"
                  >
                    {#if post.author.image}
                      <AvatarImage src={post.author.image} />
                    {/if}
                    <AvatarFallback class="bg-primary/5 text-primary font-bold">
                      {getInitials(post.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <h3 class="font-bold text-lg tracking-tight">
                        {post.author.name}
                      </h3>
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
                      class="text-xs text-muted-foreground font-medium flex items-center gap-4"
                    >
                      {formatDate(post.createdAt)}
                      <span class="size-1 rounded-full bg-border"></span>
                      {post.category}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="rounded-xl transition-opacity"
                >
                  <MoreHorizontal class="size-5" />
                </Button>
              </CardHeader>
              <CardContent class="space-y-4 pb-6">
                {#if post.title}
                  <a href="/community/{post.id}">
                    <h4
                      class="text-xl font-bold text-foreground leading-snug hover:text-primary transition-colors"
                    >
                      {post.title}
                    </h4>
                  </a>
                {/if}
                <div
                  class="text-muted-foreground font-medium leading-relaxed prose prose-sm prose-invert max-w-none"
                >
                  {@html post.content}
                </div>
              </CardContent>
              <CardFooter
                class="pt-4 border-t border-border/40 flex items-center justify-between text-muted-foreground"
              >
                <div class="flex items-center gap-4">
                  <form
                    method="POST"
                    action="?/toggleLike"
                    use:enhance={() => {
                      if (!currentUser) return;
                      const postIdx = postList.findIndex(
                        (p) => p.id === post.id,
                      );
                      if (postIdx !== -1) {
                        const p = postList[postIdx];
                        const alreadyLiked = p.likes.some(
                          (l:any) => l.userId === currentUser.id,
                        );
                        if (alreadyLiked) {
                          p.likes = p.likes.filter(
                            (l:any) => l.userId !== currentUser.id,
                          );
                        } else {
                          // @ts-ignore
                          p.likes = [
                            ...p.likes,
                            { userId: currentUser.id, postId: post.id },
                          ];
                        }
                      }
                      likingPosts.add(post.id);
                      return async ({ update }) => {
                        await update();
                        likingPosts.delete(post.id);
                      };
                    }}
                  >
                    <input type="hidden" name="postId" value={post.id} />
                    <Button
                      variant="ghost"
                      size="sm"
                      type="submit"
                      class={cn(
                        "flex items-center gap-2 transition-all duration-300",
                        post.likes.some((l:any) => l.userId === currentUser?.id)
                          ? "text-rose-500 bg-rose-500/10"
                          : "hover:text-rose-500 hover:bg-rose-500/5",
                        likingPosts.has(post.id) && "opacity-80 scale-95",
                      )}
                    >
                      <Heart
                        class={cn(
                          "size-4 transition-all duration-300",
                          post.likes.some(
                            (l:any) => l.userId === currentUser?.id,
                          ) && "fill-current scale-110",
                          likingPosts.has(post.id) && "animate-pulse",
                        )}
                      />
                      <span class="text-xs font-bold">{post.likes.length}</span>
                    </Button>
                  </form>

                  <Button
                    variant="ghost"
                    size="sm"
                    onclick={() =>
                      (activePostId =
                        activePostId === post.id ? null : post.id)}
                    class={cn(
                      "flex items-center gap-4 transition-colors",
                      activePostId === post.id
                        ? "text-primary bg-primary/10"
                        : "hover:text-primary hover:bg-primary/5",
                    )}
                  >
                    <MessageSquare class="size-4" />
                    <span class="text-xs font-bold">{post.replies.length}</span>
                  </Button>
                </div>

                <div class="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onclick={() => sharePost(post.id)}
                    class="rounded-xl hover:text-primary hover:bg-primary/5 transition-colors h-9 w-9"
                  >
                    <Share2 class="size-4" />
                  </Button>
                </div>
              </CardFooter>

              <!-- Replies Section -->
              {#if activePostId === post.id}
                <div
                  transition:slide
                  class="bg-muted/30 border-t border-border/40 p-4 space-y-4"
                >
                  {#if post.replies.length > 0}
                    <div
                      class="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin"
                    >
                      {#each post.replies as reply}
                        <div class="flex gap-4">
                          <Avatar class="size-8 rounded-lg shrink-0">
                            {#if reply.author.image}
                              <AvatarImage src={reply.author.image} />
                            {/if}
                            <AvatarFallback
                              class="bg-muted text-[10px] font-semibold"
                            >
                              {getInitials(reply.author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div class="space-y-2 flex-1">
                            <div class="flex items-center gap-2">
                              <p class="text-sm font-semibold">
                                {reply.author.name}
                              </p>
                              <span
                                class="text-[10px] text-muted-foreground uppercase font-bold tracking-widest"
                                >{formatDate(reply.createdAt)}</span
                              >
                            </div>
                            <div
                              class="text-sm text-muted-foreground leading-relaxed prose prose-sm prose-invert max-w-none"
                            >
                              {@html reply.content}
                            </div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <p
                      class="text-sm text-center text-muted-foreground italic py-4"
                    >
                      No replies yet. Be the first to join the conversation!
                    </p>
                  {/if}

                  {#if isPaidMember}
                    <form
                      method="POST"
                      action="?/createReply"
                      use:enhance={() => {
                        isSubmitting = true;
                        return async ({ update }) => {
                          await update();
                          isSubmitting = false;
                        };
                      }}
                      class="flex gap-4 items-start"
                    >
                      <input type="hidden" name="postId" value={post.id} />
                      <Avatar
                        class="size-10 rounded-xl shrink-0 border-2 border-primary/10"
                      >
                        {#if currentUser?.image}
                          <AvatarImage src={currentUser.image} />
                        {/if}
                        <AvatarFallback
                          class="bg-primary/5 text-primary text-xs font-semibold"
                        >
                          {getInitials(currentUser?.name || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div class="flex-1 flex flex-col gap-2">
                        <RichEditor
                          bind:value={replyContents[post.id]}
                          class="min-h-[120px] bg-background border-border/50 rounded-xl text-sm"
                        />
                        <input
                          type="hidden"
                          name="content"
                          value={replyContents[post.id] || ""}
                        />
                        <div class="flex justify-end">
                          <Button type="submit" disabled={isSubmitting}>
                            {#if isSubmitting}
                              <Loader2
                                class="size-3 animate-[spin_0.6s_linear_infinite] mr-2"
                              />
                            {/if}
                            Reply
                          </Button>
                        </div>
                      </div>
                    </form>
                  {/if}
                </div>
              {/if}
            </Card>
          {/each}
        </div>
      </main>
    </div>
  </div>
</div>

<style>
  :global(.scrollbar-thin::-webkit-scrollbar) {
    width: 6px;
  }
  :global(.scrollbar-thin::-webkit-scrollbar-track) {
    background: transparent;
  }
  :global(.scrollbar-thin::-webkit-scrollbar-thumb) {
    background: #e2e8f0;
    border-radius: 10px;
  }
</style>
