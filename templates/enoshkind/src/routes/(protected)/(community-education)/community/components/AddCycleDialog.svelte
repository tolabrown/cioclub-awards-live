<script module>
	import { ShieldCheck } from '@lucide/svelte';
</script>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { Plus, X, Globe, Users, TrendingUp, Sparkles, Loader2 } from '@lucide/svelte';

	let { open = $bindable(false), onAdded } = $props<{ open: boolean; onAdded: () => void }>();

	let loading = $state(false);
	let form = $state({
		name: '',
		description: '',
		image: '',
		activity: 'Moderate'
	});

	async function handleSubmit() {
		if (!form.name) return toast.error('Name is required');
		loading = true;
		try {
			const res = await fetch('/api/community', {
				method: 'POST',
				body: JSON.stringify(form)
			});
			if (res.ok) {
				toast.success('Community Cycle Created');
				onAdded();
				open = false;
				form = { name: '', description: '', image: '', activity: 'Moderate' };
			}
		} catch (e) {
			toast.error('Failed to create cycle');
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[550px] p-0 bg-card/95 backdrop-blur-2xl border-border/40 overflow-hidden rounded-xl shadow-lg"
	>
		<div class="bg-primary p-4 text-white relative">
			<div class="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
			<Dialog.Header>
				<Dialog.Title class="text-3xl font-bold tracking-tight">Ignite a New Cycle</Dialog.Title>
				<Dialog.Description class="text-white/80 font-medium text-base"
					>Create a safe haven for collective healing and growth.</Dialog.Description
				>
			</Dialog.Header>
		</div>

		<div class="p-4 md:space-y-4">
			<div class="grid gap-6">
				<div class="space-y-2">
					<Label
						for="name"
						class="font-bold text-sm capitalize tracking-widest text-muted-foreground ml-1"
						>Cycle Name</Label
					>
					<Input
						id="name"
						bind:value={form.name}
						placeholder="e.g. Chronic Pain Warriors"
						class="rounded-xl bg-background/50 border-border/40 font-bold px-6 focus:ring-primary/20 transition-all"
					/>
				</div>

				<div class="space-y-2">
					<Label
						for="desc"
						class="font-bold text-sm capitalize tracking-widest text-muted-foreground ml-1"
						>Community Statement</Label
					>
					<Textarea
						id="desc"
						bind:value={form.description}
						placeholder="What is the mission of this community?"
						class="rounded-xl bg-background/50 border-border/40 min-h-[120px] font-medium p-6 focus:ring-primary/20 transition-all resize-none"
					/>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<div class="space-y-2">
						<Label class="font-bold text-sm capitalize tracking-widest text-muted-foreground ml-1"
							>Activity Level</Label
						>
						<select
							bind:value={form.activity}
							class="h-10 w-full rounded-xl bg-background/50 border-border/40 px-6 text-sm font-bold capitalize tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
						>
							<option value="Low">Low</option>
							<option value="Moderate">Moderate</option>
							<option value="High">High</option>
							<option value="Very High">Very High</option>
						</select>
					</div>
					<div class="space-y-2">
						<Label
							for="image"
							class="font-bold text-sm capitalize tracking-widest text-muted-foreground ml-1"
							>Icon Identifier</Label
						>
						<Input
							id="image"
							bind:value={form.image}
							placeholder="e.g. CPW, HW"
							class="rounded-xl bg-background/50 border-border/40 font-bold capitalize tracking-widest px-6 focus:ring-primary/20 transition-all"
						/>
					</div>
				</div>
			</div>

			<div class="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-4">
				<ShieldCheck class="w-6 h-6 text-primary shrink-0 mt-0.5" />
				<p class="text-[11px] text-muted-foreground font-medium leading-relaxed">
					By creating this cycle, you agree to Enoshkind's community guidelines. All cycles are
					subject to moderation by our clinical protocols.
				</p>
			</div>

			<div class="flex gap-4 pt-4">
				<Button
					variant="outline"
					class="flex-1 rounded-xl font-bold capitalize text-sm tracking-widest border-border/40 hover:bg-muted"
					onclick={() => (open = false)}>Cancel</Button
				>
				<Button
					class="flex-[2] rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold capitalize text-sm tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
					onclick={handleSubmit}
					disabled={loading}
				>
					{#if loading}
						<Loader2 class="w-4 h-4 mr-2 animate-spin" />
						Creating...
					{:else}
						<Plus class="w-4 h-4 mr-2" />
						Launch Cycle
					{/if}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
