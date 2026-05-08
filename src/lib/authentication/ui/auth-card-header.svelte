<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Constants } from "$lib/constants";
	interface Props {
		title: string;
		description: string;
		class?: string;
	}
	let { title, description, class: className }: Props = $props();
</script>

<div class={className}>
	<a href="/" class="flex items-center gap-2 self-center font-medium">
		<div class="flex flex-col">
			<Card.Title class="text-2xl font-bold tracking-tight text-foreground"
				>{title} {Constants.BRANDNAME}</Card.Title
			>
			<Card.Description class="text-muted-foreground"
				>{description}</Card.Description
			>
		</div>
	</a>
</div>
