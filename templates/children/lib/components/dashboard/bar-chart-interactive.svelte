<script lang="ts">
  import { TrendingUp } from "@lucide/svelte";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { scaleBand } from "d3-scale";
  import {
    BarChart,
    type ChartContextValue,
    Highlight,
    Text,
  } from "layerchart";
  import { cubicInOut } from "svelte/easing";

  interface Props {
    data: Array<{
      group: string;
      value: number;
    }>;
    title?: string;
    description?: string;
  }

  let {
    data,
    title = "Comparison",
    description = "Data comparison",
  }: Props = $props();

  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  // Transform data for bar chart
  const chartData = $derived(
    data.map((item) => ({
      category: item.group || "Unknown",
      value: item.value,
    })),
  );

  const chartConfig = $derived(
    Object.fromEntries(
      data.map((item, index) => {
        const key = item.group
          ? item.group.toLowerCase().replace(/\s+/g, "-")
          : `unknown-${index}`;
        return [
          key,
          {
            label: item.group || "Unknown",
            color: colors[index % colors.length],
          },
        ];
      }),
    ),
  ) as Chart.ChartConfig;

  let context = $state<ChartContextValue>();

  const total = $derived(data.reduce((sum, item) => sum + item.value, 0));
</script>

<Card.Root>
  <Card.Header
    class="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row"
  >
    <div class="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
      <Card.Title>{title}</Card.Title>
      <Card.Description>{description}</Card.Description>
    </div>
  </Card.Header>
  <Card.Content class="px-2 pt-6 sm:p-6">
    <Chart.Container config={chartConfig} class="aspect-auto h-[300px] w-full">
      {#if chartData.length > 0}
        <BarChart
          bind:context
          data={chartData}
          x="category"
          xScale={scaleBand().padding(0.25)}
          axis="x"
          series={[
            {
              key: "value",
              label: "Count",
              color: colors[0],
            },
          ]}
          props={{
            bars: {
              stroke: "none",
              rounded: "top",
              initialY: context?.height,
              initialHeight: 0,
              motion: {
                y: { type: "tween", duration: 500, easing: cubicInOut },
                height: { type: "tween", duration: 500, easing: cubicInOut },
              },
            },
            highlight: { area: { fill: "none" } },
            xAxis: {
              format: (d: string) => {
                // Truncate long labels
                return d.length > 15 ? d.substring(0, 12) + "..." : d;
              },
            },
          }}
        >
          {#snippet belowMarks()}
            <Highlight area={{ class: "fill-muted" }} />
          {/snippet}
          {#snippet tooltip()}
            <Chart.Tooltip nameKey="value" />
          {/snippet}
          {#snippet bars({ props: barProps, visibleData, index })}
            {@const d = visibleData[index]}
            <g>
              <rect {...barProps} />
              {#if d.value > 0}
                <Text
                  value={String(d.value)}
                  x={barProps.x + barProps.width / 2}
                  y={barProps.y - 4}
                  textAnchor="middle"
                  class="fill-foreground text-xs font-medium"
                />
              {/if}
            </g>
          {/snippet}
        </BarChart>
      {:else}
        <div
          class="flex h-full items-center justify-center text-muted-foreground"
        >
          No data available
        </div>
      {/if}
    </Chart.Container>
  </Card.Content>
  <Card.Footer>
    <div class="flex w-full items-start gap-2 text-sm">
      <div class="grid gap-2">
        <div class="flex items-center gap-2 font-medium leading-none">
          Total: {total.toLocaleString()}
          <TrendingUp class="size-4" />
        </div>
        <div class="text-muted-foreground flex items-center gap-2 leading-none">
          {data.length}
          {data.length === 1 ? "category" : "categories"}
        </div>
      </div>
    </div>
  </Card.Footer>
</Card.Root>
