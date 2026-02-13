<template>
  <div>
    <input id="file-input" name="file" type="file" @change="onFileChange" />
    
    <div v-if="selectedFile">
      <!-- <p>Selected file: {{ selectedFile.name }}</p> -->
      <button @click="onClearFile">New</button>
    </div>
  </div>
</template>

<script setup>
import {  ref, defineEmits } from 'vue'
import axios from 'axios';
// Emit an event when a file is selected
const emit = defineEmits(['file-selected', 'clear-file'])

const selectedFile = ref(null)

const onFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    emit('file-selected', file) // Emit file to parent
 // onFire(file)
  }
}

const onClearFile = () => {
  emit('clear-file')
  selectedFile.value = null
    document.getElementById('file-input').value = ''
}


</script>
