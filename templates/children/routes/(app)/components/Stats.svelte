<script lang="ts">
  const stats = [
    {
      value: "500+",
      label: "Kingdom Children",
      emoji: "👶",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      value: "50+",
      label: "Dedicated Servants",
      emoji: "❤️",
      gradient: "from-[#f71002] to-[#fd6c02]",
    },
    {
      value: "8",
      label: "Age Groups",
      emoji: "🎨",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      value: "100%",
      label: "Christ-Centered",
      emoji: "✝️",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];
</script>

<section
  class="bg-gradient-to-br from-muted/50 via-muted to-muted/50 py-16 relative overflow-hidden"
>
  <!-- Decorative background elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    <div
      class="absolute top-10 left-10 w-32 h-32 bg-[#f71002] rounded-full blur-3xl"
    ></div>
    <div
      class="absolute bottom-10 right-10 w-40 h-40 bg-cyan-500 rounded-full blur-3xl"
    ></div>
  </div>

  <div class="mx-auto max-w-[1440px] relative z-10 padded">
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      {#each stats as stat, i}
        <div class="text-center group cursor-pointer w-full">
          <div class="relative mb-4">
            <div
              class="absolute inset-0 bg-gradient-to-br {stat.gradient} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"
            ></div>
            <div
              class="relative bg-gradient-to-br {stat.gradient} rounded-2xl p-6 transform group-hover:scale-[105%] transition-transform shadow-lg"
            >
              <div class="text-5xl mb-2">{stat.emoji}</div>
              <div class="text-3xl md:text-4xl font-black text-white">
                {stat.value}
              </div>
            </div>
          </div>
          <div
            class="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors"
          >
            {stat.label}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
