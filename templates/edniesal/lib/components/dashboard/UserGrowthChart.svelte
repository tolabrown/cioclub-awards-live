<script lang="ts">
  import { AreaChart, LinearGradient } from "layerchart";
  import * as Chart from "$lib/components/ui/chart";
  import * as Card from "$lib/components/ui/card";
  import { TrendingUp } from "@lucide/svelte";

  let props = $props();

  const chartConfig = $derived({
    count: { label: "New Users", color: "var(--chart-1)" },
  }) satisfies Chart.ChartConfig;
</script>

<Card.Root class="border-border/50 bg-card/50 backdrop-blur-md">
  <Card.Header>
    <Card.Title class="text-lg">User Growth</Card.Title>
    <Card.Description>Registrations over the last 6 months</Card.Description>
  </Card.Header>
  <Card.Content>
    <Chart.Container config={chartConfig} class="aspect-auto h-[250px] w-full">
      <AreaChart
        data={props.data}
        x="month"
        y="count"
        axis="x"
        series={[{ key: "count", color: "var(--chart-1)", label: "Users" }]}
        props={{
          area: {
            fill: "url(#grade)",
            strokeWidth: 2,
          },
          xAxis: {
            padding: { left: 10, right: 10 },
          },
        }}
      >
        {#snippet defs()}
          <LinearGradient
            id="grade"
            stops={["var(--chart-1)", "transparent"]}
            vertical
          />
        {/snippet}
        {#snippet tooltip()}
          <Chart.Tooltip />
        {/snippet}
      </AreaChart>
    </Chart.Container>
  </Card.Content>
  <Card.Footer class="flex-col items-start gap-2 text-sm border-t p-4">
    <div
      class="flex items-center gap-2 font-bold text-emerald-500 uppercase tracking-wider text-[10px]"
    >
      <TrendingUp class="size-3" /> Growth trend positive
    </div>
  </Card.Footer>
</Card.Root>
