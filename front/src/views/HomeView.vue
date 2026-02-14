<template>
  <section class="grid gap-6 lg:grid-cols-2">
    <!-- Left card -->
    <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">
        Audio / Video Transcription
      </h1>
      <p class="mt-3 text-slate-600">
        Upload <span class="font-medium">MP3</span> or <span class="font-medium">MP4</span> and get a transcript.
      </p>

      <div class="mt-6 flex flex-wrap gap-3">
        <RouterLink
          to="/transcript"
          class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm
                 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Start Transcribing
        </RouterLink>

        <RouterLink
          to="/about"
          class="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-300
                 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Learn more
        </RouterLink>
      </div>

      <div class="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
        <span class="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">MP3</span>
        <span class="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">MP4</span>
        <span class="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">Hebrew / English</span>
      </div>
    </div>

    <!-- Right info -->
    <div class="rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-900 p-8 text-white shadow-sm">
      <h2 class="text-lg font-semibold">Tips for best results</h2>
      <ul class="mt-4 space-y-2 text-sm text-white/90">
        <li>• Use a clear recording with low background noise</li>
        <li>• MP3 is best for audio-only</li>
        <li>• MP4 works great for video calls</li>
      </ul>

      <div class="mt-6 rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
        <p class="text-sm font-medium">Next step:</p>
        <p class="mt-1 text-sm text-white/90">
          Go to the Transcript page and upload your file.
        </p>
      </div>
    </div>
  </section>
</template>

<!-- 

<template>
  <main>
    <div>
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      <h2>Upload Your File</h2>
      <FileUpload  style="cursor: pointer;" @file-selected="handleFileSelected" />
      <button style="cursor: pointer;" v-if="selectedFile" @click="uploaMP3dFile">
        Upload Mp3 File
      </button>
      <button style="cursor: pointer;" v-if="selectedFile" @click="uploaMP4dFile">
        Upload Mp4 File
      </button>
    </div>
  </main>
</template>


<script setup lang="ts">
import FileUpload from '../components/FileUpload.vue';
import { ref } from 'vue';
import axios from 'axios';

const selectedFile = ref(null)
// Handle the file selected event from the child component
const handleFileSelected = (file:any) => {
  console.log('File selected:', file) // Debugging line
  selectedFile.value = file
}

const uploaMP3dFile = async () => {
  if (!selectedFile.value) return
    const formData = new FormData();
    formData.append('audioMp3File', selectedFile.value);

    try {
        // const response = await axios.post('http://localhost:3002/googleCloud/speechToTextSync', formData);
        const response = await axios.post('http://localhost:3002/api/calls/transcript/disk/mp3', formData);
        console.log('Upload Success:', response.data);
    } catch (error) {
        console.error('Upload Error:', error);
    }
};

const uploaMP4dFile = async () => {
  if (!selectedFile.value) return
    const formData = new FormData();
    formData.append('audioMp4File', selectedFile.value);

    try {
        // const response = await axios.post('http://localhost:3002/googleCloud/speechToTextSync', formData);
        const response = await axios.post('http://localhost:3002/api/calls/transcript/disk/mp4', formData);
        console.log('Upload Success:', response.data);
    } catch (error) {
        console.error('Upload Error:', error);
    }
};
 


// Function to upload the file to a remote server
// const uploadFile = async () => {
//   if (!selectedFile.value) return

//   const formData = new FormData()
//   formData.append('file', selectedFile.value)
//   // Log FormData contents (for debugging)

//   for (let [key, value] of formData.entries()) {
//     console.log(key, value)
// }
//   try {
//     const response = await fetch('http://localhost:3002/googleCloud/speechToTextSync', {
//       method: 'POST',
//       body: formData,
//     })

//     if (!response.ok) {
//       throw new Error('Upload failed')
//     }

//     const result = await response.json()
//     console.log('Upload successful:', result)
//   } catch (error) {
//     console.error('Upload error:', error)
//   }
// }

// const uploadFile = async () => {
//   if (!selectedFile.value) return

//   const formData = new FormData()
//   formData.append('file', selectedFile.value)

//   // Log FormData contents (for debugging)
//   for (let [key, value] of formData.entries()) {
//     console.log(key, value)
//   }

//   try {
//     console.log('Sending request to server...') // Debugging line
//     const response = await fetch('http://localhost:3002/googleCloud/speechToTextSync', {
//       method: 'POST',
//       body: formData,
//     })

//     console.log('Response status:', response.status) // Debugging line
//     if (!response.ok) {
//       throw new Error('Upload failed')
//     }

//     const result = await response.json()
//     console.log('Upload successful:', result)
//   } catch (error) {
//     console.error('Upload error:', error)
//   }
 //}

</script>
 -->