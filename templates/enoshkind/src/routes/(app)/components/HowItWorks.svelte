<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { FileSearch, Activity, Video, Bot } from '@lucide/svelte';

	const steps = [
		{
			number: '01',
			icon: FileSearch,
			title: 'Health Assessment',
			description:
				'Complete your profile and health assessment to receive personalized guidance for your condition.'
		},
		{
			number: '02',
			icon: Activity,
			title: 'Daily Tracking',
			description:
				'Log your vitals, meals, and activities to see real-time trends and AI health insights.'
		},
		{
			number: '03',
			icon: Video,
			title: 'Expert Consultation',
			description:
				'Book and attend video sessions with specialized doctors and dietitians at your convenience.'
		},
		{
			number: '04',
			icon: Bot,
			title: 'Gained Intelligence',
			description:
				'Receive comprehensive health reports and AI-powered intelligence to manage your condition effectively.'
		}
	];
</script>

<section class="py-24">
	<div class="container mx-auto px-4">
		<div class="text-center mb-16 max-w-2xl mx-auto">
			<Badge variant="secondary" class="mb-4">How It Works</Badge>
			<h2 class="font-bold mb-4">
				Experience <span class="text-primary">Better Care</span>
			</h2>
			<p class=" text-muted-foreground">
				A seamless journey from assessment to expert insights, right at your fingertips.
			</p>
		</div>

		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each steps as step, i}
				{@const Icon = step.icon}
				<div class="relative">
					<!-- Connector line -->
					{#if i < steps.length - 1}
						<div
							class="hidden lg:block absolute top-12 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-border"
						></div>
					{/if}

					<div class="text-center">
						<div class="relative inline-flex mb-6">
							<div class="w-24 h-24 rounded-xl bg-muted flex items-center justify-center">
								<Icon class="w-10 h-10 text-primary" />
							</div>
							<span
								class="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold"
							>
								{step.number}
							</span>
						</div>
						<h3 class=" font-semibold mb-2">{step.title}</h3>
						<p class="text-muted-foreground leading-relaxed">{step.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
