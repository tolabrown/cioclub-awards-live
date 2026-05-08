<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Utensils, Activity, Video, Droplets, Pill, FileText } from '@lucide/svelte';

	const features = [
		{
			icon: Utensils,
			title: 'Personalized Diet Monitoring',
			description:
				'Log your meals and receive instant feedback on how they affect your chronic condition.'
		},
		{
			icon: Activity,
			title: 'Chronic Condition Management',
			description:
				'Remote monitoring and AI insights specifically designed for managing long-term ailments.'
		},
		{
			icon: Video,
			title: 'Telemedicine Consultations',
			description: 'Connect with expert doctors and dietitians via high-quality video conferencing.'
		},

		{
			icon: Pill,
			title: 'Care Coordination',
			description:
				'Smart appointment reminders and medication schedules to keep your health on track.'
		},
		{
			icon: FileText,
			title: 'Secure Health Records',
			description:
				'Upload and manage your test results securely, with AI-powered data interpretation.'
		}
	];
</script>

<section class="py-24 bg-muted/30">
	<div class="container mx-auto px-4">
		<div class="text-center mb-16 max-w-2xl mx-auto">
			<Badge variant="secondary" class="mb-4">Features</Badge>
			<h2 class="font-bold mb-4">
				Comprehensive <span class="text-primary">Medical Care</span>
			</h2>
			<p class=" text-muted-foreground">
				Expert support for your health journey, from dietetics to remote monitoring and personalized
				insights.
			</p>
		</div>

		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each features as feature}
				{@const Icon = feature.icon}
				<Card
					class="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-border/50"
				>
					<CardHeader>
						<div
							class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors"
						>
							<Icon class="w-6 h-6 text-primary" />
						</div>
						<CardTitle class="">{feature.title}</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-muted-foreground leading-relaxed">{feature.description}</p>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</section>
