<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js'; 
  import { Constants } from '$lib/constants';

	interface Props {
		title: string;
		description: string;
		class?: string;
	}

	let { title, description, class: className }: Props = $props();
</script>

<div class={className}>
	<a href="/" class="flex items-center gap-2 self-center font-medium">
		<img src={Constants.BRANDLOGO} alt={Constants.BRANDNAME} class="size-6" />
		<div class="flex flex-col">
			<Card.Title class="text-xl">{title}</Card.Title>
			<Card.Description>{description}</Card.Description>
		</div>
	</a>
</div>
