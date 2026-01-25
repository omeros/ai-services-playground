const fs = require('fs').promises;;  
const path = require('path');  
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const os = require('os');
const { execFile } = require('child_process');


ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// services/call.service.js  
class CallService {  
  constructor(googleCloud, openAI) {  
    this.googleCloud = googleCloud;  
    this.openAI = openAI;  
    console.log(require('ffmpeg-static'));

  }  
  
  async  validateFileExists(recordingPath) {
    try {
      await fs.access(recordingPath, fs.constants.F_OK);
      // File exists, you can continue.
    } catch (error) {
      throw new Error(`Recording file not found: ${recordingPath}`);
    }
  };

  ensureDirectoryExists = async (dirPath) => {
    try {
      await fs.access(dirPath);
      // Directory exists
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(dirPath, { recursive: true });
    }
  };

 async myCallTranscriptFromDiskMp4(recordingPath, options = {}){
    try {  
    // Validate the file exists  
      await this.validateFileExists(recordingPath)
    // Extract just the file name without extension
    const fileName = path.parse(recordingPath).name; // "WhatsApp_Video_2025-03-13_21_53_10"
    // Construct the new output path
    const wavOutputPath = path.join(process.env.WAV_UPLOAD_FOLDER_FILES, `${fileName}.wav`); 
    const mono16kOutputPath = path.join(process.env.WAV_UPLOAD_FOLDER_FILES, `${fileName}_mono.wav`); 

    console.log('fileName===>:',fileName);
    console.log('outputPath=======>:',mono16kOutputPath);

    // Generate a unique file name for GCS  
   // const fileName = `transcription-${Date.now()}${path.extname(recordingPath)}`;  
    try {
      await this.convertMp4ToWav(recordingPath,wavOutputPath);
      const finalWavPath = await this.ensureMono16kIfNeeded(wavOutputPath);
      // await this.convertAudioToMono16k(wavOutputPath,mono16kOutputPath )
      console.log('File converted from MP4 to WAV successfully!');
      console.log('recordingPath==>:',recordingPath);
      console.log('wavOutputPath==>:',wavOutputPath);
      console.log('wavOutputPath==>:',mono16kOutputPath);
      // Upload the file to Google Cloud Storage first  
      const bucketName = 'transcription-audio-files-omer'; // Your bucket name  
      const gcsUri = await this.googleCloud.uploadFileStreamToBucket(  
        bucketName,  
        `${fileName}.wav`,  
        finalWavPath   
      );  
      
      console.log(`File uploaded successfully to GCS: ${gcsUri}`);  
      
      // Set up transcription options  
      const transcriptionOptions = {  
        "encoding": "LINEAR16",
        "sampleRateHertz": 16000 ,  //44100
        "languageCode": "he-IL",
        "enableAutomaticPunctuation": true,
        "enableSpeakerDiarization": true,
        "speakerCount": 2
      };  
      
      // Transcribe the audio using the GCS URI (not the local path)  
      const transcriptResult = await this.googleCloud.transcribeLongAudio(  
        gcsUri,   // Use the GCS URI returned from upload  
        transcriptionOptions  
      );   
      
      // Extract the transcript text (assuming the method returns an object with a 'transcription' property)  
      const transcript = transcriptResult.transcription || transcriptResult;  
      
      console.log('The transcript===>:',transcript);
      
      // Create a directory for transcripts if it doesn't exist  
      const transcriptsDir = path.join(__dirname, '..', 'trasnscription_files');  
      await this.ensureDirectoryExists(transcriptsDir);
   
      
      // Generate a filename for the transcript  
      const originalFileName = path.basename(recordingPath, path.extname(recordingPath));  
      const transcriptFileName = `${originalFileName}-transcript-${Date.now()}.txt`;  
      const transcriptFilePath = path.join(transcriptsDir, transcriptFileName);  
      
      // Write the transcript to a file  
      //await fs.writeFile(transcriptFilePath, transcript.text);
      // Convert transcript object to string
      await fs.writeFile(transcriptFilePath, JSON.stringify(transcript, null, 2));
  
      console.log(`Transcript saved to: ${transcriptFilePath}`); 
  
  
      // const transcriptSomeFilePath = path.join(__dirname, '..', 'trasnscription_files', '0502606168_1-transcript-1741471190437.txt');   
     // const transcriptFromFile = fs.readFileSync(transcriptFilePath, 'utf8'); 
      
      // Return the combined results  
      return { 
        transcript: transcript, // Return the transcript text
      };  
    } catch (err) {
      console.error(`Conversion from MP4 to WAV failed: ${err.message}`);
    }
    



    
  } catch (error) {  
    console.error(`Error processing file: ${error.message}`);  
    throw error;  
  }
}



//********************** M4A files ********************************** */
 execFileAsync(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, (error, stdout, stderr) => {
      if (error) return reject(new Error(stderr || error.message));
      resolve({ stdout, stderr });
    });
  });
}

