<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import {
		Video,
		Calendar,
		Clock,
		User,
		CheckCircle2,
		XCircle,
		MoreVertical,
		TrendingUp,
		Users,
		Star,
		Wallet,
		Trash2,
		AlertTriangle
	} from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { format } from 'date-fns';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let { data } = $props();
	const consultations = $derived(data.consultations);
	const doctor = $derived(data.doctor);

	const stats = $derived([
		{
			label: 'Total Earnings',
			value: `₦${(doctor.earnings || 0).toLocaleString()}`,
			icon: Wallet,
			color: 'text-green-500'
		},
		{
			label: 'Patients',
			value: new Set(consultations.map((c) => c.userId)).size,
			icon: Users,
			color: 'text-blue-500'
		},
		{ label: 'Rating', value: doctor.rating || '5.0', icon: Star, color: 'text-yellow-500' },
		{
			label: 'Completed',
			value: consultations.filter((c) => c.status === 'completed').length,
			icon: CheckCircle2,
			color: 'text-primary'
		}
	]);

	let deleting = $state(false);

	async function handleDeleteProfile() {
		deleting = true;
		try {
			const res = await fetch('/api/doctors/profile', { method: 'DELETE' });
			const data = await res.json();
			if (data.success) {
				toast.success('Doctor profile deleted');
				window.location.href = '/telemedicine';
			} else {
				toast.error('Failed to delete profile', { description: data.message });
			}
		} catch (e) {
			toast.error('An error occurred during deletion');
		} finally {
			deleting = false;
		}
	}
</script>

