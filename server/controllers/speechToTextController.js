



const { EOF } = require("dns");
//const schedule = require("node-schedule");
const loggerService = require("../services/loggerService");
const puppeteer = require('puppeteer');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();





class SpeechToTextController {
  
  constructor() {
      this.API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
      this.endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${this.API_KEY}`;

  }


  async start(req, res){
    // Install the library
  // npm install @google-cloud/speech
  const filename = '0502606168_2'
  const fullFilename = `${filename}.mp3`
  const filepath = path.join(__dirname, '..', 'files', fullFilename);
  const audioFile = fs.readFileSync(filepath);
  const audioBase64 = audioFile.toString('base64');

  try {
    const answer = await this.transcribeWithApiKey(audioBase64);
    console.log('answer==============>', answer);

    // Convert answer to a string (if it's an object, convert to JSON)
    const answerString = typeof answer === 'object' ? JSON.stringify(answer, null, 2) : answer;

    // Write the answer to a file
    fs.writeFile(`${filename}_transcription.txt`, answerString, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('Transcription saved to transcription.txt');
      }
    });

  } catch (error) {
    console.error('Error in transcription:', error);
  }
  
  // async function transcribeAudio() {
  //   const client = new speech.SpeechClient();
  
  //   // Path to your local MP3 file
  //   const filename = path.join(__dirname, '..', 'files', 'test1.mp3');
  
  //   // Read the binary data
  //   const file = fs.readFileSync(filename);
  //   const audioBytes = file.toString('base64');
  
  //   const audio = {
  //     content: audioBytes,
  //   };
  
  //   // Configure the request
  //   const request = {
  //     audio: audio,
  //     config: {
  //       encoding: 'MP3',
  //       sampleRateHertz: 16000, // Adjust to the actual sample rate
  //       languageCode: 'en-US',
  //     },
  //   };
  
  //   // Detect speech in the audio file
  //   const [response] = await client.recognize(request);
  //   const transcription = response.results
  //     .map(result => result.alternatives[0].transcript)
  //     .join('\n');
  
  //   console.log(`Transcription: ${transcription}`);
  // }
  
  // transcribeAudio().catch(console.error);
      res.end()
  }


  async transcribeWithApiKey(audioContentBase64) {
  console.log('transcribeWithApiKey is running!')
    const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${this.API_KEY}`;
  
    const requestBody = {
      audio: { content: audioContentBase64 },
      config: {
        encoding: 'MP3',
        sampleRateHertz: 16000,
        languageCode: 'he-IL',

      },
    };
  
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = response.data;
    console.log('Transcription data:', data);
    return data;
  } catch (error) {
    // If the service returns an error response, catch it here
    console.error('Error transcribing audio:', error?.response?.data || error.message);
    throw error;
  
  }
  

}

module.exports = new SpeechToTextController();