// Converts .m4a -> .wav (LINEAR16) for Google STT v1 longRunningRecognize
async  convertM4AToWav(inputPath) {
  const outPath = path.join(os.tmpdir(), `${path.basename(inputPath, path.extname(inputPath))}-${Date.now()}.wav`);
  await this.execFileAsync(ffmpegPath, [          // ✅ במקום 'ffmpeg'
    '-y',
    '-i', inputPath,
    '-ac', '1',
    '-ar', '16000',
    '-c:a', 'pcm_s16le',
    outPath
  ]);
  return outPath;
}

async  myCallTranscriptFromDiskM4A(recordingPath, options = {}) {
  let tempWavPath = null;
  try {
    await this.validateFileExists(recordingPath);
    // Handle ONLY .m4a
    const ext = path.extname(recordingPath).toLowerCase();
    if (ext !== '.m4a') {
      throw new Error(`Only .m4a files are supported. Got: ${ext || '(no extension)'}`);
    }
    // Convert M4A -> WAV (LINEAR16)
    tempWavPath = await this.convertM4AToWav(recordingPath);
    await this.validateFileExists(tempWavPath);
    // Upload WAV to GCS
    const fileName = `transcription-${Date.now()}.wav`;
    const bucketName = 'transcription-audio-files-omer';
    const gcsUri = await this.googleCloud.uploadFileStreamToBucket(
      bucketName,
      fileName,
      tempWavPath
    );
    console.log(`File uploaded successfully to GCS: ${gcsUri}`);
    // Transcription options for WAV/LINEAR16
    const transcriptionOptions = {
      encoding: 'LINEAR16',
      languageCode: options.languageCode || 'en-US',
      enableSpeakerDiarization: options.enableSpeakerDiarization !== false,
      speakerCount: options.speakerCount || 2,
      sampleRateHertz: options.sampleRateHertz || 16000,
    };
    const transcriptResult = await this.googleCloud.transcribeLongAudio(
      gcsUri,
      transcriptionOptions
    );
    const transcript = transcriptResult.transcription || transcriptResult;
    // Save transcript
    const transcriptsDir = path.join(__dirname, '..', 'trasnscription_files');
    await this.ensureDirectoryExists(transcriptsDir);
    const originalFileName = path.basename(recordingPath, '.m4a');
    const transcriptFileName = `${originalFileName}-transcript-${Date.now()}.txt`;
    const transcriptFilePath = path.join(transcriptsDir, transcriptFileName);
    await fs.writeFile(transcriptFilePath, transcript, 'utf8');
    console.log(`Transcript saved to: ${transcriptFilePath}`);
    return { transcript };
  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
    throw error;
  } finally {
    // Cleanup temp wav
    if (tempWavPath) {
      try { await fs.unlink(tempWavPath); } catch {}
    }
  }
}
//********************** End M4A files ********************************** */


  // MP3 Files
 async myCallTranscriptFromDiskMp3(recordingPath, options = {}){
    try {  
    // Validate the file exists  
    // if (!fs.existsSync(recordingPath)) {  
    //   throw new Error(`Recording file not found: ${recordingPath}`);  
    // }  
    await this.validateFileExists(recordingPath)

    
    // Generate a unique file name for GCS  
    const fileName = `transcription-${Date.now()}${path.extname(recordingPath)}`;  
    
    // Upload the file to Google Cloud Storage first  
    const bucketName = 'transcription-audio-files-omer'; // Your bucket name  
    const gcsUri = await this.googleCloud.uploadFileStreamToBucket(  
      bucketName,  
      fileName,  
      recordingPath  
    );  
    
    console.log(`File uploaded successfully to GCS: ${gcsUri}`);  
    
    // Set up transcription options  
    const transcriptionOptions = {  
      encoding: path.extname(recordingPath).toLowerCase() === '.mp3' ? 'MP3' : 'LINEAR16',  
      languageCode: options.languageCode || 'en-US',  
      enableSpeakerDiarization: options.enableSpeakerDiarization !== false,  
      speakerCount: options.speakerCount || 2,  
    };  
    
    // Transcribe the audio using the GCS URI (not the local path)  
    const transcriptResult = await this.googleCloud.transcribeLongAudio(  
      gcsUri,   // Use the GCS URI returned from upload  
      transcriptionOptions  
    );   
    
    // Extract the transcript text (assuming the method returns an object with a 'transcription' property)  
    const transcript = transcriptResult.transcription || transcriptResult;  
    
    // Create a directory for transcripts if it doesn't exist  
    const transcriptsDir = path.join(__dirname, '..', 'trasnscription_files');  

    await this.ensureDirectoryExists(transcriptsDir);
    
    // Generate a filename for the transcript  
    const originalFileName = path.basename(recordingPath, path.extname(recordingPath));  
    const transcriptFileName = `${originalFileName}-transcript-${Date.now()}.txt`;  
    const transcriptFilePath = path.join(transcriptsDir, transcriptFileName);  
    
    // Write the transcript to a file  
    await fs.writeFile(transcriptFilePath, transcript);  
    console.log(`Transcript saved to: ${transcriptFilePath}`); 


    // const transcriptSomeFilePath = path.join(__dirname, '..', 'trasnscription_files', '0502606168_1-transcript-1741471190437.txt');   
   // const transcriptFromFile = fs.readFileSync(transcriptFilePath, 'utf8'); 
    
    // Return the combined results  
    return { 
      transcript: transcript, // Return the transcript text
    };  
  } catch (error) {  
    console.error(`Error processing file: ${error.message}`);  
    throw error;  
  }
}
// should get the analyze from the frontend
async myAnalyzeCallTranscriptFromDisk(recordingPath, options = {}) { 
  console.log('myAnalyzeCallTranscriptFromDisk is running!');
  try {  
    // Validate the file exists  
    if (!fs.existsSync(recordingPath)) {  
      throw new Error(`Recording file not found: ${recordingPath}`);  
    }  
    
    // Generate a unique file name for GCS  
    const fileName = `transcription-${Date.now()}${path.extname(recordingPath)}`;  
    
    // Upload the file to Google Cloud Storage first  
    const bucketName = 'transcription-audio-files-omer'; // Your bucket name  
    const gcsUri = await this.googleCloud.uploadFileStreamToBucket(  
      bucketName,  
      fileName,  
      recordingPath  
    );  
    
    console.log(`File uploaded successfully to GCS: ${gcsUri}`);  
    
    // Set up transcription options  
    const transcriptionOptions = {  
      encoding: path.extname(recordingPath).toLowerCase() === '.mp3' ? 'MP3' : 'LINEAR16',  
      languageCode: options.languageCode || 'en-US',  
      enableSpeakerDiarization: options.enableSpeakerDiarization !== false,  
      speakerCount: options.speakerCount || 2,  
    };  
    
    // Transcribe the audio using the GCS URI (not the local path)  
    const transcriptResult = await this.googleCloud.transcribeLongAudio(  
      gcsUri,   // Use the GCS URI returned from upload  
      transcriptionOptions  
    );   
    
    // Extract the transcript text (assuming the method returns an object with a 'transcription' property)  
    const transcript = transcriptResult.transcription || transcriptResult;  
    
    // Create a directory for transcripts if it doesn't exist  
    const transcriptsDir = path.join(__dirname, '..', 'trasnscription_files');  
    if (!fs.existsSync(transcriptsDir)) {  
      fs.mkdirSync(transcriptsDir, { recursive: true });  
    }  
    
    // Generate a filename for the transcript  
    const originalFileName = path.basename(recordingPath, path.extname(recordingPath));  
    const transcriptFileName = `${originalFileName}-transcript-${Date.now()}.txt`;  
    const transcriptFilePath = path.join(transcriptsDir, transcriptFileName);  
    
    // Write the transcript to a file  
    await fs.promises.writeFile(transcriptFilePath, transcript);  
    console.log(`Transcript saved to: ${transcriptFilePath}`); 


    // const transcriptSomeFilePath = path.join(__dirname, '..', 'trasnscription_files', '0502606168_1-transcript-1741471190437.txt');   
   // const transcriptFromFile = fs.readFileSync(transcriptFilePath, 'utf8'); 

    // Instead of making 3 separate API calls, make a single comprehensive call  
    const analysisResults = await this.openAI.analyzeTranscript(transcript, {  
      includeSummary: options.generateSummary !== false,  
      includeSalePrecision: options.generateSalePrecision !== false,  
      includeSaleMoves: options.generateSaleMoves !== false,  
      saveResults: true,  // Save all results to files  
      baseName: path.basename(recordingPath, path.extname(recordingPath))  
    });  
    
    // Return the combined results  
    return { 
      transcript: transcript, // Return the transcript text
      summary: analysisResults.summary,  
      precision: analysisResults.salePrecision,  
      moves: analysisResults.saleMoves,  
      filePaths: analysisResults.filePaths  
    };  
  } catch (error) {  
    console.error(`Error processing file: ${error.message}`);  
    throw error;  
  }   
}

