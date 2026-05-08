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
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "$lib/components/ui/tabs";
  import {
    MessageSquare,
    Heart,
    ArrowLeft,
    Calendar,
    FileText,
    User as UserIcon,
    TrendingUp,
    Award,
  } from "@lucide/svelte";
  import type { PageProps } from "./$types";
  import { cn } from "$lib/utils";

  let { data }: PageProps = $props();
  let targetUser = $derived(data.targetUser);
  let currentUser = $derived(data.currentUser);

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
      year: "numeric",
    }).format(new Date(date));
  }

  const stats = $derived([
    {
      label: "Total Posts",
      value: targetUser.posts.length,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      label: "Replies Given",
      value: targetUser.replies.length,
      icon: MessageSquare,
      color: "text-emerald-500",
    },
    {
      label: "Likes Received",
      value: targetUser.posts.reduce((acc, p) => acc + p.likes.length, 0),
      icon: Heart,
      color: "text-rose-500",
    },
    {
      label: "Member Since",
      value: formatDate(targetUser.createdAt),
      icon: Calendar,
      color: "text-amber-500",
    },
  ]);
</script>

<div class="min-h-screen bg-muted/30 pb-20 pt-32">
  <div class="container mx-auto px-4">
    <div class="max-w-5xl mx-auto space-y-12">
      <!-- Back Link -->
      <a
        href="/community"
        class="inline-flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest hover:gap-3 transition-all"
      >
        <ArrowLeft class="size-4" /> Back to Community
      </a>

      <!-- Profile Header -->
      <section class="relative">
        <div
          class="absolute inset-0 bg-primary/5 rounded-[40px] -z-10 rotate-1 scale-105"
        ></div>
        <div
          class="bg-card border border-border/40 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 p-12 opacity-5 scale-150">
            <TrendingUp class="size-48" />
          </div>

          <div
            class="flex flex-col md:flex-row items-center md:items-start gap-10"
          >
            <Avatar
              class="size-32 md:size-48 rounded-[32px] ring-8 ring-primary/5 shadow-xl"
            >
              {#if targetUser.image}
                <AvatarImage src={targetUser.image} />
              {/if}
              <AvatarFallback
                class="bg-primary/5 text-primary text-5xl font-black"
              >
                {getInitials(targetUser.name)}
              </AvatarFallback>
            </Avatar>

            <div class="flex-1 text-center md:text-left space-y-6">
              <div class="space-y-2">
                <div class="flex flex-col md:flex-row items-center gap-4">
                  <h1
                    class="text-4xl md:text-5xl font-black text-foreground tracking-tight"
                  >
                    {targetUser.name}
                  </h1>
                  <Badge
                    class="bg-primary text-black font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-xs"
                  >
                    {targetUser.role}
                  </Badge>
                </div>
                <p class="text-xl text-muted-foreground font-medium">
                  {targetUser.email}
                </p>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {#each stats as stat}
                  <div
                    class="bg-muted/30 p-4 rounded-2xl border border-border/20 space-y-1 group hover:border-primary/20 transition-all"
                  >
                    <div
                      class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest"
                    >
                      <stat.icon class={cn("size-4", stat.color)} />
                      {stat.label}
                    </div>
                    <p class="text-xl font-black text-foreground">
                      {stat.value}
                    </p>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Tabs -->
      <Tabs value="posts" class="w-full space-y-8">
        <TabsList
          class="bg-card border border-border/40 p-1 h-14 rounded-2xl w-full md:w-fit grid grid-cols-3"
        >
          <TabsTrigger
            value="posts"
            class="rounded-xl px-8 font-bold uppercase tracking-widest text-[10px]"
          >
            Posts ({targetUser.posts.length})
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            class="rounded-xl px-8 font-bold uppercase tracking-widest text-[10px]"
          >
            Replies ({targetUser.replies.length})
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            class="rounded-xl px-8 font-bold uppercase tracking-widest text-[10px]"
          >
            Liked ({targetUser.likes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" class="space-y-6">
          {#each targetUser.posts as post}
            <Card
              class="rounded-3xl border-border/40 hover:border-primary/20 transition-all shadow-sm hover:shadow-lg overflow-hidden group"
            >
              <CardContent class="p-8 space-y-4">
                <div class="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    class="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary"
                  >
                    {post.category}
                  </Badge>
                  <span
                    class="text-xs text-muted-foreground font-bold uppercase tracking-widest"
                    >{formatDate(post.createdAt)}</span
                  >
                </div>
                <a href="/community/{post.id}">
                  <h3
                    class="text-2xl font-black group-hover:text-primary transition-colors leading-tight"
                  >
                    {post.title || "Untitled Discussion"}
                  </h3>
                </a>
                <div
                  class="prose prose-invert prose-sm max-w-none line-clamp-3 text-muted-foreground font-medium"
                >
                  {@html post.content}
                </div>
                <div
                  class="flex items-center gap-6 pt-4 border-t border-border/40"
                >
                  <div class="flex items-center gap-2 text-rose-500">
                    <Heart class="size-4 fill-current" />
                    <span class="text-xs font-black uppercase tracking-widest"
                      >{post.likes.length}</span
                    >
                  </div>
                  <div class="flex items-center gap-2 text-primary">
                    <MessageSquare class="size-4" />
                    <span class="text-xs font-black uppercase tracking-widest"
                      >{post.replies.length}</span
                    >
                  </div>
                </div>
              </CardContent>
            </Card>
          {/each}
          {#if targetUser.posts.length === 0}
            <div
              class="text-center py-20 bg-muted/20 rounded-[40px] border border-dashed border-border/40 space-y-4"
            >
              <FileText class="size-16 mx-auto text-muted-foreground/20" />
              <p class="text-muted-foreground font-medium italic text-lg">
                No posts shared yet.
              </p>
            </div>
          {/if}
        </TabsContent>

        <TabsContent value="replies" class="space-y-6">
          {#each targetUser.replies as reply}
            <Card
              class="rounded-3xl border-border/40 hover:border-primary/20 transition-all shadow-sm overflow-hidden group"
            >
              <CardContent class="p-8 space-y-4">
                <div
                  class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest"
                >
                  <MessageSquare class="size-4 text-emerald-500" />
                  Replied to:
                  <span class="text-foreground"
                    >{reply.post.title || "Untitled Post"}</span
                  >
                  <span class="ml-auto">{formatDate(reply.createdAt)}</span>
                </div>
                <div
                  class="prose prose-invert prose-sm max-w-none text-muted-foreground font-medium italic border-l-2 border-primary/20 pl-6"
                >
                  {@html reply.content}
                </div>
                <Button
                  variant="ghost"
                  class="p-0 h-fit text-[10px] font-black uppercase tracking-widest text-primary hover:bg-transparent"
                  href="/community/{reply.post.id}"
                >
                  View Discussion
                </Button>
              </CardContent>
            </Card>
          {/each}
          {#if targetUser.replies.length === 0}
            <div
              class="text-center py-20 bg-muted/20 rounded-[40px] border border-dashed border-border/40 space-y-4"
            >
              <MessageSquare class="size-16 mx-auto text-muted-foreground/20" />
              <p class="text-muted-foreground font-medium italic text-lg">
                No replies shared yet.
              </p>
            </div>
          {/if}
        </TabsContent>

        <TabsContent
          value="likes"
          class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {#each targetUser.likes as like}
            {#if like.post}
              <a href="/community/{like.post.id}" class="block group">
                <Card
                  class="rounded-3xl border-border/40 group-hover:border-primary/20 transition-all shadow-sm h-full flex flex-col"
                >
                  <CardHeader class="pb-2">
                    <div class="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        class="text-[8px] font-black uppercase tracking-widest border-rose-500/20 text-rose-500"
                      >
                        {like.post.category}
                      </Badge>
                      <Heart class="size-3 text-rose-500 fill-current" />
                    </div>
                  </CardHeader>
                  <CardContent class="pb-8 space-y-2 flex-1">
                    <h4
                      class="font-bold text-white group-hover:text-primary transition-colors line-clamp-2"
                    >
                      {like.post.title}
                    </h4>
                    <p
                      class="text-xs text-muted-foreground line-clamp-2 italic"
                    >
                      "{formatDate(like.createdAt)}"
                    </p>
                  </CardContent>
                </Card>
              </a>
            {/if}
          {/each}
          {#if targetUser.likes.length === 0}
            <div
              class="col-span-full text-center py-20 bg-muted/20 rounded-[40px] border border-dashed border-border/40 space-y-4"
            >
              <Heart class="size-16 mx-auto text-muted-foreground/20" />
              <p class="text-muted-foreground font-medium italic text-lg">
                No likes given yet.
              </p>
            </div>
          {/if}
        </TabsContent>
      </Tabs>
    </div>
  </div>
</div>
