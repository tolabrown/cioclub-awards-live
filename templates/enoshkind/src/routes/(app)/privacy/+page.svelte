<script lang="ts">
	import { ShieldCheck, Lock, Eye, Server, RefreshCw } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Privacy Policy | EnoshKind</title>
</svelte:head>

<div class="bg-muted/30 min-h-screen py-16 md:py-24">
	<div class="container mx-auto px-4">
		<div class="max-w-4xl mx-auto bg-card rounded-lg border shadow-sm p-4">
			<div class="flex items-center gap-4 mb-8">
				<div class="p-3 rounded-2xl bg-primary/10 text-primary">
					<ShieldCheck class="w-8 h-8" />
				</div>
				<div>
					<h1 class="text-3xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
					<p class="text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
				</div>
			</div>

			<div class="prose prose-slate dark:prose-invert max-w-none">
				<p class="lead text-xl text-muted-foreground mb-12">
					At EnoshKind, your privacy is our priority. We are committed to protecting your personal
					and medical information through secure technology and transparent practices.
				</p>

				<section class="mb-12">
					<h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
						<Eye class="text-primary w-6 h-6" />
						1. Information We Collect
					</h2>
					<p class="mb-4">
						We collect information to provide better services to all our users. This includes:
					</p>
					<ul class="list-disc pl-6 space-y-2 text-muted-foreground">
						<li><strong>Identity Data:</strong> Name, age, gender, and contact details.</li>
						<li>
							<strong>Health Data:</strong> Vitals (BP, weight, heart rate), medical history, and consultation
							notes.
						</li>
						<li><strong>Usage Data:</strong> Information about how you use our website and app.</li>
						<li><strong>Device Data:</strong> IP address, browser type, and operating system.</li>
					</ul>
				</section>

				<section class="mb-12">
					<h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
						<Server class="text-primary w-6 h-6" />
						2. How We Use Your Data
					</h2>
					<p class="mb-4">Your data is used specifically for:</p>
					<ul class="list-disc pl-6 space-y-2 text-muted-foreground">
						<li>Providing AI-powered health insights and recommendations.</li>
						<li>Facilitating consultations between you and your healthcare providers.</li>
						<li>Improving our algorithms for better diagnostic assistance.</li>
						<li>Sending critical health alerts and reminders.</li>
					</ul>
				</section>

				<section class="mb-12">
					<h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
						<Lock class="text-primary w-6 h-6" />
						3. Data Security
					</h2>
					<p class="text-muted-foreground leading-relaxed">
						We implement industry-standard security measures, including end-to-end encryption for
						all medical data and secure cloud storage. We are HIPAA compliant in our data handling
						processes to ensure your sensitive information remains private and secure.
					</p>
				</section>

				<section class="mb-12">
					<h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
						<RefreshCw class="text-primary w-6 h-6" />
						4. Your Rights
					</h2>
					<p class="mb-4">As a user of EnoshKind, you have the right to:</p>
					<ul class="list-disc pl-6 space-y-2 text-muted-foreground">
						<li>Access and download your medical records at any time.</li>
						<li>Request the deletion of your personal data from our servers.</li>
						<li>Opt-out of non-essential communications.</li>
						<li>Correction of any inaccurate information.</li>
					</ul>
				</section>

				<div class="mt-16 pt-8 border-t text-sm text-muted-foreground">
					<p>
						If you have any questions about this Privacy Policy, please contact us at <a
							href="mailto:support@chanieldigitalhealth.com"
							class="text-primary hover:underline">support@chanieldigitalhealth.com</a
						>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