async myTranscribeAndSummarizeFromDisk(recordingPath, options = {}) { 
  console.log('myTranscribeAndSummarizeFromDisk is running!');
  try {  
    // Validate the file exists  
    if (!fs.existsSync(recordingPath)) {  
      throw new Error(`Recording file not found: ${recordingPath}`);  
    }  
    
    // Generate a unique file name for GCS  
    const fileName = `transcription-${Date.now()}${path.extname(recordingPath)}`;  
    
    // Upload the file to Google Cloud Storage first  
    const bucketName = 'transcription-audio-files-omer'; // Your bucket name  
    const gcsUri = await this.googleCloud.uploadFileStreamToBucket(  
      bucketName,  
      fileName,  
      recordingPath  
    );  
    
    console.log(`File uploaded successfully to GCS: ${gcsUri}`);  
    
    // Set up transcription options  
    const transcriptionOptions = {  
      encoding: path.extname(recordingPath).toLowerCase() === '.mp3' ? 'MP3' : 'LINEAR16',  
      languageCode: options.languageCode || 'en-US',  
      enableSpeakerDiarization: options.enableSpeakerDiarization !== false,  
      speakerCount: options.speakerCount || 2,  
    };  
    
    // Transcribe the audio using the GCS URI (not the local path)  
    const transcriptResult = await this.googleCloud.transcribeLongAudio(  
      gcsUri,   // Use the GCS URI returned from upload  
      transcriptionOptions  
    );   
    
    // Extract the transcript text (assuming the method returns an object with a 'transcription' property)  
    const transcript = transcriptResult.transcription || transcriptResult;  
    
    // Create a directory for transcripts if it doesn't exist  
    const transcriptsDir = path.join(__dirname, '..', 'trasnscription_files');  
    if (!fs.existsSync(transcriptsDir)) {  
      fs.mkdirSync(transcriptsDir, { recursive: true });  
    }  
    
    // Generate a filename for the transcript  
    const originalFileName = path.basename(recordingPath, path.extname(recordingPath));  
    const transcriptFileName = `${originalFileName}-transcript-${Date.now()}.txt`;  
    const transcriptFilePath = path.join(transcriptsDir, transcriptFileName);  
    
    // Write the transcript to a file  
    await fs.promises.writeFile(transcriptFilePath, transcript);  
    console.log(`Transcript saved to: ${transcriptFilePath}`); 


    // const transcriptSomeFilePath = path.join(__dirname, '..', 'trasnscription_files', '0502606168_1-transcript-1741471190437.txt');   
   // const transcriptFromFile = fs.readFileSync(transcriptFilePath, 'utf8'); 

    // Instead of making 3 separate API calls, make a single comprehensive call  
    const analysisResults = await this.openAI.analyzeTranscript(transcript, {  
      includeSummary: options.generateSummary !== false,  
      includeSalePrecision: options.generateSalePrecision !== false,  
      includeSaleMoves: options.generateSaleMoves !== false,  
      saveResults: true,  // Save all results to files  
      baseName: path.basename(recordingPath, path.extname(recordingPath))  
    });  
    
    // Return the combined results  
    return {  
      summary: analysisResults.summary,  
      precision: analysisResults.salePrecision,  
      moves: analysisResults.saleMoves,  
      filePaths: analysisResults.filePaths  
    };  
  } catch (error) {  
    console.error(`Error processing file: ${error.message}`);  
    throw error;  
  }   
}
async transcribeAndSummarizeFromDisk(filePath, callId, options = {}) {  
  try {  
    // Get file information   
    
    // Get the original file name if needed for content type detection  
    const fileName = path.basename(filePath);  
    
    // Upload audio file from disk to cloud storage  
    const uploadFilename = `${callId || `call-${Date.now()}`}.wav`;  
    
    // There are two approaches here:  
    // 1. Read the file into memory first (simpler but uses more memory)  
    // 2. Stream the file directly (more efficient but more complex)  
    
    // Approach 1: Read file into memory then upload  
    const audioBuffer = fs.readFileSync(filePath);  
    // const audioFileUrl = await this.googleCloud.uploadFile(  
    //   'call-recordings-bucket',   
    //   uploadFilename,   
    //   audioBuffer,  
    //   {   
    //     contentType: options.mimeType || 'audio/wav',  
    //     metadata: { callId, origin: 'disk-upload', originalPath: filePath }  
    //   }  
    // );  
    
    // Alternative Approach 2: Stream upload (implement if needed)  
    // const audioFileUrl = await this.googleCloud.uploadFileFromPath(  
    //   'call-recordings-bucket',  
    //   uploadFilename,  
    //   filePath,  
    //   { contentType: options.mimeType || 'audio/wav' }  
    // );  
    const audioFileUrl = await this.googleCloud.uploadFileFromPath(  
      'call-recordings-bucket',  
      uploadFilename,  
      filePath,  
      {   
        contentType: options.mimeType,   
        metadata: { callId, origin: 'disk-upload' },  
        makePublic: true  // If you need the file to be publicly accessible  
      }  
    ); 
    // Transcribe the audio - same as before  
    const transcript = await this.googleCloud.transcribeAudio(audioFileUrl, {  
      languageCode: options.languageCode || 'en-US',  
      encoding: options.encoding || 'LINEAR16',  
      sampleRateHertz: options.sampleRateHertz || 16000,  
      enableSpeakerDiarization: true,  
      diarizationSpeakerCount: options.speakerCount || 2  
    });  
    
    // Summarize the transcript - same as before  
    const sentenceCount = options.sentenceCount || 10;  
    const analysis = await this.openAI.analyzeText(transcript, {  
      analysisType: 'summary',  
      sentenceCount  
    });  
    
    // Store everything in Firestore - same as before  
    const callRecord = {  
      id: callId,  
      transcript,  
      summary: analysis.summary,  
      audioFileUrl,  
      originalFilePath: filePath, // Add source file path  
      metadata: {  
        processedAt: new Date(),  
        duration: options.duration,  
        sentenceCount,  
        model: analysis.model,  
        sourceType: 'disk-file',  
        ...options.additionalInfo  
      }  
    };  
    
    await this.googleCloud.addDocument('call-summaries', callRecord);  
    
    // Clean up the local file if needed  
    // Uncomment if you want to delete the file after processing  
    // fs.unlinkSync(filePath);  
    
    // Return the result  
    return {  
      callId,  
      transcript,  
      summary: analysis.summary,  
      metadata: callRecord.metadata  
    };  
  } catch (error) {  
    console.error(`Error processing file from disk: ${error.message}`, error);  
    throw error; // Re-throw to be handled by the controller  
  }  
}


