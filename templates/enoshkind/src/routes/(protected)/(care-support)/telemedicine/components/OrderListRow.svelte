<script lang="ts">
	import { TableCell, TableRow } from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Video,
		Beaker,
		Pill,
		Calendar,
		Clock,
		CreditCard,
		CheckCircle2,
		AlertCircle,
		ExternalLink,
		PhoneCall
	} from '@lucide/svelte';
	import { format } from 'date-fns';

	interface Props {
		type: 'consultation' | 'lab' | 'pharmacy';
		item: any;
		screen: 'desktop' | 'mobile';
		onViewDetails?: (item: any, type: string) => void;
	}

	let { type, item, screen, onViewDetails }: Props = $props();

	const getStatusVariant = (status: string) => {
		switch (status.toLowerCase()) {
			case 'confirmed':
			case 'completed':
			case 'results_ready':
			case 'delivered':
				return 'default';
			case 'pending':
			case 'order_placed':
				return 'secondary';
			case 'cancelled':
				return 'destructive';
			default:
				return 'secondary';
		}
	};

	const formatPrice = (amount: number) => {
		return `₦${(amount / 100).toLocaleString()}`;
	};
</script>

{#if screen === 'desktop'}
	<TableRow class="transition-colors">
		<TableCell>
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
					{#if type === 'consultation'}
						<Video class="w-4 h-4 text-primary" />
					{:else if type === 'lab'}
						<Beaker class="w-4 h-4 text-primary" />
					{:else}
						<Pill class="w-4 h-4 text-primary" />
					{/if}
				</div>
				<div class="flex flex-col min-w-0">
					<span class="font-bold text-sm truncate">
						{#if type === 'consultation'}
							{item.doctor?.name || 'Assigned Doctor'}
						{:else if type === 'lab'}
							{item.testType}
						{:else}
							{item.pharmacyName}
						{/if}
					</span>
					<span class="text-sm text-muted-foreground capitalize font-bold tracking-widest">
						{#if type === 'consultation'}
							{item.type} Consultation
						{:else if type === 'lab'}
							Home Test Kit
						{:else}
							Medication Order
						{/if}
					</span>
				</div>
			</div>
		</TableCell>

		<TableCell>
			<div class="flex flex-col text-sm">
				<div class="flex items-center gap-1.5 font-bold">
					<Calendar class="w-3 h-3 text-primary" />
					{format(
						new Date(item.appointmentDate || item.scheduledCollection || item.createdAt),
						'MMM dd, yyyy'
					)}
				</div>
				{#if item.appointmentTime}
					<div class="flex items-center gap-1.5 text-muted-foreground text-xs">
						<Clock class="w-3 h-3" />
						{item.appointmentTime}
					</div>
				{/if}
			</div>
		</TableCell>

		<TableCell>
			<Badge
				variant={getStatusVariant(item.status)}
				class="capitalize font-bold text-sm px-2 rounded-full"
			>
				{item.status.replace('_', ' ')}
			</Badge>
		</TableCell>

		<TableCell>
			<Badge
				variant={item.paid ? 'default' : 'destructive'}
				class="font-bold text-sm px-2 rounded-full"
			>
				{#if item.paid}
					<CheckCircle2 class="w-3 h-3 mr-1" />
					Paid
				{:else}
					<AlertCircle class="w-3 h-3 mr-1" />
					Unpaid
				{/if}
			</Badge>
		</TableCell>

		<TableCell class="text-right">
			<div class="flex items-center justify-end gap-2">
				{#if type === 'consultation' && item.paid}
					<Button
						size="sm"
						variant="outline"
						href="/telemedicine/{item.id}/stream"
						class="rounded-xl font-bold gap-1.5"
					>
						<Video class="w-3.5 h-3.5" />
						Join
					</Button>
				{:else}
					<Button
						size="sm"
						variant="ghost"
						class="rounded-xl font-bold gap-1.5"
						onclick={() => onViewDetails?.(item, type)}
					>
						<ExternalLink class="w-3.5 h-3.5" />
						View
					</Button>
				{/if}
			</div>
		</TableCell>
	</TableRow>
{:else}
	<div
		class="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-4 space-y-4 shadow-lg transition-all"
	>
		<div class="flex items-start justify-between">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
					{#if type === 'consultation'}
						<Video class="w-5 h-5 text-primary" />
					{:else if type === 'lab'}
						<Beaker class="w-5 h-5 text-primary" />
					{:else}
						<Pill class="w-5 h-5 text-primary" />
					{/if}
				</div>
				<div>
					<h4 class="font-bold text-sm">
						{#if type === 'consultation'}
							{item.doctor?.name || 'Assigned Doctor'}
						{:else if type === 'lab'}
							{item.testType}
						{:else}
							{item.pharmacyName}
						{/if}
					</h4>
					<p class="text-sm text-muted-foreground capitalize font-bold tracking-widest">
						{#if type === 'consultation'}
							{item.type} Consultation
						{:else if type === 'lab'}
							Home Test Kit
						{:else}
							Medication Order
						{/if}
					</p>
				</div>
			</div>
			<Badge
				variant={getStatusVariant(item.status)}
				class="capitalize font-bold text-sm px-2 rounded-full"
			>
				{item.status.replace('_', ' ')}
			</Badge>
		</div>

		<div class="grid grid-cols-2 gap-2 p-2 bg-muted/20 rounded-xl">
			<div>
				<p class="text-[9px] text-muted-foreground font-bold capitalize tracking-tighter">Date</p>
				<p class="text-[11px] font-bold">
					{format(
						new Date(item.appointmentDate || item.scheduledCollection || item.createdAt),
						'MMM dd, yyyy'
					)}
				</p>
			</div>
			<div>
				<p class="text-[9px] text-muted-foreground font-bold capitalize tracking-tighter">
					Payment
				</p>
				<Badge
					variant={item.paid ? 'default' : 'destructive'}
					class="font-bold text-[9px] px-1.5 py-0 rounded-full"
				>
					{item.paid ? 'Paid' : 'Unpaid'}
				</Badge>
			</div>
		</div>

		<div class="flex gap-2">
			{#if type === 'consultation' && item.paid}
				<Button href="/telemedicine/{item.id}/stream" class="flex-1 rounded-xl font-bold shadow-lg">
					<Video class="w-4 h-4 mr-2" />
					Join Call
				</Button>
			{:else}
				<Button
					variant="outline"
					class="flex-1 rounded-xl font-bold bg-white"
					onclick={() => onViewDetails?.(item, type)}
				>
					Details
				</Button>
			{/if}
		</div>
	</div>
{/if}
