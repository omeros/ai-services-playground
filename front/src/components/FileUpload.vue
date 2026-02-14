<template>
  <div class="mt-4 flex flex-wrap items-center gap-3">
    <!-- Hidden native input -->
    <input
      ref="fileInput"
      id="file-input"
      name="file"
      type="file"
      class="hidden"
      @change="onFileChange"
      accept=".mp3,.mp4,.m4a,audio/*,video/*"
    />

    <!-- Visible choose button -->
    <button
      type="button"
      @click="openPicker"
      class="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-300
              hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Choose file
    </button>

    <!-- Show selected file name -->
    <span v-if="selectedFile" class="text-sm text-slate-700">
      {{ selectedFile.name }}
    </span>

    <!-- Clear / New -->
    <button
      v-if="selectedFile"
      type="button"
      @click="onClearFile"
      class="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm
              hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
    >
      New
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  (e: "file-selected", file: File): void;
  (e: "clear-file"): void;
}>();

const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const openPicker = () => {
  fileInput.value?.click();
};

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  selectedFile.value = file;
  emit("file-selected", file);
};

const onClearFile = () => {
  emit("clear-file");
  selectedFile.value = null;

  // reset input so picking the same file again still triggers change
  if (fileInput.value) fileInput.value.value = "";
};
</script>









<!-- <template>
  <div>
    <input id="file-input" name="file" type="file" @change="onFileChange" />
    
    <div v-if="selectedFile">
      <!-- <p>Selected file: {{ selectedFile.name }}</p> 
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


</script> -->