// Process audio buffer, transcribe it, and generate a summary  
async transcribeAndSummarizeFromBuffer(audioBuffer, callId, options = {}) {  
  try {  
    // Upload audio to cloud storage  
    const filename = `${callId || `call-${Date.now()}`}.wav`;  
    const audioFileUrl = await this.googleCloud.uploadFile(  
      'call-recordings-bucket',   
      filename,   
      audioBuffer,  
      {   
        contentType: options.mimeType || 'audio/wav',  
        metadata: { callId, origin: 'buffer-upload' }  
      }  
    );  
    
    // Transcribe the audio  
    const transcript = await this.googleCloud.transcribeAudio(audioFileUrl, {  
      languageCode: options.languageCode || 'en-US',  
      encoding: options.encoding || 'LINEAR16',  
      sampleRateHertz: options.sampleRateHertz || 16000,  
      enableSpeakerDiarization: true,  
      diarizationSpeakerCount: options.speakerCount || 2  
    });  
    
    // Summarize the transcript  
    const sentenceCount = options.sentenceCount || 10;  
    const analysis = await this.openAI.analyzeText(transcript, {  
      analysisType: 'summary',  
      sentenceCount  
    });  
    
    // Store everything in Firestore  
    const callRecord = {  
      id: callId,  
      transcript,  
      summary: analysis.summary,  
      audioFileUrl,  
      metadata: {  
        processedAt: new Date(),  
        duration: options.duration,  
        sentenceCount,  
        model: analysis.model,  
        sourceType: 'memory-buffer',  
        ...options.additionalInfo  
      }  
    };  
    
    await this.googleCloud.addDocument('call-summaries', callRecord);  
    
    // Return the result  
    return {  
      callId,  
      transcript,  
      summary: analysis.summary,  
      metadata: callRecord.metadata  
    };  
  } catch (error) {  
    console.error(`Error processing buffer: ${error.message}`, error);  
    throw error; // Re-throw to be handled by the controller  
  }  
}

