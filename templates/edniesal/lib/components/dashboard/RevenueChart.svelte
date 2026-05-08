<script lang="ts">
  import { BarChart } from "layerchart";
  import * as Chart from "$lib/components/ui/chart";
  import * as Card from "$lib/components/ui/card";
  import { DollarSign } from "@lucide/svelte";

  let props = $props();

  const chartConfig = $derived({
    total: { label: "Revenue", color: "var(--chart-2)" },
  }) satisfies Chart.ChartConfig;
</script>

<Card.Root class="border-border/50 bg-card/50 backdrop-blur-md">
  <Card.Header>
    <Card.Title class="text-lg">Ticket Revenue</Card.Title>
    <Card.Description>Monthly trends from paid bookings</Card.Description>
  </Card.Header>
  <Card.Content>
    <Chart.Container config={chartConfig} class="aspect-auto h-[250px] w-full">
      <BarChart
        data={props.data}
        x="month"
        axis="x"
        series={[{ key: "total", color: "var(--chart-2)", label: "Revenue" }]}
        props={{
          bars: {
            rounded: "top",
            stroke: "none",
          },
          xAxis: {
            padding: { left: 10, right: 10 },
          },
        }}
      >
        {#snippet tooltip()}
          <Chart.Tooltip>
            {#snippet formatter({ value })}
              <span class="text-foreground font-mono font-medium tabular-nums">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                }).format(Number(value))}
              </span>
            {/snippet}
          </Chart.Tooltip>
        {/snippet}
      </BarChart>
    </Chart.Container>
  </Card.Content>
  <Card.Footer class="border-t p-4">
    <div
      class="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest"
    >
      <DollarSign class="size-3 text-emerald-500" /> All values in NGN
    </div>
  </Card.Footer>
</Card.Root>
