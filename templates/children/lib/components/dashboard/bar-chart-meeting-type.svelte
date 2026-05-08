<script lang="ts">
  import { TrendingUp, Calendar } from "@lucide/svelte";
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
  import { ScrollArea } from "$lib/components/ui/scroll-area";

  interface Props {
    data: Array<{
      date: string;
      meetingType: string;
      value: number;
    }>;
    title?: string;
    description?: string;
  }

  let {
    data,
    title = "Attendance by Meeting Type",
    description = "Compare attendance across different meeting types over time",
  }: Props = $props();

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get unique dates and meeting types
  const uniqueDates = $derived([...new Set(data.map((d) => d.date))].sort());
  const uniqueMeetingTypes = $derived([
    ...new Set(data.map((d) => d.meetingType)),
  ]);

  // Transform data for stacked bar chart
  const chartData = $derived(
    uniqueDates.map((date) => {
      const row: any = {
        date,
        displayDate: formatDate(date),
      };
      uniqueMeetingTypes.forEach((type) => {
        const item = data.find(
          (d) => d.date === date && d.meetingType === type,
        );
        row[type] = item ? item.value : 0;
      });
      return row;
    }),
  );

  // Create series for each meeting type
  const series = $derived(
    uniqueMeetingTypes.map((type, index) => ({
      key: type,
      label: type,
      color: colors[index % colors.length],
    })),
  );

  const chartConfig = $derived(
    Object.fromEntries(
      uniqueMeetingTypes.map((type, index) => {
        const key = type.toLowerCase().replace(/\s+/g, "-");
        return [
          key,
          {
            label: type,
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
    <div class="flex items-center gap-2">
      <Calendar class="h-5 w-5 text-primary" />
      <div class="flex-1">
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </div>
    </div>
  </Card.Header>
  <Card.Content class="px-2 sm:p-6">
    <ScrollArea class="w-full">
      <div class="min-w-[600px]">
        <Chart.Container
          config={chartConfig}
          class="aspect-auto h-[350px] w-full"
        >
          {#if chartData.length > 0}
            <BarChart
              bind:context
              data={chartData}
              x="displayDate"
              xScale={scaleBand().padding(0.3)}
              axis="x"
              {series}
              props={{
                bars: {
                  stroke: "none",
                  rounded: "top",
                  initialY: context?.height,
                  initialHeight: 0,
                  motion: {
                    y: { type: "tween", duration: 600, easing: cubicInOut },
                    height: {
                      type: "tween",
                      duration: 600,
                      easing: cubicInOut,
                    },
                  },
                },
                highlight: { area: { fill: "none" } },
                xAxis: {
                  format: (d: string) => d,
                },
              }}
            >
              {#snippet belowMarks()}
                <Highlight area={{ class: "fill-primary/5" }} />
              {/snippet}
              {#snippet tooltip()}
                <Chart.Tooltip />
              {/snippet}
              {#snippet bars({ props: barProps, visibleData, index })}
                {@const d = visibleData[index]}
                {#each series as s}
                  {@const value = d[s.key]}
                  {#if value > 0}
                    <g>
                      <rect {...barProps} fill={s.color} />
                      <Text
                        value={String(value)}
                        x={barProps.x + barProps.width / 2}
                        y={barProps.y - 4}
                        textAnchor="middle"
                        class="fill-foreground text-xs font-medium"
                      />
                    </g>
                  {/if}
                {/each}
              {/snippet}
            </BarChart>
          {:else}
            <div
              class="flex h-full items-center justify-center text-muted-foreground"
            >
              <div class="text-center">
                <Calendar class="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No attendance data available</p>
              </div>
            </div>
          {/if}
        </Chart.Container>
      </div>
    </ScrollArea>
  </Card.Content>
  <Card.Footer class="flex-col gap-2">
    <div class="flex items-center gap-2 font-medium leading-none">
      <TrendingUp class="size-4 text-primary" />
      <span>Total: {total.toLocaleString()} attendees</span>
    </div>
    <div class="flex flex-wrap gap-2 text-sm">
      {#each uniqueMeetingTypes as type, index}
        <div class="flex items-center gap-1.5">
          <div
            class="h-2.5 w-2.5 rounded-full"
            style="background-color: {colors[index % colors.length]}"
          ></div>
          <span class="text-muted-foreground">{type}</span>
        </div>
      {/each}
    </div>
  </Card.Footer>
</Card.Root>