// Get existing call summary  
async getCallSummary(callId) {  
  const doc = await this.googleCloud.getDocument('call-summaries', callId);  
  return doc || null;  
} 

  // Process audio and analyze method (unchanged from before)  
  async processAudioAndAnalyze(audioBuffer, callId, metadata = {}) {  
    // ... implementation remains the same  
  }  
  
  // Method to analyze an existing transcript  
  async analyzeExistingTranscript(callId) {  
    // Download existing transcript  
    const transcript = await this.googleCloud.downloadFile(  
      'transcripts-bucket',   
      `call-${callId}.txt`  
    );  
    
    if (!transcript) {  
      throw new Error(`Transcript not found for call ${callId}`);  
    }  
    
    // Analyze the transcript using OpenAI  
    const analysis = await this.openAI.analyzeText(transcript, {  
      analysisType: 'call-transcript',  
      extractEntities: true  
    });  
    
    // Store the analysis  
    await this.googleCloud.addDocument('call-analyses', {  
      callId,  
      analysis,  
      timestamp: new Date()  
    });  
    
    return analysis;  
  }  
  
  // Get analysis method (unchanged from before)  
  async getAnalysis(callId) {  
    const doc = await this.googleCloud.getDocument('call-records', callId);  
    return doc ? doc.analysis : null;  
  }  

  async logTranscriptionError(callId, error) {  
    console.log(`Logging error for call ${callId}...`);  
    // Implementation details...  
  }  

   /* * Converts an MP4 file to WAV format.
 ** @param {string} inputPath - Path to the input MP4 file.
  ** @param {string} outputPath - Path for the output WAV file.
  *** @returns {Promise<void>}
  **/
  convertMp4ToWav2 = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioCodec('pcm_s16le')
        .on('start', commandLine => {
          console.log(`Conversion started: ${commandLine}`);
        })
        .on('progress', progress => {
          console.log(`Processing: ${progress.percent.toFixed(2)}%`);
        })
        .on('end', () => {
          console.log('Conversion completed successfully.');
          resolve();
        })
        .on('error', (err) => {
          console.error('An error occurred:', err.message);
          reject(err);
        })
        .save(outputPath);
  })
}

