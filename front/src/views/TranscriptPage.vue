<template>
  <main class="center">
    <div  style="" class="center transcription-container">
      <div>
        <transcriptPreview  :title="titleReactive"  :transcript="transcriptAns" />
        <div class="padding2 ">
          <div class="width-80 margin-auto ">
            <h2>Upload Your File</h2>
            <button style="cursor: pointer;" v-if="selectedFile" @click="uploaMP3dFile">
              Upload Mp3 File
            </button>
            <button style="cursor: pointer;" v-if="selectedFile" @click="uploaMP4dFile">
              Upload Mp4 File
            </button>
            <button style="cursor: pointer;" v-if="selectedFile" @click="uploaMP4AFile">
              Upload M4A File
            </button>
            <FileUpload  style="cursor: pointer;" @clear-file="onClearFile" @file-selected="handleFileSelected" />

          </div>
        </div>
      </div>

    </div>
  </main>
</template>


<script setup lang="ts">
import FileUpload from '../components/FileUpload.vue';
import { ref } from 'vue';
import axios from 'axios';
import { apiService } from '@/services/api.service';
import transcriptPreview from '@/components/transcript-preview.vue'

const selectedFile = ref(null)
const titleReactive = ref('Transcript your Audio')
const transcriptMp3Ans = ref<string | null>(null)
const transcriptAns = ref<string | null>(null)
const transcriptM4aAns = ref<string | null>(null)
const transcriptMp4Ans = ref(null)
// Handle the file selected event from the child component
const handleFileSelected = (file:any) => {
  console.log('File selected:', file) // Debugging line
  selectedFile.value = file
}
const onClearFile = () =>{
  selectedFile.value = null
}

const uploaMP3dFile = async () => {
  if (!selectedFile.value) return
    const formData = new FormData();
    formData.append('audioMp3File', selectedFile.value);
    try {
        const response = await  apiService.transcriptMP3dFile(formData)
        console.log('Upload Success:', response.data);
        const transcription = response.data.transcription
        titleReactive.value = "Your transcription"
        transcriptAns.value = transcription
    } catch (error) {
        console.error('Upload Error:', error);
    }
};
const uploaMP4AFile = async () => {
  if (!selectedFile.value) return
    const formData = new FormData();
    formData.append('audioM4AFile', selectedFile.value);
    try {
        const response = await  apiService.transcriptM4AdFile(formData)
        console.log('Upload Success:', response.data);
        const transcription = response.data.transcription
        titleReactive.value = "Your transcription"
        transcriptAns.value = transcription
    } catch (error) {
        console.error('Upload Error:', error);
    }
};

const uploaMP4dFile = async () => {
  if (!selectedFile.value) return
    const formData = new FormData();
    formData.append('audioMp4File', selectedFile.value);
    try {
        const response = await  apiService.transcriptMP4dFile(formData)
        console.log('Upload Success:', response.data);
        const transcription = response.data.transcription
        titleReactive.value = "Your transcription"
        transcriptAns.value = transcription
    } catch (error) {
        console.error('Upload Error:', error);
    }
};


</script>

<style>
.center{
  display: flex;
  justify-content: center;

}
.padding1{
  padding: 1vw;
}
.padding2{
  padding: 2vw;
}
.auto{
  margin: auto;
  padding: 2vw;
}
.margin-auto{
  margin: auto;
}
.width-80 {
  width: 80%;
}
.transcription-container{
  background-color: #f2f4f7; 
  width: 80%; 
  height: 80vh;
  border-radius: 8px;
}
</style>