<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import * as Avatar from '$lib/components/ui/avatar';
	import {
		Settings,
		Bell,
		Lock,
		Eye,
		Smartphone,
		Globe,
		Shield,
		CreditCard,
		UserCircle,
		Mail,
		ChevronRight,
		ShieldCheck,
		AlertTriangle,
		Save,
		Loader2,
		Camera,
		CheckCircle2
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { fade, slide, fly } from 'svelte/transition';
	import { Badge } from '$lib/components/ui/badge';

	let activeTab = $state('account');
	let loading = $state(false);

	let userForm = $state({
		name: page.data.user?.name || '',
		email: page.data.user?.email || '',
		bio: 'Medical professional focused on metabolic health and longevity research.'
	});

	let notifications = $state({
		email: true,
		push: true,
		sms: false,
		marketing: false,
		alerts: true
	});

	let securityForm = $state({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	let twoFactorEnabled = $state(false);

	const tabs = [
		{ id: 'account', label: 'Account', icon: UserCircle },
		{ id: 'notifications', label: 'Notifications', icon: Bell },
		{ id: 'privacy', label: 'Security', icon: Shield }
	];

	async function handleSaveAccount() {
		loading = true;
		// Simulate API call
		await new Promise((r) => setTimeout(r, 800));
		toast.success('Profile Updated', {
			description: 'Your account settings have been successfully synchronized.'
		});
		loading = false;
	}

	function handleUpdatePassword() {
		if (!securityForm.newPassword || securityForm.newPassword !== securityForm.confirmPassword) {
			return toast.error('Passwords do not match');
		}
		toast.success('Password Changed', {
			description: 'Your security credentials have been updated.'
		});
		securityForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
	}

	function handleToggle2FA() {
		twoFactorEnabled = !twoFactorEnabled;
		toast.info(twoFactorEnabled ? '2FA Enabled' : '2FA Disabled', {
			description: twoFactorEnabled
				? 'Your account is now protected by an additional layer.'
				: 'Security layer removed.'
		});
	}
</script>

<div class="space-y-10 w-full max-w-6xl mx-auto pb-24">
	<!-- Header Section -->
	<header class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6">
		<div class="flex items-center gap-5">
			<div
				class="p-4 bg-primary/10 rounded-xl shadow-inner border border-primary/20 backdrop-blur-sm"
			>
				<Settings class="w-8 h-8 text-primary animate-spin-slow" />
			</div>
			<div>
				<h1 class="text-4xl font-bold tracking-tight text-foreground">Settings</h1>
				<p class="text-muted-foreground font-medium text-lg">
					Manage your identity, security, and preferences.
				</p>
			</div>
		</div>
	</header>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
		<!-- Navigation Sidebar -->
		<aside
			class="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar backdrop-blur-md bg-card/10 p-2 rounded-xl border border-border/20 sticky top-24"
		>
			{#each tabs as tab}
				<button
					class={cn(
						buttonVariants({ variant: activeTab === tab.id ? 'default' : 'ghost' }),
						'flex items-center gap-3 px-6 py-4 font-bold text-sm transition-all duration-300 whitespace-nowrap outline-none',
						activeTab === tab.id
							? 'shadow-lg shadow-primary/20 scale-[1.02]'
							: 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
					)}
					onclick={() => (activeTab = tab.id)}
				>
					<tab.icon class="w-5 h-5" />
					{tab.label}
				</button>
			{/each}
		</aside>

		<!-- Content Area -->
		<main class="lg:col-span-3">
			{#if activeTab === 'account'}
				<div in:fly={{ y: 20, duration: 500 }} class="space-y-8">
					<!-- Profile Card -->
					<Card.Root
						class="bg-card/40 backdrop-blur-3xl border-border/40 rounded-xl overflow-hidden shadow-lg relative"
					>
						<div
							class="absolute -right-24 -top-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
						></div>
						<Card.Content class="p-8 md:p-12 space-y-10">
							<div class="flex flex-col md:flex-row items-center gap-4">
								<div class="relative group">
									<Avatar.Root
										class="w-32 h-32 border-4 border-background shadow-lg rounded-xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-500"
									>
										<Avatar.Image src={page.data.user?.image} />
										<Avatar.Fallback class="bg-primary/5 text-primary text-3xl font-bold"
											>{userForm.name.substring(0, 2).toUpperCase()}</Avatar.Fallback
										>
									</Avatar.Root>
									<button
										class={cn(
											buttonVariants({ variant: 'default', size: 'icon' }),
											'absolute -bottom-2 -right-2 bg-primary text-white shadow-lg border-4 border-background hover:scale-110 transition-all'
										)}
									>
										<Camera class="w-4 h-4" />
									</button>
								</div>
								<div class="text-center md:text-left space-y-1">
									<h2 class="text-3xl font-bold text-foreground">{userForm.name}</h2>
									<p
										class="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2"
									>
										<Mail class="w-4 h-4" />
										{userForm.email}
									</p>
									<Badge
										variant="secondary"
										class="mt-2 font-bold capitalize text-sm tracking-widest px-3 py-1"
									>
										Verified Account
									</Badge>
								</div>
							</div>

							<div class="grid gap-4 pt-6 border-t border-border/20">
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div class="space-y-3">
										<Label
											for="full-name"
											class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
											>Full Name</Label
										>
										<Input
											id="full-name"
											bind:value={userForm.name}
											class="rounded-xl bg-background/50 border-border/40 font-bold px-6 shadow-sm"
										/>
									</div>
									<div class="space-y-3">
										<Label
											for="email"
											class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
											>Email Address</Label
										>
										<Input
											id="email"
											bind:value={userForm.email}
											class="rounded-xl bg-background/50 border-border/40 font-bold px-6 shadow-sm"
										/>
									</div>
								</div>
								<div class="space-y-3">
									<Label
										for="bio"
										class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
										>Professional Bio</Label
									>
									<textarea
										id="bio"
										bind:value={userForm.bio}
										rows="4"
										class="w-full rounded-xl bg-background/50 border border-border/40 p-6 font-medium text-base resize-none focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
									></textarea>
								</div>
							</div>

							<div class="flex justify-end pt-4">
								<Button
									class="font-bold bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
									onclick={handleSaveAccount}
									disabled={loading}
								>
									{#if loading}
										<Loader2 class="w-5 h-5 mr-2 animate-spin" />
										Syncing Changes...
									{:else}
										<Save class="w-5 h-5 mr-2" />
										Save Profile
									{/if}
								</Button>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{:else if activeTab === 'notifications'}
				<div in:fly={{ y: 20, duration: 500 }} class="space-y-8">
					<Card.Root
						class="bg-card/40 backdrop-blur-3xl border-border/40 rounded-xl overflow-hidden shadow-lg"
					>
						<Card.Header class="p-8 md:p-12 pb-4">
							<div class="flex items-center gap-4 mb-2">
								<div class="p-3 bg-primary/10 rounded-xl">
									<Bell class="w-6 h-6 text-primary" />
								</div>
								<h2 class="text-2xl font-bold">Alert Management</h2>
							</div>
							<Card.Description class="text-base font-medium"
								>Configure how and when you want to receive clinical updates.</Card.Description
							>
						</Card.Header>
						<Card.Content class="p-8 md:p-12 pt-0 space-y-4">
							<div class="grid gap-4">
								{#each [{ id: 'email', label: 'Email Reports', desc: 'Weekly health summaries and lab result alerts.' }, { id: 'push', label: 'On-Device Push', desc: 'Instant notifications for community tags and messages.' }, { id: 'sms', label: 'Priority SMS', desc: 'Emergency clinical alerts and appointment reminders.' }, { id: 'marketing', label: 'Health Intelligence', desc: 'Newsletter of medical masterclasses and research.' }] as item}
									<div
										class="flex items-center justify-between p-6 rounded-xl bg-background/30 border border-border/40 hover:bg-background/50 transition-all group"
									>
										<div class="space-y-1">
											<Label class="text-base font-bold group-hover:text-primary transition-colors"
												>{item.label}</Label
											>
											<p class="text-xs text-muted-foreground font-medium">{item.desc}</p>
										</div>
										<Switch
											bind:checked={notifications[item.id as keyof typeof notifications]}
											class="scale-110"
										/>
									</div>
								{/each}
							</div>

							<div
								class="p-6 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-4 mt-8"
							>
								<ShieldCheck class="w-6 h-6 text-primary shrink-0 mt-0.5" />
								<p class="text-sm text-muted-foreground font-medium leading-relaxed">
									We use clinical-grade encryption for all communication. You can opt-out of
									marketing at any time while remaining protected.
								</p>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{:else if activeTab === 'privacy'}
				<div in:fly={{ y: 20, duration: 500 }} class="space-y-8">
					<Card.Root
						class="bg-card/40 backdrop-blur-3xl border-border/40 rounded-xl overflow-hidden shadow-lg"
					>
						<Card.Header class="p-8 md:p-12 pb-4">
							<div class="flex items-center gap-4 mb-2">
								<div class="p-3 bg-primary/10 rounded-xl">
									<Lock class="w-6 h-6 text-primary" />
								</div>
								<h2 class="text-2xl font-bold">Security Protocols</h2>
							</div>
							<Card.Description class="text-base font-medium"
								>Manage your multi-layer authentication and data privacy.</Card.Description
							>
						</Card.Header>
						<Card.Content class="p-8 md:p-12 pt-0 space-y-10">
							<div class="space-y-6">
								<h3
									class="text-sm font-bold capitalize tracking-widest text-muted-foreground flex items-center gap-2"
								>
									<Shield class="w-4 h-4" /> Change Credentials
								</h3>
								<div class="grid gap-6">
									<div class="space-y-3">
										<Label
											for="curr-pass"
											class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
											>Current Password</Label
										>
										<Input
											id="curr-pass"
											type="password"
											bind:value={securityForm.currentPassword}
											class="rounded-xl bg-background/50 border-border/40 px-6 font-bold"
										/>
									</div>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div class="space-y-3">
											<Label
												for="new-pass"
												class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
												>New Password</Label
											>
											<Input
												id="new-pass"
												type="password"
												bind:value={securityForm.newPassword}
												class="rounded-xl bg-background/50 border-border/40 px-6 font-bold"
											/>
										</div>
										<div class="space-y-3">
											<Label
												for="conf-pass"
												class="font-bold text-xs capitalize tracking-widest text-muted-foreground ml-1"
												>Confirm New Password</Label
											>
											<Input
												id="conf-pass"
												type="password"
												bind:value={securityForm.confirmPassword}
												class="rounded-xl bg-background/50 border-border/40 px-6 font-bold"
											/>
										</div>
									</div>
									<Button
										class="w-full md:w-fit font-bold bg-primary shadow-lg shadow-primary/20"
										onclick={handleUpdatePassword}
									>
										Update Security Key
									</Button>
								</div>
							</div>

							<div class="pt-10 border-t border-border/20 space-y-6">
								<h3
									class="text-sm font-bold capitalize tracking-widest text-muted-foreground flex items-center gap-2"
								>
									<Smartphone class="w-4 h-4" /> Advanced Factors
								</h3>
								<div
									class="flex items-center justify-between p-8 rounded-xl bg-primary/5 border border-primary/10"
								>
									<div class="flex items-center gap-6">
										<div class="p-4 bg-background rounded-xl shadow-sm h-fit">
											<Smartphone class="w-6 h-6 text-primary" />
										</div>
										<div class="space-y-1">
											<p class="font-bold text-foreground">Two-Factor Authentication (2FA)</p>
											<p class="text-sm text-muted-foreground font-medium">
												Protect your clinical data with an extra verification step.
											</p>
										</div>
									</div>
									<Button
										variant={twoFactorEnabled ? 'outline' : 'default'}
										class={cn(
											'font-bold transition-all',
											twoFactorEnabled
												? 'border-primary/20 text-primary hover:bg-primary/5'
												: 'bg-primary shadow-lg shadow-primary/20'
										)}
										onclick={handleToggle2FA}
									>
										{twoFactorEnabled ? 'Enabled' : 'Setup Now'}
									</Button>
								</div>
							</div>

							<div class="p-8 bg-destructive/5 border border-destructive/10 rounded-xl space-y-6">
								<div class="flex items-center gap-3 text-destructive">
									<AlertTriangle class="w-6 h-6" />
									<h4 class="font-bold capitalize tracking-widest text-sm">Account Deactivation</h4>
								</div>
								<p class="text-sm text-muted-foreground font-medium leading-relaxed max-w-xl">
									You can temporarily disable your account or permanently purge your experimental
									records. This action requires secondary verification and cannot be undone.
								</p>
								<div class="flex flex-col sm:flex-row gap-4 pt-2">
									<Button variant="ghost" class="font-bold text-destructive hover:bg-destructive/10"
										>Purge My Identity</Button
									>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	:global(.no-scrollbar::-webkit-scrollbar) {
		display: none;
	}
	:global(.no-scrollbar) {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	@keyframes spin-slow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin-slow {
		animation: spin-slow 8s linear infinite;
	}
</style>
