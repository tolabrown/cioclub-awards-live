<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import {
    Users,
    FileText,
    Users2,
    MessageSquare,
    Handshake,
    Heart,
  } from "@lucide/svelte";

  let props = $props();

  const cards = $derived([
    {
      title: "Total Users",
      value: props.stats?.users || 0,
      icon: Users,
      description: "Platform-wide registrations",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/users",
    },
    {
      title: "Inquiries",
      value: props.stats?.contacts || 0,
      icon: MessageSquare,
      description: "New contact inquiries",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      href: "/admin/contacts",
    },
    {
      title: "Applications",
      value: props.stats?.applications || 0,
      icon: FileText,
      description: "Job & CV submissions",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: "/admin/applications",
    },
    {
      title: "Team Members",
      value: props.stats?.team || 0,
      icon: Handshake,
      description: "Staff and Board members",
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/admin/pages/edit/team",
    },
    {
      title: "Ladies in Tech",
      value: props.stats?.ladiesInTech || 0,
      icon: Heart,
      description: "Manage events & registrations",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      href: "/admin/pages/edit/ladies-in-tech",
    },
    {
      title: "Media Library",
      value: props.stats?.files || 0,
      icon: FileText,
      description: "Total uploaded files",
      color: "text-slate-500",
      bg: "bg-slate-500/10",
      href: "/admin/pages",
    },
    {
      title: "Registrations",
      value: props.stats?.registrations || 0,
      icon: Users,
      description: "Confirmed event attendees",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      href: "/admin/ladies-in-tech/registrations",
    },
  ]);
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {#each cards as card}
    <a href={card.href} class="block h-full">
      <Card.Root
        class="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-md hover:border-primary/50 hover:bg-primary/5 transition-all shadow-lg group"
      >
        <Card.Header
          class="flex flex-row items-center justify-between pb-2 space-y-0"
        >
          <Card.Title
            class="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground group-hover:text-primary transition-colors"
            >{card.title}</Card.Title
          >
          <div
            class={`p-2 rounded-lg ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}
          >
            <card.icon class="size-4" />
          </div>
        </Card.Header>
        <Card.Content>
          <div class="text-xl font-bold tracking-tight">{card.value}</div>
          <p
            class="text-[9px] text-muted-foreground mt-1 font-bold uppercase tracking-wider opacity-60 line-clamp-1"
          >
            {card.description}
          </p>
        </Card.Content>
      </Card.Root>
    </a>
  {/each}
</div>
