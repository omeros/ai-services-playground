
<template>
  <div class="mx-auto w-4/5 p-6">
    <h2 class="text-center text-xl font-semibold text-slate-800">
      {{ title }}
    </h2>

    <p class="mt-3 text-right whitespace-pre-wrap text-slate-700"  dir="auto"   >
      {{ transcript }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  transcript: string | null
}

defineProps<Props>()
</script>





















<!-- <template>
  <div class="transcript-container">
    <h2 style="text-align: center;">{{ title }}</h2>
    <p  style="text-align: end;"> {{transcript}}</p>
  </div >
</template>


<script setup lang="ts">
import { ref } from 'vue'

const selectedFile = ref(null)
interface Props {
  title: string
  transcript: string|null
}
const props = defineProps<Props>()
</script>

<style>
/* Global styles that will affect your entire application */
.button {
  background: blue;
  color: white;
}

.transcript-container{
  width: 80%;
  margin: auto;
  padding: 2vw
}
</style> -->