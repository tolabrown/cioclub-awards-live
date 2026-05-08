<script lang="ts">
	import * as ImageCropper from '$lib/authentication/ui/image-cropper';
	import { toast } from 'svelte-sonner';
	import { Camera } from '@lucide/svelte';

	interface Props {
		src?: string;
		onCropped?: (url: string) => void;
	}

	let { src, onCropped }: Props = $props();
</script>

<ImageCropper.Root
	{src}
  accept="image/*"
	{onCropped}
	onUnsupportedFile={(file) => {
		toast.error(`Unsupported file type: ${file.type}`);
	}}
>
	<ImageCropper.UploadTrigger class="relative">
		<div
			class="absolute -right-1 -bottom-1 rounded-full border border-border bg-background/70 p-2 shadow-md z-10"
		>
			<Camera class="h-4 w-4 text-muted-foreground" />
		</div>
		<ImageCropper.Preview />
	</ImageCropper.UploadTrigger>
	<ImageCropper.Dialog>
		<ImageCropper.Cropper />
		<ImageCropper.Controls>
			<ImageCropper.Cancel />
			<ImageCropper.Crop />
		</ImageCropper.Controls>
	</ImageCropper.Dialog>
</ImageCropper.Root>
