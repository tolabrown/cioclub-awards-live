<script lang="ts">
	import { LineChart } from "layerchart";
	import { TrendingUp } from "@lucide/svelte";
	import { curveLinearClosed } from "d3-shape";
	import { scaleBand } from "d3-scale";
	import * as Chart from "$lib/components/ui/chart";
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle,
	} from "$lib/components/ui/card";

	interface Props {
		data: Array<{
			subject: string;
			A: number;
			fullMark: number;
		}>;
		title?: string;
		description?: string;
	}

	let {
		data,
		title = "Performance Metrics",
		description = "Multi-dimensional performance overview",
	}: Props = $props();

	// Transform data for radar chart
	const chartData = $derived(
		data.map((item) => ({
			metric: item.subject,
			value: item.A,
		})),
	);

	// Create chart config
	const chartConfig = {
		value: {
			label: "Performance",
			color: "var(--chart-1)",
		},
	} satisfies Chart.ChartConfig;

	const avgScore = $derived(
		data.length > 0
			? Math.round(data.reduce((sum, item) => sum + item.A, 0) / data.length)
			: 0,
	);
</script>

<Card>
	<CardHeader class="items-center pb-4">
		<CardTitle>{title}</CardTitle>
		<CardDescription>{description}</CardDescription>
	</CardHeader>
	<CardContent class="pb-0">
		<Chart.Container
			config={chartConfig}
			class="mx-auto aspect-square max-h-[350px]"
		>
			{#if chartData.length > 0}
				<LineChart
					radial
					data={chartData}
					x="metric"
					xScale={scaleBand()}
					padding={12}
					series={[
						{
							key: "value",
							label: "Performance",
							color: chartConfig.value.color,
							props: { class: "fill-primary/20 stroke-[2]" },
						},
					]}
					props={{
						spline: { curve: curveLinearClosed, motion: "tween" },
						grid: { radialY: "linear", x: false },
						yAxis: { format: () => "" },
						tooltip: { context: { mode: "voronoi" } },
					}}
				>
					{#snippet tooltip()}
						<Chart.Tooltip />
					{/snippet}
				</LineChart>
			{:else}
				<div
					class="flex h-full items-center justify-center text-muted-foreground"
				>
					No data available
				</div>
			{/if}
		</Chart.Container>
	</CardContent>
	<CardFooter class="flex-col gap-2 text-sm">
		<div class="flex items-center gap-2 font-medium leading-none">
			Average score: {avgScore}% <TrendingUp class="size-4" />
		</div>
		<div class="text-muted-foreground flex items-center gap-2 leading-none">
			{data.length} performance {data.length === 1 ? "metric" : "metrics"}
		</div>
	</CardFooter>
</Card>
