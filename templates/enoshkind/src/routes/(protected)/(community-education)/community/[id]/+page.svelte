<script module>
	import { CheckCircle2 } from '@lucide/svelte';
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import {
		ArrowLeft,
		Send,
		Heart,
		MessageSquare,
		Share2,
		MoreHorizontal,
		Users,
		ShieldCheck,
		Flame,
		Sparkles,
		Loader2
	} from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import RichEditor from '$lib/components/ui/editor/rich-editor.svelte';
	import { enhance } from '$app/forms';
	import { formatDistanceToNow } from 'date-fns';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const cycle = $derived(data.cycle);
	const posts = $derived(data.posts || []);
	const isMember = $derived(data.isMember);
	const recentMembers = $derived(data.recentMembers || []);

	let content = $state('');
	let loading = $state(false);
	let likingId = $state<string | null>(null);

	function handleShare(id: string) {
		if (navigator.share) {
			navigator
				.share({
					title: cycle.name,
					text: 'Check out this discussion in the Enoshkind Community!',
					url: window.location.href
				})
				.catch(() => {});
		} else {
			navigator.clipboard.writeText(window.location.href);
			toast.success('Link copied to clipboard');
		}
	}
</script>

<div class="space-y-8 max-w-5xl mx-auto pb-20 px-4 md:px-0">
	<!-- Mini Header / Navigation -->
	<div class="flex items-center justify-between">
		<Button
			variant="ghost"
			class="group text-muted-foreground hover:text-primary p-0 h-auto hover:bg-transparent flex items-center gap-2"
			href="/community"
		>
			<div class="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
				<ArrowLeft class="w-5 h-5" />
			</div>
			<span class="font-bold capitalize text-sm tracking-widest">Back to All Cycles</span>
		</Button>
		<div class="flex items-center gap-2">
			<Button
				variant="ghost"
				size="icon"
				class="hover:bg-muted"
				onclick={() => handleShare(cycle.id)}
			>
				<Share2 class="w-5 h-5" />
			</Button>
			<Button variant="ghost" size="icon" class="hover:bg-muted">
				<MoreHorizontal class="w-5 h-5" />
			</Button>

			{#if cycle.userId === page.data.user?.id || page.data.user?.role === 'admin'}
				<form
					action="?/deleteCycle"
					method="POST"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'redirect') {
								toast.success('Cycle deleted successfully');
							}
						};
					}}
				>
					<Button
						variant="destructive"
						size="sm"
						type="submit"
						class="rounded-xl font-bold text-[10px] tracking-widest capitalize"
					>
						Delete Cycle
					</Button>
				</form>
			{/if}
		</div>
	</div>

	<!-- Cycle Hero -->
	<div class="relative overflow-hidden rounded-xl bg-card border border-border/40 shadow-sm">
		<div
			class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50"
		></div>
		<div
			class="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left"
		>
			<div class="shrink-0 relative group">
				<Avatar.Root
					class="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg rounded-xl overflow-hidden group-hover:rotate-1 transition-transform duration-500"
				>
					<Avatar.Fallback class="bg-primary/5 text-primary text-4xl font-bold capitalize"
						>{cycle.image || cycle.name.substring(0, 2)}</Avatar.Fallback
					>
				</Avatar.Root>
				<div
					class="absolute -right-2 -bottom-2 bg-emerald-500 p-2 rounded-xl shadow-md border-4 border-background"
				>
					<CheckCircle2 class="w-5 h-5 text-white" />
				</div>
			</div>

			<div class="flex-1 space-y-4">
				<div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
					<Badge
						class="bg-primary/10 text-primary border-none font-bold text-sm capitalize tracking-widest px-4"
						>Verified Cycle</Badge
					>
					<Badge
						variant="outline"
						class="border-border/40 text-muted-foreground font-bold text-sm capitalize tracking-widest px-4"
					>
						<Users class="w-3 h-3 mr-2" />
						{cycle.members} Members
					</Badge>
					<Badge
						variant="outline"
						class="border-orange-500/20 text-orange-600 font-bold text-sm capitalize tracking-widest px-4 bg-orange-500/5"
					>
						<Flame class="w-3 h-3 mr-2" />
						{cycle.activity} Activity
					</Badge>
				</div>
				<h1 class="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
					{cycle.name}
				</h1>
				<p class="text-muted-foreground font-medium text-base md:text-lg max-w-2xl leading-relaxed">
					{cycle.description}
				</p>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
		<!-- Main Content - Feed -->
		<div class="lg:col-span-2 space-y-8">
			{#if isMember}
				<!-- Create Post Card -->
				<Card.Root
					class="overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm shadow-sm rounded-xl"
				>
					<Card.Content class="p-8 space-y-6">
						<div class="flex gap-4">
							<Avatar.Root class="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm">
								<Avatar.Image src={page.data.user?.image} />
								<Avatar.Fallback class="bg-primary/5 text-primary font-bold">ME</Avatar.Fallback>
							</Avatar.Root>
							<form
								method="POST"
								action="?/createPost"
								use:enhance={({ formData }) => {
									loading = true;
									formData.set('content', content);
									return async ({ result }) => {
										loading = false;
										if (result.type === 'success') {
											content = '';
											await invalidateAll();
											toast.success('Thought shared with the cycle!');
										}
									};
								}}
								class="flex-1 space-y-4"
							>
								<RichEditor bind:value={content} class="min-h-[120px]" />
								<input type="hidden" name="content" value={content} />
								<div class="flex items-center justify-between gap-4">
									<div class="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											class="h-10 w-10 text-muted-foreground hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
										>
											<Sparkles class="w-5 h-5" />
										</Button>
									</div>
									<Button
										type="submit"
										disabled={!content || loading}
										class="font-bold capitalize text-sm tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl transition-all group"
									>
										{#if loading}
											<Loader2 class="w-4 h-4 mr-2 animate-spin" />
											Publishing...
										{:else}
											Publish Post
											<Send class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
										{/if}
									</Button>
								</div>
							</form>
						</div>
					</Card.Content>
				</Card.Root>
			{:else}
				<Card.Root class="bg-primary/5 border-primary/10 rounded-xl border-2">
					<Card.Content class="p-10 text-center space-y-6">
						<div
							class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
						>
							<Users class="w-8 h-8 text-primary" />
						</div>
						<div class="space-y-2">
							<h3 class="text-xl font-bold">Member Access Only</h3>
							<p class="text-sm text-muted-foreground/80 font-medium">
								Join this community cycle to participate in discussions and unlock professional
								insights.
							</p>
						</div>
						<form
							method="POST"
							action="/community?/joinCycle"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success') toast.success(`Welcome to ${cycle.name}`);
								};
							}}
						>
							<input type="hidden" name="cycleId" value={cycle.id} />
							<Button
								class="bg-primary px-10 font-bold capitalize text-sm tracking-widest shadow-lg shadow-primary/20 rounded-xl"
								>Join Cycle Now</Button
							>
						</form>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Posts Feed -->
			<div class="space-y-6">
				{#each posts as post}
					<Card.Root
						class="group border-border/40 bg-card/40 hover:bg-card/60 backdrop-blur-sm transition-all duration-300 rounded-xl overflow-hidden shadow-sm"
					>
						<Card.Content class="p-8 space-y-6">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-4">
									<Avatar.Root
										class="w-12 h-12 border-2 border-primary/10 rounded-xl overflow-hidden shadow-inner"
									>
										<Avatar.Image src={post.author?.image} />
										<Avatar.Fallback class="bg-muted text-xs font-bold"
											>{post.author?.name?.substring(0, 2).toUpperCase() || '??'}</Avatar.Fallback
										>
									</Avatar.Root>
									<div class="space-y-0.5">
										<p class="font-bold text-foreground">
											{post.author?.name || 'Anonymous'}
										</p>
										<p class="text-sm text-muted-foreground font-bold capitalize tracking-widest">
											{formatDistanceToNow(new Date(post.createdAt))} ago
										</p>
									</div>
								</div>
								<Badge
									variant="outline"
									class="border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-bold text-[9px] px-3 h-5 capitalize tracking-widest"
									>Verified User</Badge
								>
							</div>

							<div class="prose prose-slate dark:prose-invert max-w-none">
								<div class="text-base md:text-lg leading-relaxed font-medium text-foreground/80">
									{@html post.content}
								</div>
							</div>

							<div class="pt-6 border-t border-border/20 space-y-6">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-6 text-muted-foreground">
										<form
											method="POST"
											action="?/likePost"
											use:enhance={() => {
												likingId = post.id;
												return async ({ result }) => {
													likingId = null;
													if (result.type === 'success') {
														await invalidateAll();
														toast.success(result.data?.liked ? 'Post liked!' : 'Post unliked!');
													}
												};
											}}
										>
											<input type="hidden" name="postId" value={post.id} />
											<button
												type="submit"
												disabled={likingId === post.id}
												class={cn(
													'flex items-center gap-2 hover:text-red-500 transition-all group/stat',
													post.likedByMe && 'text-red-500'
												)}
											>
												<div
													class="p-2 rounded-xl group-hover/stat:bg-red-500/10 transition-colors"
												>
													{#if likingId === post.id}
														<Loader2 class="w-5 h-5 animate-spin" />
													{:else}
														<Heart class={cn('w-5 h-5', post.likedByMe && 'fill-current')} />
													{/if}
												</div>
												<span class="text-xs font-bold">{post.likes.length}</span>
											</button>
										</form>
										<button
											class="flex items-center gap-2 hover:text-primary transition-all group/stat"
										>
											<div class="p-2 rounded-xl group-hover/stat:bg-primary/10 transition-colors">
												<MessageSquare class="w-5 h-5" />
											</div>
											<span class="text-xs font-bold">{post.commentsCount || 0}</span>
										</button>
									</div>
									<div class="flex items-center gap-2">
										<Button
											variant="ghost"
											size="icon"
											class="h-10 w-10 text-muted-foreground hover:bg-muted rounded-xl"
											onclick={() => handleShare(post.id)}
										>
											<Share2 class="w-4 h-4" />
										</Button>
									</div>
								</div>

								{#if post.comments && post.comments.length > 0}
									<div class="space-y-4 pl-4 border-l-2 border-muted/50">
										{#each post.comments as comment}
											<div class="flex gap-3">
												<Avatar.Root class="w-8 h-8 rounded-xl overflow-hidden shrink-0">
													<Avatar.Image src={comment.user?.image} />
													<Avatar.Fallback class="bg-muted text-sm font-bold">
														{comment.user?.name?.substring(0, 2).toUpperCase() || '??'}
													</Avatar.Fallback>
												</Avatar.Root>
												<div class="bg-muted/30 p-3 rounded-xl flex-1">
													<p class="text-xs font-bold text-foreground">
														{comment.user?.name || 'Fellow Warrior'}
													</p>
													<p class="text-sm text-foreground/80 mt-1">{comment.content}</p>
													<p class="text-[9px] text-muted-foreground font-bold mt-2">
														{formatDistanceToNow(new Date(comment.createdAt))} ago
													</p>
												</div>
											</div>
										{/each}
									</div>
								{/if}

								<form
									method="POST"
									action="?/addComment"
									use:enhance={() => {
										return async ({ result, update }) => {
											if (result.type === 'success') {
												await invalidateAll();
												await update({ reset: true });
												toast.success('Comment added!');
											}
										};
									}}
									class="flex gap-3"
								>
									<input type="hidden" name="postId" value={post.id} />
									<Avatar.Root class="w-8 h-8 rounded-xl overflow-hidden shrink-0">
										<Avatar.Image src={page.data.user?.image} />
										<Avatar.Fallback class="bg-primary/5 text-primary text-sm font-bold"
											>ME</Avatar.Fallback
										>
									</Avatar.Root>
									<div class="flex-1 flex gap-2">
										<Input
											name="content"
											placeholder="Write a comment..."
											class="h-10 rounded-xl bg-muted/40 border-none text-sm px-4 focus:ring-primary/20"
											required
										/>
										<Button
											type="submit"
											size="icon"
											class="h-10 w-10 shrink-0 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl"
										>
											<Send class="w-4 h-4" />
										</Button>
									</div>
								</form>
							</div>
						</Card.Content>
					</Card.Root>
				{:else}
					<div
						class="py-24 text-center space-y-6 bg-card/20 border-2 border-dashed border-border/20 rounded-xl shadow-sm"
					>
						<div
							class="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto opacity-30"
						>
							<MessageSquare class="w-10 h-10" />
						</div>
						<div class="space-y-1">
							<p class="text-xl font-bold text-muted-foreground">The cycle is quiet</p>
							<p class="text-sm text-muted-foreground/50 font-medium italic">
								Be the one to spark a conversation.
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Sidebar Info -->
		<div class="space-y-8">
			<Card.Root
				class="bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900 border-2 rounded-xl overflow-hidden shadow-sm"
			>
				<Card.Content class="p-8 space-y-6">
					<h4
						class="font-bold text-xs capitalize tracking-[0.25em] flex items-center gap-3 text-indigo-600"
					>
						<ShieldCheck class="w-5 h-5" />
						Cycle Rules
					</h4>
					<div class="space-y-1 relative">
						<div
							class="absolute left-[1.125rem] top-4 bottom-4 w-1 bg-indigo-200/50 rounded-full"
						></div>
						<div class="relative pl-12 group">
							<div
								class="absolute left-3 top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white dark:border-indigo-900 ring-4 ring-indigo-500/5 scale-110"
							></div>
							<p class="text-sm font-bold text-foreground capitalize tracking-widest">
								Medical Accuracy
							</p>
							<p class="text-[11px] text-muted-foreground font-medium leading-relaxed mt-1">
								Only share evidence-based advice. Clinical mods watch daily.
							</p>
						</div>
						<div class="relative pl-12 group mt-6">
							<div
								class="absolute left-3 top-1 w-4 h-4 rounded-full bg-indigo-300 border-4 border-white dark:border-indigo-900"
							></div>
							<p class="text-sm font-bold text-foreground capitalize tracking-widest">
								Privacy First
							</p>
							<p class="text-[11px] text-muted-foreground font-medium leading-relaxed mt-1">
								Protect your and others' identity. Anonymous posting allowed.
							</p>
						</div>
						<div class="relative pl-12 group mt-6">
							<div
								class="absolute left-3 top-1 w-4 h-4 rounded-full bg-indigo-300 border-4 border-white dark:border-indigo-900"
							></div>
							<p class="text-sm font-bold text-foreground capitalize tracking-widest">
								Shared Victory
							</p>
							<p class="text-[11px] text-muted-foreground font-medium leading-relaxed mt-1">
								No selling services. This is a support cycle, not a market.
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="bg-card/40 border-border/40 rounded-xl overflow-hidden shadow-sm">
				<Card.Header class="p-8 border-b border-border/20">
					<Card.Title
						class="text-sm font-bold capitalize tracking-widest flex items-center justify-between"
					>
						Recent Members
						<Badge
							variant="outline"
							class="text-sm font-bold border-primary/20 text-primary capitalize">Active</Badge
						>
					</Card.Title>
				</Card.Header>
				<Card.Content class="p-8 space-y-6">
					{#each recentMembers as membership}
						<div class="flex items-center justify-between group cursor-pointer">
							<div class="flex items-center gap-4">
								<Avatar.Root
									class="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all"
								>
									<Avatar.Image src={membership.user?.image} />
									<Avatar.Fallback class="bg-muted text-sm font-bold"
										>{membership.user?.name?.substring(0, 2).toUpperCase() || '??'}</Avatar.Fallback
									>
								</Avatar.Root>
								<div>
									<p class="text-sm font-bold group-hover:text-primary transition-colors">
										{membership.user?.name || 'Fellow Warrior'}
									</p>
									<p class="text-sm text-muted-foreground font-bold capitalize tracking-widest">
										Member since {new Date(membership.joinedAt).toLocaleDateString('en-US', {
											month: 'short',
											year: 'numeric'
										})}
									</p>
								</div>
							</div>
							<div
								class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
							></div>
						</div>
					{:else}
						<p class="text-xs text-muted-foreground text-center">No recent members</p>
					{/each}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

<style>
	:global(.lucide) {
		stroke-width: 2.2px;
	}
</style>
