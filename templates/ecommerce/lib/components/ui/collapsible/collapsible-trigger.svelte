<script lang="ts">
	import { Collapsible as CollapsiblePrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		child: childProp,
		children,
		...restProps
	}: CollapsiblePrimitive.TriggerProps = $props();
</script>

<CollapsiblePrimitive.Trigger
	bind:ref
	data-slot="collapsible-trigger"
	{...restProps}
>
	{#snippet child({ props })}
		{#if childProp}
			{@render childProp({ props })}
		{:else if children}
			<button {...props}>
				{@render children()}
			</button>
		{/if}
	{/snippet}
</CollapsiblePrimitive.Trigger>
