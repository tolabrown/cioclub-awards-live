<script lang="ts">
  let { class: className = "" } = $props();
</script>

<div class="mesh-gradient absolute inset-0 -z-10 overflow-hidden {className}">
  <div class="absolute inset-0 opacity-30 blur-[100px]">
    <div class="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-electric-blue/20 animate-pulse"></div>
    <div class="absolute top-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-indigo-500/20 animate-bounce duration-[10s]"></div>
    <div class="absolute -bottom-[20%] left-[20%] h-[50%] w-[60%] rounded-full bg-blue-600/20 animate-pulse duration-[8s]"></div>
  </div>
</div>
