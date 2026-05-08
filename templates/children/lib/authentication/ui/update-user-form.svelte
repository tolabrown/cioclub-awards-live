<script lang="ts">
	import type { User } from '$lib/auth';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Mail, UserIcon } from '@lucide/svelte';
	import LoadingSpinner from '$lib/authentication/ui/loading-spinner.svelte';
	import { updateProfile } from '../client';
	import { getFileFromUrl } from './image-cropper';
	import UserProfileImageCropper from './user-profile-image-cropper.svelte';
	import { resizeImage } from '../imageresize'; 
	import { page } from '$app/state';

	let saving = $state(false);
	let image = $state<File | null>(null);
	let user = $derived<User>(page.data.session?.user);
	

	const onsubmit = async (evt: SubmitEvent) => {
		evt.preventDefault();

		console.log(' submitting form ');
		const form = evt.target as HTMLFormElement;
		const formData = new FormData(form);
		if (image) {
			formData.set('image', image as Blob);
		}
		saving = true;
		await updateProfile(formData, user.id);
		saving = false;
	};

	const onCropped = async (url: string) => {
		// if you need the file for a form you can call getFileFromUrl with the cropped url
		const file = await getFileFromUrl(url);
		image = await resizeImage(file);
	};
</script>

<form {onsubmit} class="w-full">
	<Card class="shadow-elevated">
		<CardHeader class="pb-6 text-center">
			<div class="mb-4 flex justify-center">
				<div class="relative">
					<UserProfileImageCropper src={user.image as string} {onCropped} />
				</div>
			</div>
			<CardTitle class="text-xl">{user.name || user.email}</CardTitle>
			<CardDescription class="capitalize">
				{user?.role}
			</CardDescription>
		</CardHeader>

		<CardContent class="space-y-6">
			<div class="space-y-2">
				<Label for="name" class="flex items-center gap-2">
					<UserIcon class="h-4 w-4" />
					Name
				</Label>
				<Input
					id="name"
					name="name"
					value={user.name}
					placeholder="Enter your name"
					class="transition-smooth"
				/>
			</div>

			<div class="space-y-2">
				<Label for="email" class="flex items-center gap-2">
					<Mail class="h-4 w-4" />
					Email
				</Label>
				<Input
					id="email"
					type="email"
					name="email"
					value={user.email}
					disabled
					class="bg-muted text-muted-foreground"
				/>
				<p class="text-sm text-muted-foreground">
					Email cannot be changed here. Contact support for email changes.
				</p>
			</div>

			<div class="space-y-2">
				<Label class="text-muted-foreground">Role</Label>
				<div class="rounded-md bg-muted p-3">
					<span class="font-medium capitalize">{user.role}</span>
					<p class="mt-1 text-sm text-muted-foreground">Your role is managed by administrators</p>
				</div>
			</div>

			<div class="pt-4">
				<Button type="submit" disabled={saving} class="w-full sm:w-fit" size="lg">
					{#if saving}
						<LoadingSpinner class="text-white dark:text-background" />
						Saving...
					{:else}
						Save Changes
					{/if}
				</Button>
			</div>
		</CardContent>
	</Card>
</form>
 