convertMp4ToWav = async (inputPath, outputPath) => {
  // const fileName = path.parse(inputPath).name;
  // const outputPath = path.join(outputDir, `${fileName}.wav`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .audioCodec('pcm_s16le')
      .on('start', commandLine => {
        console.log(`Conversion started: ${commandLine}`);
      })
      .on('progress', progress => {
        if (progress.percent) {
          console.log(`Processing: ${progress.percent.toFixed(2)}%`);
        } else {
          console.log('Processing...');
        }
      })
      .on('end', () => {
        console.log(`Conversion successful: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('An error occurred:', err.message);
        reject(err);
      })
      .save(outputPath);
  });
};


/**
 * Convert audio file to mono channel and 16kHz sampling rate.
 * @param {string} inputPath - path to original WAV file
 * @param {string} outputPath - path for the converted WAV file
 * @returns {Promise<void>}
 */
convertAudioToMono16k = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioChannels(1)
      .audioFrequency(16000)
      .format('wav')
      .on('start', (cmd) => {
        console.log(`Conversion started: ${cmd}`);

      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${progress.percent.toFixed(2)}%`);
        } else {
          console.log('Processing audio...');
        }
      })
      .on('end', () => {
        console.log('Conversion to mono/16k completed successfully.');
        resolve(); // <-- IMPORTANT! this was missing
      })
      .on('error', (err) => {
        console.error(`Error converting audio: ${err.message}`);
        reject(err); // <-- make sure you reject errors
      })
      .save(outputPath);
  });
};

