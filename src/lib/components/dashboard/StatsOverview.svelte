<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import {
    Users,
    Trophy,
    DollarSign,
    FileText,
    Globe,
    Newspaper,
    Calendar,
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
    },
    {
      title: "Award Entries",
      value: props.stats?.entries || 0,
      icon: Trophy,
      description: "Submissions across categories",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Revenue",
      value: new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(props.stats?.revenue || 0),
      icon: DollarSign,
      description: "Ticket booking revenue",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Content Items",
      value:
        (props.stats?.news || 0) +
        (props.stats?.events || 0) +
        (props.stats?.files || 0),
      icon: Newspaper,
      description: "Total news, events & media",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ]);
</script>

<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  {#each cards as card}
    <Card.Root
      class="overflow-hidden border-border/50 bg-card/50 backdrop-blur-md hover:border-primary/50 transition-colors"
    >
      <Card.Header
        class="flex flex-row items-center justify-between pb-2 space-y-0"
      >
        <Card.Title
          class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >{card.title}</Card.Title
        >
        <div class={`p-2 rounded-lg ${card.bg} ${card.color}`}>
          <card.icon class="size-4" />
        </div>
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{card.value}</div>
        <p class="text-[10px] text-muted-foreground mt-1 font-medium italic">
          {card.description}
        </p>
      </Card.Content>
    </Card.Root>
  {/each}
</div>
