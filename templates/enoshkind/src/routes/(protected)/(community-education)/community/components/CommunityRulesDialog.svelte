<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Shield, CheckCircle2, AlertCircle, Scale, X, ShieldCheck } from '@lucide/svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	let { open = $bindable(false) } = $props<{ open: boolean }>();

	const rules = [
		{
			icon: CheckCircle2,
			title: 'Respect & Empathy',
			description:
				'Maintain a supportive tone. Harassment, hate speech, or bullying of any kind will not be tolerated.',
			color: 'text-emerald-500'
		},
		{
			icon: Shield,
			title: 'Privacy First',
			description:
				'Do not share personal health information (PHI) of yourself or others that could lead to identification.',
			color: 'text-indigo-500'
		},
		{
			icon: AlertCircle,
			title: 'No Medical Advice',
			description:
				'Discussions are for peer support only. Always consult a qualified professional for medical decisions.',
			color: 'text-amber-500'
		},
		{
			icon: Scale,
			title: 'Evidence-Based',
			description:
				'Avoid spreading misinformation. Share information from reputable sources and distinguish personal experience from facts.',
			color: 'text-purple-500'
		}
	];
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[600px] p-0 bg-card/95 backdrop-blur-2xl border-border/40 overflow-hidden rounded-xl shadow-lg"
	>
		<div class="bg-primary p-4 text-white relative">
			<div class="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
			<Dialog.Header>
				<Dialog.Title class="text-3xl font-bold tracking-tight">Community Protocols</Dialog.Title>
				<Dialog.Description class="text-white/80 font-medium mt-2 text-base">
					Guidelines for a safe, supportive, and clinical-grade health community.
				</Dialog.Description>
			</Dialog.Header>
		</div>

		<div class="p-4 md:space-y-4">
			<ScrollArea class="h-[280px] grid gap-5">
				{#each rules as rule, i}
					<div
						class="flex gap-5 p-4 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all group"
					>
						<div
							class="p-4 rounded-xl bg-white shadow-sm h-fit group-hover:scale-110 transition-transform"
						>
							<rule.icon class="w-6 h-6 {rule.color}" />
						</div>
						<div class="space-y-1">
							<h4 class="font-bold text-foreground capitalize text-xs tracking-widest">
								{rule.title}
							</h4>
							<p class="text-sm text-muted-foreground leading-relaxed font-medium">
								{rule.description}
							</p>
						</div>
					</div>
				{/each}
			</ScrollArea>

			<div
				class="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl space-y-3 border border-indigo-100 dark:border-indigo-900 relative overflow-hidden"
			>
				<ShieldCheck
					class="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-500/10 pointer-events-none"
				/>
				<p class="text-sm capitalize font-bold text-indigo-600 tracking-[0.2em]">
					Enforcement Policy
				</p>
				<p class="text-xs font-semibold leading-relaxed text-indigo-900/70 dark:text-indigo-200/50">
					Failure to adhere to these clinical-grade standards may result in content removal or
					suspension. Moderators maintain the final authority in preserving community safety.
				</p>
			</div>

			<Button
				class="w-full rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold capitalize text-sm tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
				onclick={() => (open = false)}
			>
				I Attest & Join
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
