<script lang="ts">
	import { type ButtonProps, Button } from "$lib/components/ui/button";
	import { useImageCropperCancel } from "./image-cropper.svelte.js";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";

	let {
		ref = $bindable(null),
		variant = "outline",
		size = "sm",
		onclick,
		...rest
	}: ButtonProps = $props();

	const cancelState = useImageCropperCancel();

	function handleClick(e: any) {
		onclick?.(e);
		cancelState.onclick();
	}
</script>

<Button {...rest} bind:ref {size} {variant} onclick={handleClick}>
	<Trash2Icon />
	<span>Cancel</span>
</Button>
