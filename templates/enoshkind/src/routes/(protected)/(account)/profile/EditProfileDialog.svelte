<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { User, Mail, Camera, Save, X } from '@lucide/svelte';
	import * as Avatar from '$lib/components/ui/avatar';

	let {
		open = $bindable(false),
		user,
		onUpdated
	} = $props<{
		open: boolean;
		user: any;
		onUpdated: () => void;
	}>();

	let loading = $state(false);
	let form = $state({
		name: user?.name || '',
		bio: user?.bio || '',
		image: user?.image || ''
	});

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
				onUpdated();
				open = false;
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

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[550px] p-0 bg-card/95 backdrop-blur-2xl border-border/40 overflow-hidden rounded-xl shadow-2xl"
	>
		<div
			class="bg-gradient-to-br from-primary to-primary-foreground p-10 text-white relative overflow-hidden"
		>
			<div
				class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"
			></div>
			<Dialog.Header>
				<Dialog.Title class="text-3xl font-bold tracking-tight">Edit Profile</Dialog.Title>
				<Dialog.Description class="text-white/80 font-medium  mt-2">
					Customize your health identity on Enoshkind.
				</Dialog.Description>
			</Dialog.Header>
		</div>

		<div class="p-10 space-y-8">
			<div class="flex flex-col items-center gap-6">
				<div class="relative group">
					<Avatar.Root class="h-28 w-28 border-4 border-primary/20 shadow-xl">
						<Avatar.Image src={form.image} alt={form.name} />
						<Avatar.Fallback class="bg-primary/10 text-primary text-3xl font-bold">
							{form.name ? form.name[0] : 'U'}
						</Avatar.Fallback>
					</Avatar.Root>
					<button
						class="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-background"
					>
						<Camera class="w-5 h-5" />
					</button>
				</div>
				<div class="text-center">
					<p class="text-sm font-bold text-primary">Change Profile Photo</p>
					<p class="text-xs text-muted-foreground mt-1">Recommended size 400x400px</p>
				</div>
			</div>

			<div class="grid gap-6">
				<div class="grid gap-2">
					<Label for="name" class="font-bold text-sm ml-1">Full Name</Label>
					<div class="relative">
						<User class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							id="name"
							bind:value={form.name}
							placeholder="Your full name"
							class="pl-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 text-base font-medium shadow-inner"
						/>
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="bio" class="font-bold text-sm ml-1">Bio</Label>
					<Textarea
						id="bio"
						bind:value={form.bio}
						placeholder="Tell us a bit about yourself..."
						class="rounded-2xl bg-background/50 border-border/40 min-h-[120px] p-4 text-base font-medium focus:ring-primary/20 shadow-inner resize-none"
					/>
				</div>
			</div>

			<div class="flex gap-4 pt-6">
				<Button
					variant="ghost"
					class="flex-1 rounded-2xl font-bold border-border/40 hover:bg-muted text-muted-foreground"
					onclick={() => (open = false)}
				>
					Cancel
				</Button>
				<Button
					class="flex-1 rounded-2xl bg-primary shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all gap-2"
					onclick={handleSubmit}
					disabled={loading}
				>
					{#if loading}
						Saving...
					{:else}
						<Save class="w-5 h-5" />
						Update Profile
					{/if}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
