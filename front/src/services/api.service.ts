import axios from 'axios';
import.meta.env.VITE_MY_API_KEY

declare const process: any;
const BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3002/api'

// const BASE_URL = import.meta.env.PROD
//   ? '/api/'
//   : 'http://localhost:3002/api/';



async function transcriptM4AdFile(data: FormData): Promise<any> {//+
    if (!data) return Promise.reject(new Error());//+
    try {
        // const response = await axios.post('http://localhost:3002/googleCloud/speechToTextSync', formData);
        return  await axios.post(`${BASE_URL}/calls/transcript/disk/m4a`, data);//-
    } catch (error) {
        console.error('Upload Error:', error);
    }
};//-
async function transcriptMP3FileEn(data: FormData): Promise<any> {
    if (!data) return Promise.reject(new Error());//+
    try {
        // const response = await axios.post('http://localhost:3002/googleCloud/speechToTextSync', formData);
        return  await axios.post(`${BASE_URL}/calls/transcript/disk/mp3/eng`, data);//-
    } catch (error) {
        console.error('Upload Error:', error);
    }
};//-
async function transcriptMP3FileHeb(data: FormData): Promise<any> {
    if (!data) return Promise.reject(new Error());//+
    try {
        // const response = await axios.post('http://localhost:3002/googleCloud/speechToTextSync', formData);
        return  await axios.post(`${BASE_URL}/calls/transcript/disk/mp3/heb`, data);//-
    } catch (error) {
        console.error('Upload Error:', error);
    }
};//-
async function transcriptMP4dFile(data: any): Promise<any> {//+
    if (!data) return Promise.reject(new Error());//+
    try {
        // const response = await axios.post('http://localhost:3002/googleCloud/speechToTextSync', formData);
        return  await axios.post(`${BASE_URL}/calls/transcript/disk/mp4`, data);//-
    } catch (error) {
        console.error('Upload Error:', error);
    }
};//-
// {"conversationId":"933cf389-51f6-4110-ba32-ceafbc3e13a2","source":"instruct"}


export  const apiService =  {
    transcriptMP3FileHeb,
    transcriptMP3FileEn,
    transcriptMP4dFile,
    transcriptM4AdFile
}

