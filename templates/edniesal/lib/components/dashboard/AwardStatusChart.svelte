<script lang="ts">
  import { Chart as LayerChart, Svg, Group, Pie, Arc, Text } from "layerchart";
  import * as Chart from "$lib/components/ui/chart";
  import * as Card from "$lib/components/ui/card";

  let props = $props();

  const chartConfig = $derived(
    (props.data || []).reduce((acc: any, curr: any) => {
      acc[curr.status] = {
        label: curr.status.charAt(0).toUpperCase() + curr.status.slice(1),
      };
      return acc;
    }, {}),
  );

  const total = $derived(
    (props.data || []).reduce((acc: number, curr: any) => acc + curr.count, 0),
  );
</script>

<Card.Root class="border-border/50 bg-card/50 backdrop-blur-md flex flex-col">
  <Card.Header class="items-center pb-0">
    <Card.Title>Award Submissions</Card.Title>
    <Card.Description>Status Distribution</Card.Description>
  </Card.Header>
  <Card.Content class="flex-1 pb-0">
    <Chart.Container
      config={chartConfig}
      class="mx-auto aspect-square max-h-[250px]"
    >
      <LayerChart
        data={props.data}
        x="count"
        c="status"
        padding={{ top: 20, right: 20, bottom: 20, left: 20 }}
        let:cScale
        let:tooltip
      >
        <Svg center>
          <Group>
            <Pie innerRadius={60} cornerRadius={4} padAngle={0.02} let:arcs>
              {#each arcs as arc}
                <Arc
                  startAngle={arc.startAngle}
                  endAngle={arc.endAngle}
                  innerRadius={60}
                  fill={cScale?.(arc.data.status) ?? "transparent"}
                  class="transition-opacity hover:opacity-80"
                  {tooltip}
                  data={arc.data}
                />
              {/each}
            </Pie>
          </Group>
          <Text
            value={total.toLocaleString()}
            textAnchor="middle"
            verticalAnchor="middle"
            class="fill-foreground !text-3xl font-bold"
            dy={3}
          />
          <Text
            value="Entries"
            textAnchor="middle"
            verticalAnchor="middle"
            class="!fill-muted-foreground text-xs uppercase tracking-widest font-bold"
            dy={22}
          />
        </Svg>
        <Chart.Tooltip indicator="dot" {tooltip} />
      </LayerChart>
    </Chart.Container>
  </Card.Content>
  <Card.Footer class="flex-col gap-2 text-sm text-center border-t p-4">
    <div
      class="text-muted-foreground leading-none text-[10px] uppercase font-bold tracking-wider"
    >
      Shortlisting process in progress
    </div>
  </Card.Footer>
</Card.Root>
