<script lang="ts">
  import { TrendingUp, Calendar } from "@lucide/svelte";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { scaleBand } from "d3-scale";
  import { BarChart, type ChartContextValue, Highlight } from "layerchart";
  import { cubicInOut } from "svelte/easing";
  import { ScrollArea } from "$lib/components/ui/scroll-area";

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
    title = "Attendance by Meeting",
    description = "Number of attendees per meeting",
  }: Props = $props();

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Transform data for bar chart
  const chartData = $derived(
    data.map((item) => ({
      date: item.date,
      displayDate: formatDate(item.date),
      attendees: item.value,
    })),
  );

  const chartConfig = {
    attendees: {
      label: "Attendees",
      color: "hsl(var(--chart-1))",
    },
  } satisfies Chart.ChartConfig;

  let context = $state<ChartContextValue>();

  const total = $derived(data.reduce((sum, item) => sum + item.value, 0));
  const average = $derived(
    data.length > 0 ? (total / data.length).toFixed(1) : 0,
  );
  const maxAttendance = $derived(Math.max(...data.map((d) => d.value), 0));
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
              series={[
                {
                  key: "attendees",
                  label: "Attendees",
                  color: "hsl(var(--chart-1))",
                },
              ]}
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
              }}
            >
              {#snippet belowMarks()}
                <Highlight area={{ class: "fill-primary/5" }} />
              {/snippet}
              {#snippet tooltip()}
                <Chart.Tooltip nameKey="attendees" />
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
    <div class="flex items-center gap-4 text-muted-foreground leading-none">
      <span>Average: {average} per meeting</span>
      <span>•</span>
      <span>Peak: {maxAttendance}</span>
      <span>•</span>
      <span>{data.length} {data.length === 1 ? "meeting" : "meetings"}</span>
    </div>
    <div class="flex items-center gap-2 pt-2 border-t">
      <div
        class="h-2.5 w-2.5 rounded-full"
        style="background-color: hsl(var(--chart-1))"
      ></div>
      <span class="text-sm text-muted-foreground">Attendees</span>
    </div>
  </Card.Footer>
</Card.Root>
