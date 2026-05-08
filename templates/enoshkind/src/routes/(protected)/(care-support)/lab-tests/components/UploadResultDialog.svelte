<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Upload, FileText, Loader2, CheckCircle2 } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { open = $bindable(false) } = $props<{ open: boolean }>();
	let loading = $state(false);
	let files = $state<FileList | null>(null);

	function onFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		files = target.files;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="sm:max-w-[450px] border-border/40 bg-background/80 backdrop-blur-3xl shadow-2xl"
	>
		<Dialog.Header>
			<div class="flex items-center gap-4 mb-2">
				<div class="p-3 bg-primary/10 rounded-xl">
					<Upload class="w-6 h-6 text-primary" />
				</div>
				<div>
					<Dialog.Title class="text-2xl font-bold">Upload Results</Dialog.Title>
					<Dialog.Description class="font-medium">
						Upload your laboratory reports for AI analysis and storage.
					</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>

		<form
			method="POST"
			action="?/uploadResult"
			enctype="multipart/form-data"
			use:enhance={() => {
				loading = true;
				return ({ result }) => {
					loading = false;
					if (result.type === 'success') {
						toast.success('Laboratory results uploaded successfully!');
						open = false;
						invalidateAll();
					} else if (result.type === 'failure') {
						toast.error(result.data?.message || 'Upload failed');
					}
				};
			}}
			class="space-y-6 py-4"
		>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="testName" class="font-bold ml-1">Test Name</Label>
					<Input
						id="testName"
						name="testName"
						placeholder="e.g. Full Blood Count"
						required
						class="bg-background border-border/40 font-bold rounded-xl"
					/>
				</div>

				<div class="space-y-2">
					<Label for="labName" class="font-bold ml-1">Laboratory / Hospital</Label>
					<Input
						id="labName"
						name="labName"
						placeholder="e.g. Synlab Lagos"
						class="bg-background border-border/40 font-bold rounded-xl"
					/>
				</div>

				<div class="space-y-2">
					<Label class="font-bold ml-1">Report File (PDF/Image)</Label>
					<div class="relative group">
						<input
							type="file"
							name="file"
							id="file"
							accept=".pdf,image/*"
							required
							onchange={onFileChange}
							class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
						/>
						<div
							class="border-2 border-dashed border-border/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-card/20 group-hover:bg-primary/5 group-hover:border-primary/40 transition-all"
						>
							{#if files && files.length > 0}
								<div class="p-3 bg-green-500/10 rounded-xl">
									<CheckCircle2 class="w-8 h-8 text-green-500" />
								</div>
								<p class="text-sm font-bold text-green-500">{files[0].name}</p>
							{:else}
								<div class="p-3 bg-primary/10 rounded-xl">
									<FileText class="w-8 h-8 text-primary" />
								</div>
								<p class="text-sm font-bold text-muted-foreground">
									Drop your file here or click to browse
								</p>
								<p class="text-sm text-muted-foreground capitalize font-bold tracking-widest">
									Supports PDF, JPG, PNG
								</p>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<Button
				type="submit"
				disabled={loading}
				class="w-full text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
			>
				{#if loading}
					<Loader2 class="w-5 h-5 mr-3 animate-spin" />
					Uploading Knowledge...
				{:else}
					Secure Upload
				{/if}
			</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
