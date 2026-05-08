<script lang="ts">
	import { cn } from '$lib/utils'; 
	import Button from '$lib/components/ui/button/button.svelte';
  import Binoculars from '$lib/components/icons/binoculars.svelte';

	interface Props {
		code: number;
		message: string;
		description: string;
		href: string;
		class?: string;
	}

	let { code, message, description, href, class: className }: Props = $props();
</script>

<div class={cn("flex h-screen w-full items-center justify-center", className)}>
	<div class="flex flex-col items-center justify-center px-4 text-center">
		<Binoculars class="aspect-square" />
		<p class="text-6xl font-semibold leading-tight">{code}</p>
		<h1 class="pt-3 text-sm font-bold uppercase tracking-wider">{message}</h1>
		<div class="mx-auto my-6 h-px w-16 bg-muted-foreground"></div>
		<blockquote class="mx-auto mb-0 max-w-xs text-sm font-medium text-muted-foreground">
			{description}
		</blockquote>
		<div class="pt-5">
			<Button {href} aria-label="go to home" class="rounded-full">Take me home</Button>
		</div>
	</div>
</div>
