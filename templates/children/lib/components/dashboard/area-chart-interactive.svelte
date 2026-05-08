<script lang="ts">
  import { TrendingUp } from "@lucide/svelte";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { scaleUtc } from "d3-scale";
  import { Area, AreaChart, ChartClipPath } from "layerchart";
  import { curveNatural } from "d3-shape";
  import { cubicInOut } from "svelte/easing";
  import type { iSelect } from "$lib/components/ui/select/select-component.svelte";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";

  interface Props {
    data: Array<{
      date: string;
      value: number;
    }>;
    title?: string;
    description?: string;
  }

  let {
    data,
    title = "Activity Over Time",
    description = "Monthly activity breakdown",
  }: Props = $props();

  // Transform data to Date objects
  const transformedData = $derived(
    data.map((item) => ({
      date: new Date(item.date + "-01"), // Add day to YYYY-MM format
      value: item.value,
    })),
  );

  let timeRange = $state("all");

  const filteredData = $derived.by(() => {
    if (timeRange === "all" || transformedData.length === 0) {
      return transformedData;
    }

    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    }

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract);

    return transformedData.filter((item) => item.date >= cutoffDate);
  });

  const chartConfig = {
    value: { label: "Count", color: "var(--chart-1)" },
  } satisfies Chart.ChartConfig;

  const total = $derived(
    filteredData.reduce((sum, item) => sum + item.value, 0),
  );

  const options: iSelect[] = [
    { label: "All time", value: "all" },
    { label: "Last 3 months", value: "90d" },
    { label: "Last 30 days", value: "30d" },
  ];
</script>

<Card.Root>
  <Card.Header class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 space-y-0 border-b">
    <div class="grid flex-1 gap-1 sm:text-start">
      <Card.Title>{title}</Card.Title>
      <Card.Description>{description}</Card.Description>
    </div>
    <SelectComponent
      class="w-full"
      name="timeRange"
      {options}
      bind:value={timeRange}
      placeholder="Select time range"
    />
    <!-- <select
      bind:value={timeRange}
      class="h-10 w-[160px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:ms-auto"
      aria-label="Select time range"
    >
      <option value="all">All time</option>
      <option value="90d">Last 3 months</option>
      <option value="30d">Last 30 days</option>
    </select> -->
  </Card.Header>
  <Card.Content class="pt-6">
    <Chart.Container config={chartConfig} class="aspect-auto h-[300px] w-full">
      {#if filteredData.length > 0}
        <AreaChart
          data={filteredData}
          x="date"
          xScale={scaleUtc()}
          series={[
            {
              key: "value",
              label: "Attendance",
              color: chartConfig.value.color,
            },
          ]}
          props={{
            area: {
              curve: curveNatural,
              "fill-opacity": 0.4,
              line: { class: "stroke-2" },
              motion: "tween",
            },
            xAxis: {
              format: (v: Date) => {
                return v.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });
              },
            },
            yAxis: { format: () => "" },
          }}
        >
          {#snippet marks({ series, getAreaProps })}
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stop-color="var(--color-value)"
                  stop-opacity={1.0}
                />
                <stop
                  offset="95%"
                  stop-color="var(--color-value)"
                  stop-opacity={0.1}
                />
              </linearGradient>
            </defs>
            <ChartClipPath
              initialWidth={0}
              motion={{
                width: { type: "tween", duration: 1000, easing: cubicInOut },
              }}
            >
              {#each series as s, i (s.key)}
                <Area {...getAreaProps(s, i)} fill="url(#fillValue)" />
              {/each}
            </ChartClipPath>
          {/snippet}
          {#snippet tooltip()}
            <Chart.Tooltip
              labelFormatter={(v: Date) => {
                return v.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                });
              }}
              indicator="line"
            />
          {/snippet}
        </AreaChart>
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
          Total attendance: {total.toLocaleString()}
          <TrendingUp class="size-4" />
        </div>
        <div class="text-muted-foreground flex items-center gap-2 leading-none">
          {timeRange === "all"
            ? "All time"
            : timeRange === "90d"
              ? "Last 3 months"
              : "Last 30 days"}
        </div>
      </div>
    </div>
  </Card.Footer>
</Card.Root>
