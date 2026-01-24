<template>
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
</style>