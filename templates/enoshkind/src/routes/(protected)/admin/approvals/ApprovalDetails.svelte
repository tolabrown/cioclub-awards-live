<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { FileText, ExternalLink, Check, X, User, ShieldCheck, Loader2 } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { mediaQueries } from '$lib/hooks/use-media-query.svelte';
	import { onMount } from 'svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	let {
		open = $bindable(false),
		data,
		onApprove,
		onReject,
		loading = false,
		processingId = ''
	} = $props<{
		open: boolean;
		data: any;
		onApprove: (id: string) => void;
		onReject: (id: string) => void;
		loading?: boolean;
		processingId?: string;
	}>();

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	const { doctor: d, user: u } = $derived(data || { doctor: {}, user: {} });
</script>

{#snippet content()}
	<div class="flex flex-col md:flex-row h-auto md:h-[680px] overflow-visible md:overflow-hidden">
		<!-- Sidebar: Profile Summary -->
		<div
			class="w-full md:w-80 bg-muted/40 border-b md:border-b-0 md:border-r border-border/40 p-8 flex flex-col items-center text-center space-y-6 shrink-0"
		>
			<div class="relative">
				{#if d.image || u?.image}
					<img
						src={d.image || u?.image}
						alt={d.name}
						class="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border-4 border-background shadow-lg"
					/>
				{:else}
					<div
						class="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-lg"
					>
						<User class="w-12 h-12 md:w-16 md:h-16" />
					</div>
				{/if}
				<div
					class={cn(
						'absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 border-4 border-background rounded-full shadow-md',
						d.approved
							? 'bg-emerald-500 shadow-emerald-500/20'
							: 'bg-orange-500 shadow-orange-500/20'
					)}
				></div>
			</div>

			<div class="space-y-3">
				<h2 class="text-2xl font-bold tracking-tight leading-tight">{d.name}</h2>
				<p
					class="text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full inline-block"
				>
					{d.specialty}
				</p>
			</div>

			<div class="w-full pt-8 space-y-5 text-left border-t border-border/20">
				<div class="space-y-1">
					<p
						class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60"
					>
						Email Address
					</p>
					<p class="text-sm font-bold text-foreground/90 break-all">{u?.email || 'N/A'}</p>
				</div>
				<div class="space-y-1">
					<p
						class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60"
					>
						Member Since
					</p>
					<p class="text-sm font-bold text-foreground/90">
						{new Date(d.createdAt).toLocaleDateString(undefined, {
							month: 'short',
							day: 'numeric',
							year: 'numeric'
						})}
					</p>
				</div>
			</div>
		</div>

		<!-- Right Side: Details & Actions -->
		<div class="flex-1 p-8 md:p-12 flex flex-col justify-between min-h-0 bg-background/5">
			<ScrollArea class="flex-1 md:pr-4">
				<div class="space-y-10 pb-10">
					<!-- Header Section -->
					<div class="space-y-3">
						<h3 class="text-2xl md:text-3xl font-bold tracking-tight">Verification Review</h3>
						<p class="text-muted-foreground text-sm font-medium max-w-2xl leading-relaxed">
							Review the practitioner's credentials and medical license to confirm their
							registration.
						</p>
					</div>

					<!-- Document Section -->
					<div class="space-y-4">
						<p
							class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60"
						>
							Medical License Document
						</p>
						{#if d.licenseUrl}
							<a
								href={d.licenseUrl}
								target="_blank"
								class="flex items-center justify-between p-6 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all group shadow-sm"
							>
								<div class="flex items-center gap-4">
									<div
										class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20"
									>
										<FileText class="w-6 h-6 text-primary" />
									</div>
									<div class="text-left">
										<p class="font-bold">Practice License</p>
										<p
											class="text-[11px] text-muted-foreground font-medium uppercase tracking-tight"
										>
											Verification Certificate
										</p>
									</div>
								</div>
								<ExternalLink
									class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
								/>
							</a>
						{:else}
							<div
								class="p-10 rounded-xl bg-destructive/5 border-2 border-dashed border-destructive/20 text-center space-y-3"
							>
								<X class="w-10 h-10 text-destructive mx-auto opacity-40 shadow-sm" />
								<p class="font-bold text-destructive">License Document Not Provided</p>
							</div>
						{/if}
					</div>

					<!-- Background Info Section -->
					<div class="space-y-4">
						<div
							class="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60"
						>
							<ShieldCheck class="w-4 h-4 text-primary" />
							Background Information
						</div>
						<p class="text-sm text-foreground/70 font-bold leading-relaxed max-w-2xl">
							Manual background checks should be completed via the official medical registry prior
							to approval. Ensure all provided details match the government records.
						</p>
					</div>
				</div>
			</ScrollArea>

			<!-- Footer Actions -->
			<div class="flex flex-col md:flex-row gap-4 pt-8 border-t border-border/40 shrink-0">
				{#if d.approved}
					<Button
						class="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
						onclick={() => onApprove(d.id)}
						disabled={loading && processingId === d.id}
					>
						{#if loading && processingId === d.id}
							<Loader2 class="w-5 h-5 animate-spin" />
						{:else}
							<Check class="w-5 h-5" />
						{/if}
						Re-approve
					</Button>
					<Button
						variant="destructive"
						class="flex-1 font-bold gap-2 shadow-lg shadow-destructive/20 transition-all active:scale-[0.98]"
						onclick={() => onReject(d.id)}
						disabled={loading && processingId === d.id}
					>
						<X class="w-5 h-5" />
						Disapprove
					</Button>
				{:else}
					<Button
						class="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
						onclick={() => onApprove(d.id)}
						disabled={loading && processingId === d.id}
					>
						{#if loading && processingId === d.id}
							<Loader2 class="w-5 h-5 animate-spin" />
						{:else}
							<Check class="w-5 h-5" />
						{/if}
						Approve Practitioner
					</Button>
					<Button
						variant="destructive"
						class="flex-1 font-bold py-6 gap-2 shadow-lg shadow-destructive/20 transition-all active:scale-[0.98]"
						onclick={() => onReject(d.id)}
						disabled={loading && processingId === d.id}
					>
						<X class="w-5 h-5" />
						Reject Application
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

{#if data}
	{#if mediaQueries.md.current}
		<Dialog.Root bind:open>
			<Dialog.Content
				class="md:max-w-5xl w-full p-0 rounded-xl overflow-hidden border-border/40 bg-card/60 backdrop-blur-3xl shadow-lg"
			>
				{@render content()}
			</Dialog.Content>
		</Dialog.Root>
	{:else if mounted}
		<Drawer.Root bind:open>
			<Drawer.Content class="bg-card border-border/40 shadow-lg p-0 rounded-t-xl overflow-hidden">
				<ScrollArea class="max-h-[85vh] w-full overflow-x-hidden">
					<div class="px-2 pb-8">
						{@render content()}
					</div>
				</ScrollArea>
			</Drawer.Content>
		</Drawer.Root>
	{/if}
{/if}