<div class="w-full py-10 space-y-10 overflow-hidden">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
		<div>
			<h1 class="text-4xl font-bold tracking-tight text-primary">Doctor Portal</h1>
			<p class="text-muted-foreground mt-2">Manage your virtual practice and patient care.</p>
		</div>
		<div class="flex gap-4 flex-col md:flex-row">
			<Button variant="outline" href="/telemedicine/doctor/availability" class="font-bold gap-2">
				<Calendar class="w-4 h-4" />
				Set Availability
			</Button>
			<Button href="/telemedicine" class="shadow-lg shadow-primary/30">View Public Profile</Button>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each stats as stat}
			<Card class="border-border/40 shadow-sm hover:shadow-md transition-all group">
				<CardContent class="p-6 flex items-center gap-4">
					<div class="p-3 bg-muted/50 group-hover:bg-primary/5 transition-colors">
						<stat.icon class="w-6 h-6 {stat.color}" />
					</div>
					<div>
						<p class="text-sm font-medium text-muted-foreground">{stat.label}</p>
						<p class="text-2xl font-bold tracking-tight">{stat.value}</p>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Main Content -->
	<div class="grid lg:grid-cols-3 gap-10">
		<!-- Consultations List -->
		<div class="lg:col-span-2 space-y-6">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-bold flex items-center gap-3">
					<Video class="text-primary w-6 h-6" />
					Recent Consultations
				</h2>
			</div>

			<div class="space-y-4">
				{#each consultations as consultation}
					<Card
						class="border-border/40 shadow-sm overflow-hidden group hover:ring-2 hover:ring-primary/10 transition-all"
					>
						<CardContent class="p-0">
							<div class="flex flex-col sm:flex-row sm:items-center p-6 gap-6">
								<div
									class="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20"
								>
									{#if consultation.user.image}
										<img
											src={consultation.user.image}
											alt={consultation.user.name}
											class="w-full h-full object-cover"
										/>
									{:else}
										<User class="w-8 h-8 text-primary" />
									{/if}
								</div>

								<div class="flex-1 space-y-1">
									<div class="flex items-center justify-between">
										<h3 class="font-bold">{consultation.user.name}</h3>
										<span
											class="px-3 py-1 text-xs font-bold capitalize tracking-wider
											{consultation.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : ''}
											{consultation.status === 'confirmed' ? 'bg-green-500/10 text-green-600' : ''}
											{consultation.status === 'completed' ? 'bg-primary/10 text-primary' : ''}
											{consultation.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : ''}"
										>
											{consultation.status}
										</span>
									</div>
									<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
										<span class="flex items-center gap-1.5 font-medium">
											<Calendar class="w-4 h-4" />
											{format(new Date(consultation.appointmentDate), 'MMM d, yyyy')}
										</span>
										<span class="flex items-center gap-1.5 font-medium">
											<Clock class="w-4 h-4" />
											{consultation.appointmentTime}
										</span>
										<span class="flex items-center gap-1.5 font-bold text-primary">
											₦{((consultation.totalFee ?? 0) / 100).toLocaleString()}
										</span>
									</div>
								</div>

								<div class="flex items-center gap-2">
									{#if consultation.status === 'pending'}
										<Button
											size="sm"
											class="font-bold bg-primary"
											href={`/telemedicine/doctor/consultation/${consultation.id}`}
										>
											Review Booking
										</Button>
									{:else if consultation.status === 'confirmed'}
										<Button
											size="sm"
											class="font-bold gap-2"
											href={`/telemedicine/doctor/consultation/${consultation.id}`}
										>
											<Video class="w-4 h-4" />
											Join Room
										</Button>
									{:else}
										<Button
											variant="ghost"
											size="sm"
											class="font-medium"
											href={`/telemedicine/doctor/consultation/${consultation.id}`}
										>
											View Details
										</Button>
									{/if}
								</div>
							</div>
						</CardContent>
					</Card>
				{:else}
					<div class="text-center py-24 bg-muted/20 border-2 border-dashed border-border/40">
						<Video class="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
						<p class="text-muted-foreground font-medium">No consultations found yet.</p>
						<p class="text-sm text-muted-foreground">
							Bookings will appear here once patients schedule sessions.
						</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Sidebar / Tips -->
		<div class="space-y-6">
			<!-- Practitioner Tip -->
			<Card
				class="border-none shadow-2xl bg-gradient-to-br from-indigo-600 via-primary to-blue-700 text-white overflow-hidden relative group hover:scale-[1.02] transition-all duration-500"
			>
				<!-- Decorative elements -->
				<div
					class="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/30 transition-colors"
				></div>
				<div
					class="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full -ml-16 -mb-16 blur-2xl group-hover:bg-black/30 transition-colors"
				></div>

				<CardHeader class="relative z-10 pt-8 px-8">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-white/20 backdrop-blur-md border border-white/30">
							<TrendingUp class="w-5 h-5 text-white" />
						</div>
						<CardTitle class="text-2xl font-bold tracking-tight">Practitioner Tip</CardTitle>
					</div>
				</CardHeader>
				<CardContent class="space-y-6 relative z-10 p-8 pt-4">
					<p class="text-base text-white/90 font-medium leading-relaxed">
						Keep your practice thriving. Complete consultation notes immediately after sessions to
						ensure <span
							class="text-white font-bold underline decoration-white/30 underline-offset-4"
							>timely payouts</span
						> and precise medical records.
					</p>

					<div
						class="p-5 bg-white/10 backdrop-blur-xl border border-white/20 shadow-inner group/fee hover:bg-white/15 transition-all"
					>
						<div class="flex items-center justify-between">
							<div class="space-y-1">
								<p class="text-sm font-bold capitalize tracking-[0.2em] text-white/60">
									Platform Standard
								</p>
								<p class="text-xl font-bold">15% platform fee</p>
							</div>
							<div class="p-3 bg-white/20 text-white">
								<Wallet class="w-6 h-6" />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/40 shadow-sm">
				<CardHeader>
					<CardTitle class=" font-bold">Quick Actions</CardTitle>
				</CardHeader>
				<CardContent class="grid gap-3 p-4 pt-0">
					<Button
						variant="ghost"
						class="justify-start font-bold gap-3 hover:bg-primary/5 hover:text-primary transition-all"
					>
						<div class="p-2 bg-primary/10">
							<TrendingUp class="w-4 h-4" />
						</div>
						View Analytics
					</Button>
					<Button
						variant="ghost"
						class="justify-start font-bold gap-3 hover:bg-orange-500/5 hover:text-orange-600 transition-all"
					>
						<div class="p-2 bg-orange-500/10">
							<Wallet class="w-4 h-4" />
						</div>
						Payout History
					</Button>
				</CardContent>
			</Card>

			<!-- Danger Zone -->
			<Card class="border-destructive/20 shadow-sm bg-destructive/5">
				<CardHeader>
					<CardTitle class=" font-bold text-destructive flex items-center gap-2">
						<AlertTriangle class="w-5 h-5" />
						Danger Zone
					</CardTitle>
					<CardDescription>Actions that cannot be undone</CardDescription>
				</CardHeader>
				<CardContent class="p-4 pt-0">
					<AlertDialog.Root>
						<AlertDialog.Trigger>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="ghost"
									class="w-full justify-start font-bold gap-3 text-destructive hover:bg-destructive/10 transition-all"
								>
									<div class="p-2 bg-destructive/10">
										<Trash2 class="w-4 h-4" />
									</div>
									Delete Doctor Profile
								</Button>
							{/snippet}
						</AlertDialog.Trigger>
						<AlertDialog.Content class="border-border/40">
							<AlertDialog.Header>
								<AlertDialog.Title class="text-2xl font-bold"
									>Are you absolutely sure?</AlertDialog.Title
								>
								<AlertDialog.Description class="text-base">
									This action will permanently delete your practitioner profile and availability
									settings. You will no longer be visible to patients on the platform.
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer class="gap-3">
								<AlertDialog.Cancel class="font-bold">Cancel</AlertDialog.Cancel>
								<AlertDialog.Action
									onclick={handleDeleteProfile}
									disabled={deleting}
									class="font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all"
								>
									{#if deleting}
										Deleting...
									{:else}
										Delete My Profile
									{/if}
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
