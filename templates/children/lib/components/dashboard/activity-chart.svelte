<script lang="ts">
	import * as Chart from "$lib/components/ui/chart";
	import {
		Chart as LayerChart,
		Svg,
		Axis,
		Area,
		Highlight,
		LinearGradient,
	} from "layerchart";
	import { scaleBand } from "d3-scale";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from "$lib/components/ui/card";

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

	const chartConfig = {
		value: {
			label: "Count",
			color: "hsl(var(--chart-3))",
		},
	} satisfies Chart.ChartConfig;
</script>

<Card>
	<CardHeader>
		<CardTitle>{title}</CardTitle>
		<CardDescription>{description}</CardDescription>
	</CardHeader>
	<CardContent>
		<Chart.Container config={chartConfig} class="min-h-[300px] w-full">
			<LayerChart
				{data}
				x="date"
				xScale={scaleBand().padding(0.4)}
				y="value"
				yDomain={[0, null]}
				yNice
				padding={{ left: 16, bottom: 24 }}
			>
				<Svg>
					<Axis placement="left" grid rule />
					<Axis placement="bottom" rule />
					<LinearGradient class="from-primary/50 to-primary/0" vertical>
						{#snippet children({ id, gradient })}
							<Area
								line={{ class: "stroke-2 stroke-primary" }}
								fill={`url(#${id})`}
							/>
							<Highlight points lines />
						{/snippet}
					</LinearGradient>
				</Svg>
				<Chart.Tooltip />
			</LayerChart>
		</Chart.Container>
	</CardContent>
</Card>
