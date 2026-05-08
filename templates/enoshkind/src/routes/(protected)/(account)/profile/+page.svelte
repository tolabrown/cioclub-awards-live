<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { User } from '$lib/auth';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import {
		Edit,
		User as UserIcon,
		Mail,
		Shield,
		Calendar,
		Camera,
		Save,
		Loader2,
		X
	} from '@lucide/svelte';
	import { resizeImage } from '$lib/authentication/imageresize';
	import { toast } from 'svelte-sonner';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Avatar from '$lib/components/ui/avatar';

	let currentUser = $state(page.data.user as User);
	let loading = $state(false);
	let uploading = $state(false);

	let form = $state({
		name: '',
		bio: '',
		image: ''
	});

	$effect(() => {
		if (currentUser) {
			form.name = currentUser.name || '';
			form.bio = currentUser.bio || '';
			form.image = currentUser.image || '';
		}
	});

	let fileInput: HTMLInputElement;

	async function handleImageUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		uploading = true;
		try {
			// Resize image to < 200kb
			const resizedFile = await resizeImage(file, { maxSizeKB: 200 });

			const formData = new FormData();
			formData.append('file', resizedFile);

			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			if (res.ok) {
				const result = await res.json();
				form.image = result.url;
				toast.success('Image uploaded successfully');
			} else {
				toast.error('Failed to upload image');
			}
		} catch (error) {
			console.error('Upload error:', error);
			toast.error('Error processing image');
		} finally {
			uploading = false;
		}
	}

	async function handleSubmit() {
		if (!form.name) return toast.error('Name is required');
		loading = true;
		try {
			const res = await fetch('/api/profile', {
				method: 'PATCH',
				body: JSON.stringify(form)
			});
			if (res.ok) {
				toast.success('Profile Updated', { description: 'Your changes have been saved.' });
				await invalidateAll();
				currentUser = page.data.user as User;
			} else {
				const data = await res.json();
				toast.error('Update Failed', { description: data.message });
			}
		} catch (e) {
			toast.error('Failed to update profile');
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-4xl mx-auto space-y-8 w-full box-border pb-20">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold">Profile</h1>
			<p class="text-muted-foreground">Manage your account settings and preferences</p>
		</div>
		<Button
			class="rounded-xl font-bold shadow-lg shadow-primary/20"
			onclick={handleSubmit}
			disabled={loading}
		>
			{#if loading}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				Saving...
			{:else}
				<Save class="mr-2 h-4 w-4" />
				Save Changes
			{/if}
		</Button>
	</div>

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center">
				<UserIcon class="mr-2 h-5 w-5 text-primary" />
				Account Information
			</CardTitle>
			<CardDescription>Your personal account details</CardDescription>
		</CardHeader>
		<CardContent class="space-y-10">
			<!-- Image Section -->
			<div class="flex flex-col items-center gap-6">
				<div class="relative group">
					<Avatar.Root
						class="h-32 w-32 border-4 border-primary/20 shadow-xl overflow-hidden shrink-0"
					>
						<Avatar.Image src={form.image} alt={form.name} class="object-cover" />
						<Avatar.Fallback class="bg-primary/10 text-primary text-4xl font-bold">
							{form.name ? form.name[0] : 'U'}
						</Avatar.Fallback>
					</Avatar.Root>
					<button
						class="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-background disabled:opacity-50"
						onclick={() => fileInput.click()}
						disabled={uploading}
					>
						{#if uploading}
							<Loader2 class="w-5 h-5 animate-spin" />
						{:else}
							<Camera class="w-5 h-5" />
						{/if}
					</button>
					<input
						type="file"
						bind:this={fileInput}
						onchange={handleImageUpload}
						class="hidden"
						accept="image/*"
					/>
				</div>
				<div class="text-center">
					<p class="text-sm font-bold text-primary">Profile Photo</p>
					<p class="text-xs text-muted-foreground mt-1">
						Images are automatically optimized (&lt; 200kb)
					</p>
				</div>
			</div>

			<!-- Form Fields -->
			<div class="grid gap-8">
				<div class="grid gap-3">
					<Label for="name" class="font-bold text-sm ml-1 flex items-center gap-2">
						<UserIcon class="w-4 h-4 text-primary" />
						Full Name
					</Label>
					<Input
						id="name"
						bind:value={form.name}
						placeholder="Your full name"
						class="rounded-xl bg-muted/30 border-border/40 focus:ring-primary/20 text-base font-medium"
					/>
				</div>

				<div class="grid gap-3">
					<Label for="bio" class="font-bold text-sm ml-1 flex items-center gap-2">
						<Edit class="w-4 h-4 text-primary" />
						Bio
					</Label>
					<Textarea
						id="bio"
						bind:value={form.bio}
						placeholder="Tell us a bit about yourself..."
						class="rounded-xl bg-muted/30 border-border/40 min-h-[120px] p-4 text-base font-medium focus:ring-primary/20 resize-none"
					/>
				</div>
			</div>

			<!-- Divider -->
			<div class="h-px bg-border/40 my-2"></div>

			<!-- Read-only Details -->
			<div class="grid gap-4 md:grid-cols-2">
				<div class="flex items-center space-x-3 p-4 rounded-xl bg-muted/30 border border-border/20">
					<Mail class="h-5 w-5 text-muted-foreground shrink-0" />
					<div class="min-w-0 flex-1">
						<p class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
							Email
						</p>
						<p class="font-medium truncate" title={currentUser?.email}>
							{currentUser?.email || 'Not set'}
						</p>
					</div>
				</div>

				<div class="flex items-center space-x-3 p-4 rounded-xl bg-muted/30 border border-border/20">
					<Shield class="h-5 w-5 text-muted-foreground" />
					<div>
						<p class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
							Email Verified
						</p>
						<p class="font-medium">{currentUser?.emailVerified ? 'Yes' : 'No'}</p>
					</div>
				</div>

				<div class="flex items-center space-x-3 p-4 rounded-xl bg-muted/30 border border-border/20">
					<Calendar class="h-5 w-5 text-muted-foreground" />
					<div>
						<p class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
							Member Since
						</p>
						<p class="font-medium">
							{currentUser?.createdAt
								? new Date(currentUser.createdAt).toLocaleDateString()
								: 'Unknown'}
						</p>
					</div>
				</div>

				<div class="flex items-center space-x-3 p-4 rounded-xl bg-muted/30 border border-border/20">
					<UserIcon class="h-5 w-5 text-muted-foreground" />
					<div>
						<p class="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
							Role
						</p>
						<p class="font-medium capitalize">{currentUser?.role || 'User'}</p>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
</div>
