<script lang="ts">
  import { TrendingUp } from "@lucide/svelte";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { PieChart, Text } from "layerchart";

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
    description = "Breakdown by category",
  }: Props = $props();

  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

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
  <Card.Content class="flex-1 pb-0">
    <Chart.Container
      config={chartConfig}
      class="mx-auto aspect-square max-h-[300px]"
    >
      {#if chartData.length > 0}
        <PieChart
          data={chartData}
          key="category"
          value="value"
          c="color"
          innerRadius={76}
          padding={29}
          range={[-90, 90]}
          props={{ pie: { sort: null } }}
          cornerRadius={4}
        >
          {#snippet aboveMarks()}
            <Text
              value={String(total)}
              textAnchor="middle"
              verticalAnchor="middle"
              class="fill-foreground text-2xl! font-bold"
              dy={-24}
            />
            <Text
              value="Total"
              textAnchor="middle"
              verticalAnchor="middle"
              class="fill-muted-foreground! text-muted-foreground"
              dy={-4}
            />
          {/snippet}
          {#snippet tooltip()}
            <Chart.Tooltip hideLabel />
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
  </Card.Content>
  <Card.Footer class="flex-col gap-2 text-sm">
    <div class="flex items-center gap-2 font-medium leading-none">
      Total: {total.toLocaleString()}
      <TrendingUp class="size-4" />
    </div>
    <div class="flex flex-wrap gap-2 text-sm">
      {#each chartData as item, index}
        <div class="flex items-center gap-1.5">
          <div
            class="h-2.5 w-2.5 rounded-full"
            style="background-color: {colors[index % colors.length]}"
          ></div>
          <span class="text-muted-foreground capitalize"
            >{item.category} ({item.value})</span
          >
        </div>
      {/each}
    </div>
  </Card.Footer>
</Card.Root>
