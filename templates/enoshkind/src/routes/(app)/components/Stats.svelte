<script lang="ts">
	const stats = [
		{ value: '50K+', label: 'Users', emoji: '👨‍⚕️' },
		{ value: '24/7', label: 'AI Support', emoji: '🤖' },
		{ value: '98%', label: 'Satisfaction', emoji: '⭐' },
		{ value: '36', label: 'States', emoji: '🇳🇬' }
	];
</script>

<section class="py-16 border-y border-border/50 bg-muted/20">
	<div class="container mx-auto px-4">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			{#each stats as stat}
				<div class="text-center">
					<div class="mb-2">{stat.emoji}</div>
					<div class="font-bold">{stat.value}</div>
					<div class="text-muted-foreground">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>
</section>
