<script lang="ts">
  import { TrendingUp, Calendar } from "@lucide/svelte";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { scaleUtc } from "d3-scale";
  import { Area, AreaChart, ChartClipPath } from "layerchart";
  import { curveNatural } from "d3-shape";
  import { cubicInOut } from "svelte/easing";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";

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
    description = "Number of attendees per meeting over time",
  }: Props = $props();

  // Transform data for area chart
  const chartData = $derived(
    data.map((item) => ({
      date: new Date(item.date),
      attendees: item.value,
    })),
  );

  const chartConfig = {
    attendees: {
      label: "Attendees",
      color: "var(--chart-1)",
    },
  } satisfies Chart.ChartConfig;

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
  <Card.Content class="p-0 flex flex-col h-[400px]">
    <!-- Chart Section -->
    <div class="h-[250px] border-b p-6">
      <ScrollArea class="w-full h-full" orientation="horizontal">
        <div class="min-w-[600px] h-full">
          <Chart.Container
            config={chartConfig}
            class="aspect-auto h-full w-full"
          >
            {#if chartData.length > 0}
              <AreaChart
                data={chartData}
                x="date"
                xScale={scaleUtc()}
                series={[
                  {
                    key: "attendees",
                    label: "Attendees",
                    color: chartConfig.attendees.color,
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
                        day: "numeric",
                      });
                    },
                  },
                  yAxis: {
                    format: (v: number) => Math.round(v).toString(),
                  },
                }}
              >
                {#snippet marks({ series, getAreaProps })}
                  <defs>
                    <linearGradient
                      id="fillAttendees"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stop-color="var(--color-attendees)"
                        stop-opacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stop-color="var(--color-attendees)"
                        stop-opacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <ChartClipPath
                    initialWidth={0}
                    motion={{
                      width: {
                        type: "tween",
                        duration: 1000,
                        easing: cubicInOut,
                      },
                    }}
                  >
                    {#each series as s, i (s.key)}
                      <Area
                        {...getAreaProps(s, i)}
                        fill="url(#fillAttendees)"
                      />
                    {/each}
                  </ChartClipPath>
                {/snippet}
                {#snippet tooltip()}
                  <Chart.Tooltip
                    labelFormatter={(v: Date) => {
                      return v.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
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
                <div class="text-center">
                  <Calendar class="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No attendance data available</p>
                </div>
              </div>
            {/if}
          </Chart.Container>
        </div>
      </ScrollArea>
    </div>

    <!-- Table Section -->
    <div class="flex-1 min-h-0 bg-muted/20">
      {#if chartData.length > 0}
        <ScrollArea class="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="pl-6">Meeting Date</TableHead>
                <TableHead class="text-right pr-6">Attendees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each [...chartData].reverse() as item}
                <TableRow>
                  <TableCell class="pl-6 font-medium">
                    {item.date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell class="text-right pr-6">
                    <div class="flex items-center justify-end gap-2">
                      <span class="font-bold">{item.attendees}</span>
                      <div
                        class="h-2 w-2 rounded-full"
                        style="background-color: var(--chart-1)"
                      ></div>
                    </div>
                  </TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </ScrollArea>
      {:else}
        <div
          class="flex items-center justify-center h-full text-muted-foreground text-sm"
        >
          No data to display
        </div>
      {/if}
    </div>
  </Card.Content>
  <Card.Footer class="flex-col gap-2 pt-4">
    <div class="flex items-center gap-2 font-medium leading-none">
      <TrendingUp class="size-4 text-primary" />
      <span>Total: {total.toLocaleString()} attendees</span>
    </div>
    <div
      class="flex items-center gap-4 text-muted-foreground leading-none text-xs"
    >
      <span>Avg: {average}</span>
      <span>•</span>
      <span>Peak: {maxAttendance}</span>
      <span>•</span>
      <span>{data.length} meetings</span>
    </div>
  </Card.Footer>
</Card.Root>
