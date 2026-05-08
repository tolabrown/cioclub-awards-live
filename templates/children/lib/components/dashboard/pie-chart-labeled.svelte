<script lang="ts">
  import { Arc, PieChart, Text } from "layerchart";
  import { TrendingUp } from "@lucide/svelte";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
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
      group: string;
      value: number;
    }>;
    title?: string;
    description?: string;
  }

  let {
    data,
    title = "Distribution",
    description = "Data breakdown",
  }: Props = $props();

  // Generate colors dynamically
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
    "var(--chart-9)",
    "var(--chart-10)",
    "var(--chart-11)",
    "var(--chart-12)",
  ];

  // Transform data for pie chart
  const chartData = $derived(
    data.map((item, index) => ({
      category: item.group || "Unknown",
      value: item.value,
      color: colors[index % colors.length],
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

  const total = $derived(data.reduce((sum, item) => sum + item.value, 0));
</script>

<Card.Root class="flex flex-col">
  <Card.Header class="items-center pb-0">
    <Card.Title>{title}</Card.Title>
    <Card.Description>{description}</Card.Description>
  </Card.Header>
  <Card.Content class="p-0 flex flex-col md:flex-row h-[400px]">
    <!-- Chart Section -->
    <div
      class="w-full md:w-1/2 p-6 flex flex-col items-center justify-center h-[200px] md:h-full"
    >
      <Chart.Container
        config={chartConfig}
        class="mx-auto aspect-square h-full max-h-[250px]"
      >
        {#if chartData.length > 0}
          <PieChart
            data={chartData}
            key="category"
            value="value"
            cRange={colors.slice(0, data.length)}
            c="category"
            props={{
              pie: {
                motion: "tween",
              },
            }}
          >
            {#snippet tooltip()}
              <Chart.Tooltip hideLabel />
            {/snippet}
            {#snippet arc({ props, visibleData, index })}
              <Arc {...props}>
                {#snippet children({ getArcTextProps })}
                  <Text
                    value={String(visibleData[index].value)}
                    {...getArcTextProps("centroid")}
                    font-size="14"
                    font-weight="600"
                    class="fill-background dark:fill-white"
                  />
                {/snippet}
              </Arc>
            {/snippet}
          </PieChart>
        {:else}
          <div
            class="flex h-full items-center justify-center text-muted-foreground"
          >
            No data available
          </div>
        {/if}
      </Chart.Container>
    </div>

    <!-- Legend Section -->
    <div
      class="w-full md:w-1/2 h-[200px] md:h-full border-t md:border-t-0 md:border-l bg-muted/20"
    >
      <ScrollArea class="h-full">
        {#if chartData.length > 0}
          <div class="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="pl-6">Category</TableHead>
                  <TableHead class="text-right pr-6">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {#each chartData as item, index}
                  <TableRow>
                    <TableCell class="pl-6 py-2">
                      <div class="flex items-center gap-2">
                        <div
                          class="h-3 w-3 rounded-sm"
                          style="background-color: {colors[
                            index % colors.length
                          ]}"
                        ></div>
                        <span class="text-sm font-medium capitalize">
                          {item.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell class="text-right pr-6 py-2"
                      >{item.value}</TableCell
                    >
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
          </div>
        {/if}
      </ScrollArea>
    </div>
  </Card.Content>
  <Card.Footer class="flex-col gap-2 text-sm">
    <div class="flex items-center gap-2 font-medium leading-none">
      Total: {total.toLocaleString()}
      <TrendingUp class="size-4" />
    </div>
  </Card.Footer>
</Card.Root>
