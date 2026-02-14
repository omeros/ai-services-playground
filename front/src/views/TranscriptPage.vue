<template>
  <main class="flex justify-center">
    <div class="flex justify-center w-4/5 h-[80vh] rounded-lg bg-slate-100">
      <div class="w-full">
        <transcriptPreview :title="titleReactive" :transcript="transcriptAns" />

        <div class="p-6">
          <div class="mx-auto w-4/5">
            <h2 class="text-xl font-semibold text-slate-800">Upload Your File</h2>

            <div class="mt-4 flex flex-wrap gap-3">
              <!-- ✅ ONE Reset button -->
              <button    v-if="selectedFile || transcriptAns"    @click="resetProcess"      class="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-300
                        hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" > Reset </button>

              <button
                v-if="selectedFile"
                @click="uploaMP3EnglishFile"
                class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                Upload English Mp3 File
              </button>

              <button
                v-if="selectedFile"
                @click="uploaMP3HebrewFile"
                class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
              >
                Upload Hebrew Mp3 File
              </button>

              <button
                v-if="selectedFile"
                @click="uploaMP4dFile"
                class="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900"
              >
                Upload Mp4 File
              </button>

              <button
                v-if="selectedFile"
                @click="uploaMP4AFile"
                class="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700"
              >
                Upload M4A File
              </button>
            </div>

            <!-- ✅ show file picker only BEFORE selecting a file -->
            <div class="mt-4" v-if="!selectedFile">
              <FileUpload
                @clear-file="onClearFile"
                @file-selected="handleFileSelected"
              />
            </div>

            <p v-if="!selectedFile" class="mt-3 text-sm text-slate-600">
              Choose a file first, then the upload buttons will appear.
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import FileUpload from "../components/FileUpload.vue";
import { ref } from "vue";
import { apiService } from "@/services/api.service";
import transcriptPreview from "@/components/transcript-preview.vue";

const selectedFile = ref<File | null>(null);
const titleReactive = ref("Transcript your Audio");
const transcriptAns = ref<string | null>(null);

  const resetProcess = () => {
  selectedFile.value = null;                 // shows FileUpload again
  transcriptAns.value = null;                // clears transcript
  titleReactive.value = "Transcript your Audio"; // resets title
};



const handleFileSelected = (file: File) => {
  console.log("File selected:", file);
  selectedFile.value = file;
};

const onClearFile = () => {
  selectedFile.value = null;
};

const uploaMP3EnglishFile = async () => {
  if (!selectedFile.value) return;

  const formData = new FormData();
  formData.append("audioMp3File", selectedFile.value);

  try {
    const response = await apiService.transcriptMP3FileEn(formData);
    titleReactive.value = "Your transcription";
    console.log('Your transcription" answer========>:', response.data.transcription);
    
    transcriptAns.value = response.data.transcription;
  } catch (error) {
    console.error("Upload Error:", error);
  }
};

const uploaMP3HebrewFile = async () => {
  if (!selectedFile.value) return;

  const formData = new FormData();
  formData.append("audioMp3File", selectedFile.value);

  try {
    const response = await apiService.transcriptMP3FileHeb(formData);
    titleReactive.value = "Your transcription";
    transcriptAns.value = response.data.transcription;
  } catch (error) {
    console.error("Upload Error:", error);
  }
};

const uploaMP4AFile = async () => {
  if (!selectedFile.value) return;

  const formData = new FormData();
  formData.append("audioM4AFile", selectedFile.value);

  try {
    const response = await apiService.transcriptM4AdFile(formData);
    titleReactive.value = "Your transcription";
    transcriptAns.value = response.data.transcription;
  } catch (error) {
    console.error("Upload Error:", error);
  }
};

const uploaMP4dFile = async () => {
  if (!selectedFile.value) return;

  const formData = new FormData();
  formData.append("audioMp4File", selectedFile.value);

  try {
    const response = await apiService.transcriptMP4dFile(formData);
    titleReactive.value = "Your transcription";
    transcriptAns.value = response.data.transcription;
  } catch (error) {
    console.error("Upload Error:", error);
  }
};
</script>

<!-- No <style> needed anymore -->















<!-- <template>
  <main class="center">
    <div  style="" class="center transcription-container">
      <div>
        <transcriptPreview  :title="titleReactive"  :transcript="transcriptAns" />
        <div class="padding2 ">
          <div class="width-80 margin-auto ">
            <h2>Upload Your File</h2>
            <button style="cursor: pointer;" v-if="selectedFile" @click="uploaMP3EnglishFile">
              Upload English Mp3 File
            </button>
            <button style="cursor: pointer;" v-if="selectedFile" @click="uploaMP3HebrewFile">
              Upload Hebrew Mp3 File
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

const uploaMP3EnglishFile = async () => {
  if (!selectedFile.value) return
    const formData = new FormData();
    formData.append('audioMp3File', selectedFile.value);
    try {
        const response = await  apiService.transcriptMP3FileEn(formData)
        console.log('Upload Success:', response.data);
        const transcription = response.data.transcription
        titleReactive.value = "Your transcription"
        transcriptAns.value = transcription
    } catch (error) {
        console.error('Upload Error:', error);
    }
};
const uploaMP3HebrewFile = async () => {
  if (!selectedFile.value) return
    const formData = new FormData();
    formData.append('audioMp3File', selectedFile.value);
    try {
        const response = await  apiService.transcriptMP3FileHeb(formData)
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
</style> -->