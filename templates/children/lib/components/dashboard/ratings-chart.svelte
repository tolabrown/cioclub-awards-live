<script lang="ts">
	import * as Chart from "$lib/components/ui/chart";
	import { Chart as LayerChart, Svg, Pie } from "layerchart";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from "$lib/components/ui/card";

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

	// Transform data for pie chart if needed, but our data structure is already { group, value }
	// The template used { rating, count } and mapped it. We can just use our data directly or map it if we want custom labels.
	// Let's assume data comes in as { group: string, value: number } which matches our backend.

	const chartData = $derived(
		data.map((item) => ({
			label: item.group,
			value: item.value,
			group: item.group,
		})),
	);

	// Generate dynamic config based on data length
	// We can use a predefined palette or generate colors.
	// For simplicity, let's map up to 5-6 colors from chart variables.
	const colors = [
		"hsl(var(--chart-1))",
		"hsl(var(--chart-2))",
		"hsl(var(--chart-3))",
		"hsl(var(--chart-4))",
		"hsl(var(--chart-5))",
		"hsl(var(--chart-6))",
	];

	const chartConfig = $derived(
		Object.fromEntries(
			data.map((item, index) => [
				item.group,
				{
					label: item.group,
					color: colors[index % colors.length],
				},
			]),
		),
	) as Chart.ChartConfig;

	const total = $derived(data.reduce((sum, item) => sum + item.value, 0));
</script>

<Card>
	<CardHeader>
		<CardTitle>{title}</CardTitle>
		<CardDescription>{description} (Total: {total})</CardDescription>
	</CardHeader>
	<CardContent>
		<Chart.Container config={chartConfig} class="min-h-[300px] w-full">
			<LayerChart
				data={chartData}
				x="value"
				c="group"
				cDomain={data.map((d) => d.group)}
				cRange={colors}
			>
				<Svg>
					<Pie innerRadius={60} cornerRadius={4} padAngle={0.02} />
				</Svg>
				<Chart.Tooltip />
			</LayerChart>
		</Chart.Container>
	</CardContent>
</Card>
