



const { EOF } = require("dns");
//const schedule = require("node-schedule");
const loggerService = require("../services/loggerService");
const puppeteer = require('puppeteer');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const OpenAI = require('openai');
const GoogleCloudService = require('../services/Google/google.cloud.service');



class GoogleCloudController {
  
  constructor() {
      this.API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
      this.endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${this.API_KEY}`;
      this.API_KEY = process.env.OPEN_AI_API_KEY;
      this.openai = new OpenAI({ apiKey: this.API_KEY });
      this.googleCloudService = GoogleCloudService
  }


  async speechToTextSync(req, res){
    console.log('speechToTextSync runs!');
    const fileName = req.file.originalname;
    console.log('speechToTextSync2:',fileName);
    this.googleCloudService.speechToTextSync(fileName)
    const fullFilename = file
    const filepath = path.join(__dirname, '..', 'uploads', fullFilename);
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
        res.end()
  }

  // async speechToTextSyncOld(req, res){
  // const filename = '0502606168_2'
  // const fullFilename = `${filename}.mp3`
  // const filepath = path.join(__dirname, '..', 'files', fullFilename);
  // const audioFile = fs.readFileSync(filepath);
  // const audioBase64 = audioFile.toString('base64');

  // try {
  //   const answer = await this.transcribeWithApiKey(audioBase64);
  //   console.log('answer==============>', answer);

  //   // Convert answer to a string (if it's an object, convert to JSON)
  //   const answerString = typeof answer === 'object' ? JSON.stringify(answer, null, 2) : answer;

  //   // Write the answer to a file
  //   fs.writeFile(`${filename}_transcription.txt`, answerString, 'utf8', (err) => {
  //     if (err) {
  //       console.error('Error writing to file:', err);
  //     } else {
  //       console.log('Transcription saved to transcription.txt');
  //     }
  //   });

  // } catch (error) {
  //   console.error('Error in transcription:', error);
  // }
  
  //     res.end()
  // }


  
  // async speechToTextAsync(req, res){
  // const filename = '0502606168_2'
  // const fullFilename = `${filename}.mp3`
  // const filepath = path.join(__dirname, '..', 'files', fullFilename);
  // const audioFile = fs.readFileSync(filepath);
  // const audioBase64 = audioFile.toString('base64');

  // try {
  //     const finalTranscript = await transcribeLongRunning(audioContentBase64);
  //     console.log('Final transcript:', finalTranscript);

  //   // Convert answer to a string (if it's an object, convert to JSON)
  //   const answerString = typeof finalTranscript === 'object' ? JSON.stringify(finalTranscript, null, 2) : finalTranscript;

  //   // Write the answer to a file
  //   fs.writeFile(`${filename}_transcription.txt`, answerString, 'utf8', (err) => {
  //     if (err) {
  //       console.error('Error writing to file:', err);
  //     } else {
  //       console.log('Transcription saved to transcription.txt');
  //     }
  //   });

  // } catch (error) {
  //   console.error('Error in transcription:', error);
  // }
  
  //     res.end()
  // }



//Performs synchronous speech recognition: receive results after all audio has been sent and processed.
  // async transcribeWithApiKey(audioContentBase64) {
  // console.log('transcribeWithApiKey is running!')
  //   const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${this.API_KEY}`;
  
  //   const requestBody = {
  //     audio: { content: audioContentBase64 },
  //     config: {
  //       encoding: 'MP3',
  //       sampleRateHertz: 16000,
  //       languageCode: 'he-IL',

  //     },
  //   };
  
  //   const response = await axios.post(endpoint, requestBody, {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   });
  
  //   const data = response.data;
  //   console.log('Transcription data:', data);
  //   return data;
  // } 
  
  
  // catch (error) {
  //   // If the service returns an error response, catch it here
  //   console.error('Error transcribing audio:', error?.response?.data || error.message);
  //   throw error;
  
  // }



  //Performs asynchronous speech recognition: receive results via the google.longrunning.Operations interface.
 // Returns either an Operation.error or an Operation.response which contains a LongRunningRecognizeResponse message.
  // async  transcribeLongRunning(audioContentBase64) {
  //   // Endpoint for long-running recognize
  //   const endpoint = `https://speech.googleapis.com/v1/speech:longrunningrecognize?key=${this.API_KEY}`;
  
  //   const requestBody = {
  //     audio: {
  //       content: audioContentBase64, // Base64-encoded audio
  //     },
  //     config: {
  //       encoding: 'MP3',          // or LINEAR16, FLAC, etc., depending on your audio format
  //       sampleRateHertz: 16000,   // Make sure this matches your file's sampling rate
  //       languageCode: 'he-IL',    // Hebrew
  //     },
  //   };
  
  //   // 1) Start the long-running operation
  //   let response;
  //   try {
  //     response = await axios.post(endpoint, requestBody, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //   } catch (error) {
  //     console.error('Error starting long-running recognition:', error.response?.data || error.message);
  //     throw error;
  //   }
  
  //   // The operation object returned
  //   const operation = response.data; 
  //   // operation.name looks like "projects/PROJECT_ID/operations/OPERATION_ID"
  //   console.log('Started long-running recognition. Operation name:', operation.name);
  
  //   // 2) Poll the operation until it's done
  //   let operationStatus;
  //   while (true) {
  //     try {
  //       await sleep(5000); // wait 5 seconds before polling again
  //       const statusResponse = await axios.get(
  //         `https://speech.googleapis.com/v1/${operation.name}?key=${this.API_KEY}`
  //       );
  //       operationStatus = statusResponse.data;
  
  //       if (operationStatus.done) {
  //         break;
  //       }
  //       console.log('Operation still in progress, waiting...');
  //     } catch (error) {
  //       console.error('Error polling long-running recognition:', error.response?.data || error.message);
  //       throw error;
  //     }
  //   }
  
  //   // 3) Check results
  //   if (operationStatus.error) {
  //     // If there's an error field, the transcription failed
  //     throw new Error(`Transcription failed: ${operationStatus.error.message}`);
  //   }
  
  //   // If successful, the transcription is in operationStatus.response.results
  //   const results = operationStatus.response.results || [];
  //   let transcript = '';
  //   for (const result of results) {
  //     const alt = result.alternatives[0];
  //     transcript += alt.transcript;
  //   }
  
  //   return transcript;
  // }
  

}

module.exports = new GoogleCloudController();