/**
 * Get audio sample rate and channels of the given audio file.
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<{sample_rate: number, channels: number}>}
 */
      getAudioDetails = async (filePath) => {
        return new Promise((resolve, reject) => {
          ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
              reject(err);
            } else {
              const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
              if (!audioStream) {
                return reject(new Error('No audio stream found'));
              }
              resolve({
                sample_rate: parseInt(audioStream.sample_rate, 10),
                channels: audioStream.channels,
              });
            };
        });
      })
    }

    // Clearly defined function (async method)
async ensureMono16kIfNeeded(inputWavPath) {
  const { sample_rate, channels } = await this.getAudioDetails(inputWavPath);

  console.log(`Audio details: ${sample_rate} Hz, ${channels} channels`);

  if (sample_rate === 16000 && channels === 1) {
    console.log('File already mono 16kHz, no conversion needed.');
    return inputWavPath;
  }

  const outputMono16kPath = inputWavPath.replace('.wav', '_mono16k.wav');
  await this.convertAudioToMono16k(inputWavPath, outputMono16kPath);
  
  return outputMono16kPath;
};

  // async transcribeAndSummarize(audioBuffer, callId, options = {}) {  
//   // Upload audio to cloud storage  
//   const filename = `${callId || `call-${Date.now()}`}.wav`;  
//   const audioFileUrl = await this.googleCloud.uploadFile(  
//     'call-recordings-bucket',   
//     filename,   
//     audioBuffer,  
//     {   
//       contentType: options.mimeType || 'audio/wav',  
//       metadata: { callId, origin: 'web-upload' }  
//     }  
//   );  
  
//   // Transcribe the audio  
//   const transcript = await this.googleCloud.transcribeAudio(audioFileUrl, {  
//     languageCode: options.languageCode || 'en-US',  
//     encoding: options.encoding || 'LINEAR16',  
//     sampleRateHertz: options.sampleRateHertz || 16000,  
//     enableSpeakerDiarization: true,  
//     diarizationSpeakerCount: options.speakerCount || 2  
//   });  
  
//   // Summarize the transcript  
//   const sentenceCount = options.sentenceCount || 10;  
//   const analysis = await this.openAI.analyzeText(transcript, {  
//     analysisType: 'summary',  
//     sentenceCount  
//   });  
  
//   // Store everything in Firestore  
//   const callRecord = {  
//     id: callId,  
//     transcript,  
//     summary: analysis.summary,  
//     audioFileUrl,  
//     metadata: {  
//       processedAt: new Date(),  
//       duration: options.duration,  
//       sentenceCount,  
//       model: analysis.model,  
//       ...options.additionalInfo  
//     }  
//   };  
  
//   await this.googleCloud.addDocument('call-summaries', callRecord);  
  
//   // Return the result  
//   return {  
//     callId,  
//     transcript,  
//     summary: analysis.summary,  
//     metadata: callRecord.metadata  
//   };  
// }  


// Process audio file, transcribe it, and generate a summary  
// async myTranscribeAndSummarizeFromDisk(recordingPath, options = {}) {  
//   try {  
//     // Validate the file exists  
//     if (!fs.existsSync(recordingPath)) {  
//       throw new Error(`Recording file not found: ${recordingPath}`);  
//     }  
    
//     // Set up transcription options  
//     const transcriptionOptions = {  
//       encoding: path.extname(recordingPath).toLowerCase() === '.mp3' ? 'MP3' : 'LINEAR16',  
//       languageCode: options.languageCode || 'en-US',  
//       enableSpeakerDiarization: options.enableSpeakerDiarization !== false,  
//       speakerCount: options.speakerCount || 2,  
//     };  
    
//     // Transcribe the audio  
//     const transcript = await this.googleCloud.transcribeLongAudio(  
//       recordingPath,   
//       transcriptionOptions  
//     );  
    
//     // Summarize the transcript (if requested)  
//     let summary = null;  
//     if (options.generateSummary !== false) {  
//       const sentenceCount = options.sentenceCount || 10;  
//       const analysis = await this.openAI.analyzeText(transcript, {  
//         analysisType: 'summary',  
//         sentenceCount  
//       });  
//       summary = analysis.summary;  
//     }  
    
//     // Return just the results  
//     return summary
    
//   } catch (error) {  
//     console.error(`Error processing file: ${error.message}`);  
//     throw error;  
//   }   
// }

}  

module.exports = CallService;