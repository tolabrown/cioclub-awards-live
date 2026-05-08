<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Constants } from '$lib/constants';
	import { Heart } from '@lucide/svelte';

	interface Props {
		title: string;
		description: string;
		class?: string;
	}

	let { title, description, class: className }: Props = $props();
</script>

<div class={className}>
	<a href="/" class="flex items-center gap-3 self-center font-medium">
		<div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
			<Heart class="w-5 h-5 text-primary-foreground" />
		</div>
		<div class="flex flex-col">
			<Card.Title class="text-xl">{title}</Card.Title>
			<Card.Description>{description}</Card.Description>
		</div>
	</a>
</div>
