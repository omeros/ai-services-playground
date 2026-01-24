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

