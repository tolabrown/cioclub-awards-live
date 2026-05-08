<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import { scaleBand } from "d3-scale";
  import { BarChart, type ChartContextValue } from "layerchart";
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
    title = "Scores by Type",
    description = "Performance breakdown",
  }: Props = $props();

  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
  ];

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
  <Card.Header>
    <Card.Title>{title}</Card.Title>
    <Card.Description>{description}</Card.Description>
  </Card.Header>
  <Card.Content>
    <Chart.Container config={chartConfig} class="aspect-auto h-[300px] w-full">
      {#if chartData.length > 0}
        <BarChart
          bind:context
          data={chartData}
          xScale={scaleBand().padding(0.25)}
          x="category"
          axis="x"
          rule={false}
          series={[
            {
              key: "value",
              label: "Count",
              color: colors[0],
              props: { rounded: "top" },
            },
          ]}
          grid={false}
          highlight={false}
          props={{
            bars: {
              stroke: "none",
              initialY: context?.height,
              initialHeight: 0,
              motion: {
                y: { type: "tween", duration: 500, easing: cubicInOut },
                height: { type: "tween", duration: 500, easing: cubicInOut },
              },
            },
            xAxis: {
              format: (d: string) => {
                return d.length > 15 ? d.substring(0, 12) + "..." : d;
              },
              tickLabelProps: {
                svgProps: {
                  y: 13,
                },
              },
            },
          }}
        >
          {#snippet tooltip()}
            <Chart.Tooltip />
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
        <div class="text-muted-foreground leading-none">
          Total scores: {total.toLocaleString()}
        </div>
      </div>
    </div>
  </Card.Footer>
</Card.Root>
