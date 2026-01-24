const { Storage } = require('@google-cloud/storage');
const { Firestore }= require ('@google-cloud/firestore');
const { PubSub }= require ('@google-cloud/pubsub');
const { SpeechClient } = require('@google-cloud/speech');   
const fs = require('fs');  
const path = require('path');  


class GoogleCloudService {
//   constructor(config = {}) {  
//     // Validate projectId  
//     this.projectId = config.projectId || process.env.GOOGLE_CLOUD_PROJECT_ID;  
//   // Validate projectId  
//   if (!this.projectId || typeof this.projectId !== 'string') {  
//     throw new Error('A valid projectId string must be provided either in config or via GOOGLE_CLOUD_PROJECT_ID environment variable');  
//   }  
//     // PubSub client  
//     this.pubsub = new PubSub({ rojectId: this.projectId  });  
//     this.defaultBucket = config.bucketName || 'transcription-audio-files-omer';  
//     this.storage = new Storage({ projectId: this.projectId });  
//     this.firestore = new Firestore({ projectId: this.projectId });  
//     this.speechClient = new SpeechClient({ projectId: this.projectId }); 
    
//     console.log(`Initialized Google Cloud services for project: ${this.projectId}`);  
// }

  constructor(config = {}) {  
    // Validate projectId  
    this.projectId = config.projectId || process.env.GOOGLE_CLOUD_PROJECT_ID;  
    if (!this.projectId || typeof this.projectId !== 'string') {  
      throw new Error('A valid projectId string must be provided either in config or via GOOGLE_CLOUD_PROJECT_ID environment variable');  
    }  
    // Handle keyFilename  
    this.keyFilename = config.keyFilename || process.env.GOOGLE_CLOUD_KEY_FILE;  
    if (this.keyFilename) {  
      // Verify the key file exists  
      const keyPath = path.resolve(this.keyFilename);  
      if (!fs.existsSync(keyPath)) {  
        throw new Error(`Service account key file not found at: ${keyPath}`);  
      }  
      console.log(`Using service account key file: ${keyPath}`);  
      this.keyFilename = keyPath; // Use the resolved path  
    } else {  
      console.log('No keyFilename provided. Using default application credentials.');  
    }  
    // Set up auth configuration for all clients  
    const authConfig = {   
      projectId: this.projectId  
    };  
    // Only add keyFilename if it exists  
    if (this.keyFilename) {  
      authConfig.keyFilename = this.keyFilename;  
    } 
    // Initialize service clients with auth configuration  
    this.pubsub = new PubSub(authConfig);  // Fixed the typo (was rojectId)  
    this.storage = new Storage(authConfig);  
    this.firestore = new Firestore(authConfig);  
    this.speechClient = new SpeechClient(authConfig);  
    
    // Set default bucket and region  
    this.defaultBucket = config.bucketName || 'transcription-audio-files-omer';  
    this.defaultRegion = config.region || 'europe-west3'; // Better for Israel  
    
    console.log(`Initialized Google Cloud services for project: ${this.projectId}`);  
    console.log(`Default GCS bucket: ${this.defaultBucket} (${this.defaultRegion})`); 

  }


  /**  
   * Creates a GCS bucket if it doesn't already exist  
   * @param {string} bucketName - Name of the bucket to create  
   * @param {string} location - GCP region for the bucket  
   * @returns {Promise<object>} - Information about the bucket  
   */  
  async createBucket(bucketName = this.defaultBucket, location = this.defaultRegion) {  
    // Add at the start of your important methods  
    console.log('Service account being used:',   
    JSON.parse(fs.readFileSync(this.keyFilename)).client_email);
    try {  
      const bucket = this.storage.bucket(bucketName);  
      const [exists] = await bucket.exists();  
      
      if (exists) {  
        console.log(`Bucket ${bucketName} already exists.`);  
        return bucket;  
      }  
      
      console.log(`Creating bucket ${bucketName} in ${location}...`);  
      const [newBucket] = await this.storage.createBucket(bucketName, {  
        location: location,  
        storageClass: 'STANDARD'  
      });  
      
      console.log(`Bucket ${bucketName} created successfully.`);  
      return newBucket;  
    } catch (error) {  
      console.error(`Error creating bucket ${bucketName}:`, error);  
      throw new Error(`Failed to create bucket: ${error.message}`);  
    }  
  }  


async uploadFile(bucketName, filename, fileBuffer, options = {}) {  
  const bucket = this.storage.bucket(bucketName);  
  const file = bucket.file(filename);  
  
  const uploadOptions = {  
    contentType: options.contentType || 'audio/wav',  
    metadata: options.metadata || {}  
  };  
  
  await file.save(fileBuffer, uploadOptions);  
  return `gs://${bucketName}/${filename}`;  
} 

/**  
 * Uploads a file to Google Cloud Storage directly from a file path using streaming  
 *   
 * @param {string} bucketName - Name of the GCS bucket  
 * @param {string} destinationFileName - The file name to use in Cloud Storage  
 * @param {string} filePath - Local file path to upload  
 * @param {Object} options - Upload options (contentType, metadata, etc.)  
 * @returns {Promise<string>} - The public URL of the uploaded file  
  */  
  async uploadFileFromPath(bucketName, destinationFileName, filePath, options = {}) {  
    try {  
      // Import required libraries  
      const fs = require('fs');  
      const path = require('path');  

      // Initialize storage  
      const storage = new Storage();  
      const bucket = storage.bucket(bucketName);  
      const file = bucket.file(destinationFileName);  

      // Set upload options  
      const uploadOptions = {  
        contentType: options.contentType || this._getContentTypeFromPath(filePath),  
        metadata: {  
          ...options.metadata || {},  
        },  
        resumable: true, // Recommended for files > 5MB  
      };  

      // Create a write stream to GCS  
      const writeStream = file.createWriteStream(uploadOptions);  

      // Return a promise that resolves when upload is complete  
      return new Promise((resolve, reject) => {  
        // Create a read stream from the local file  
        const readStream = fs.createReadStream(filePath);  

        // Handle errors  
        readStream.on('error', (err) => {  
          reject(new Error(`Error reading from local file: ${err.message}`));  
        });  

        writeStream.on('error', (err) => {  
          reject(new Error(`Error uploading to Cloud Storage: ${err.message}`));  
        });  

        // Handle successful upload  
        writeStream.on('finish', async () => {  
          try {  
            // Make the file public if needed  
            if (options.makePublic) {  
              await file.makePublic();  
            }  

            // Generate and return the file URL  
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationFileName}`;  
            resolve(publicUrl);  
          } catch (err) {  
            reject(new Error(`Error finalizing upload: ${err.message}`));  
          }  
        });  

        // Pipe the file to GCS  
        readStream.pipe(writeStream);  
      });  
    } catch (error) {  
      console.error('Upload from path failed:', error);  
      throw new Error(`Failed to upload file from path: ${error.message}`);  
    }  
  }  
  async myUploadFileFromPath(destinationFileName, filePath) {  
    try {  
      // Create a write stream to GCS  
      const writeStream = file.createWriteStream(uploadOptions);  
      // Create a read stream from the local file  
      const readStream = fs.createReadStream(filePath);  
      return readStream
      // Return a promise that resolves when upload is complete  
      // return new Promise((resolve, reject) => {  
      //   // Create a read stream from the local file  
      //   const readStream = fs.createReadStream(filePath);  
      // });  
    } catch (error) {  
      console.error('Upload from path failed:', error);  
      throw new Error(`Failed to upload file from path: ${error.message}`);  
    }  
  }  

  /**  
   * Helper method to determine content type from file path  
   * @private  
   */  
  _getContentTypeFromPath(filePath) {  
    const extension = path.extname(filePath).toLowerCase();  
    const contentTypeMap = {  
      '.wav': 'audio/wav',  
      '.mp3': 'audio/mpeg',  
      '.ogg': 'audio/ogg',  
      '.flac': 'audio/flac',  
      '.m4a': 'audio/mp4',  
      '.aac': 'audio/aac',  
      '.mp4': 'video/mp4',  
    };  
    
    return contentTypeMap[extension] || 'application/octet-stream';  
  }

  // async transcribeLongAudio2(filePath, options = {}) {  
  //   // 1. Stream the file to a bucket (memory efficient)  
  //   const fileName = `recording-${Date.now()}.mp3`;  
  //   const bucketName = 'your-transcription-bucket';  
    
  //   const gcsUri = await this.uploadFileStreamToBucket(  
  //     bucketName,   
  //     fileName,   
  //     filePath  
  //   );  
    
  //   // 2. Start long-running transcription operation  
  //   const [operation] = await this.speechClient.longRunningRecognize({  
  //     audio: { uri: gcsUri },  
  //     config: {  
  //       encoding: options.encoding || 'MP3',  
  //       sampleRateHertz: options.sampleRateHertz || 16000,  
  //       languageCode: options.languageCode || 'en-US',  
  //       enableAutomaticPunctuation: true,  
  //       enableSpeakerDiarization: options.enableSpeakerDiarization || true,  
  //       diarizationSpeakerCount: options.speakerCount || 2,  
  //       // Add any other advanced features you need  
  //     }  
  //   });  
    
  //   // 3. Wait for operation to complete (could take a while for long files)  
  //   const [response] = await operation.promise();  
    
  //   // 4. Process and return results  
  //   return this.processTranscriptionResponse(response);  
  // }
  
  /**  
   * Transcribe long audio files using Google Cloud Speech-to-Text  
   */  
  // async transcribeLongAudio3(filePath, options = {}) {  
  //   try {  
  //     // 1. Generate a unique filename for cloud storage  
  //     const fileName = `transcription-${Date.now()}${path.extname(filePath)}`;  
  //     const bucketName = options.bucketName || this.defaultBucket;  
      
  //     // 2. Upload the file to Google Cloud Storage  
  //     const gcsUri = await this.uploadFileStreamToBucket(  
  //       bucketName,   
  //       fileName,   
  //       filePath  
  //     );  
      
  //     console.log(`Starting long-running transcription for ${gcsUri}`);  
      
  //     // 3. Start the transcription operation  
  //     const [operation] = this.speechClient.longRunningRecognize({  
  //       audio: { uri: gcsUri },  
  //       config: {  
  //         encoding: options.encoding || this.getEncodingFromPath(filePath),  
  //         sampleRateHertz: options.sampleRateHertz || 16000,  
  //         languageCode: options.languageCode || 'en-US',  
  //         enableAutomaticPunctuation: true,  
  //         enableSpeakerDiarization: options.enableSpeakerDiarization || false,  
  //         diarizationSpeakerCount: options.speakerCount || 2,  
  //         model: options.model || 'default',  
  //         audioChannelCount: options.audioChannelCount || 1,  
  //       }  
  //     });  
      
  //     // 4. Wait for the operation to complete  
  //     console.log('Waiting for transcription to complete...');  
  //     const [response] = await operation.promise();  
      
  //     // 5. Process the transcription results  
  //     let transcript = this.processTranscriptionResponse(response);  
      
  //     // 6. Optionally delete the file from cloud storage  
  //     if (options.deleteAfterTranscription) {  
  //       await bucket.file(fileName).delete();  
  //       console.log(`Deleted ${fileName} from cloud storage`);  
  //     }  
      
  //     return transcript;  
  //   } catch (error) {  
  //     console.error('Error in transcribeLongAudio:', error);  
  //     throw new Error(`Transcription failed: ${error.message}`);  
  //   }  
  // }  

  async transcribeLongAudio(gcsUri, config = {}) {  
    try {  
      console.log(`Starting long-running transcription for ${gcsUri}`);  
      
      // Set up the request config  
      const request = {  
        audio: { uri: gcsUri },  
        config: {  
          encoding: config.encoding || 'MP3',  
          sampleRateHertz: config.sampleRateHertz || 16000,  
          languageCode: config.languageCode || 'he-IL',  
          enableAutomaticPunctuation: true,  
          model: 'default',  
          ...config  
        }  
      };  
      
      console.log('Transcription request config:', JSON.stringify(request, null, 2));  
      
      // The API returns a Promise that resolves to an array with:  
      // [0]: The operation object  
      // [1]: Request details  
      const [operation] = await this.speechClient.longRunningRecognize(request);  
      
      console.log('Waiting for operation to complete...');  
      
      // Wait for the operation to complete  
      const [response] = await operation.promise();  
      
      console.log('Transcription completed successfully.');  
      
      // Process results  
      const transcription = response.results  
        .map(result => result.alternatives[0].transcript)  
        .join('\n');  
      
      return {  
        transcription,  
        fullResponse: response  
      };  
    } catch (error) {  
      console.error('Error in transcribeLongAudio:', error);  
      throw new Error(`Transcription failed: ${error.message}`);  
    }  
  }
  /**  
   * Process transcription response into a usable format  
   */  
  processTranscriptionResponse(response) {  
    // Simple version - just concatenate all transcripts  
    let transcript = '';  
    
    if (response && response.results) {  
      response.results.forEach(result => {  
        if (result.alternatives && result.alternatives[0]) {  
          transcript += result.alternatives[0].transcript + ' ';  
        }  
      });  
    }  
    
    return transcript.trim();  
  }  

  /**  
   * Determine encoding from file path/extension  
   */  
  getEncodingFromPath(filePath) {  
    const ext = path.extname(filePath).toLowerCase();  
    switch (ext) {  
      case '.mp3':  
        return 'MP3';  
      case '.wav':  
        return 'LINEAR16';  
      case '.flac':  
        return 'FLAC';  
      case '.ogg':  
        return 'OGG_OPUS';  
      default:  
        return 'ENCODING_UNSPECIFIED';  
    }  
  }  


  /**  
 * Uploads a file to Google Cloud Storage using streaming to handle large files  
 * @param {string} bucketName - Name of the GCS bucket  
 * @param {string} fileName - Name to give the file in the bucket  
 * @param {string} filePath - Local path to the file  
 * @returns {Promise<string>} - GCS URI for the uploaded file (gs://bucket/filename)  
 */  
  async uploadFileStreamToBucket(bucketName, fileName, filePath) {  
    console.log('Upload parameters:');  
    console.log('- bucketName:', bucketName);  
    console.log('- fileName:', fileName);  
    console.log('- filePath:', filePath);
    try {  
      // // Ensure the bucket exists  
      // const bucket = this.storage.bucket(bucketName);  
      // const exists = await bucket.exists();  
      
      // if (!exists[0]) {  
      //   console.log(`Bucket ${bucketName} does not exist. Creating it...`);  
      //   await bucket.create({  
      //     location: 'us-central1',  
      //     storageClass: 'STANDARD'  
      //   });  
      // }  

      // Use our dedicated createBucket method instead of inline creation  
      const bucket = await this.createBucket(bucketName);  
      // Create a write stream for the cloud storage file  
      const file = bucket.file(fileName);  
      const writeStream = file.createWriteStream({  
        resumable: true,  
        contentType: this.getContentType(filePath),  
        metadata: {  
          contentType: this.getContentType(filePath)  
        }  
      });  

      // Create a read stream from local file  
      const readStream = fs.createReadStream(filePath);  

      // Handle errors on both streams  
      return new Promise((resolve, reject) => {  
        readStream.on('error', (error) => {  
          reject(`Error reading local file: ${error.message}`);  
        });  

        writeStream.on('error', (error) => {  
          reject(`Error uploading to GCS: ${error.message}`);  
        });  

        writeStream.on('finish', () => {  
          // Generate the gs:// URI format required by Speech-to-Text  
          const gcsUri = `gs://${bucketName}/${fileName}`;  
          console.log(`File uploaded successfully to ${gcsUri}`);  
          resolve(gcsUri);  
        });  

        // Start the upload by piping the read stream to the write stream  
        readStream.pipe(writeStream);  
      });  
    } catch (error) {  
      console.error('Error in uploadFileStreamToBucket:', error);  
      throw new Error(`Failed to upload file: ${error.message}`);  
    }  
  } 

    /**  
   * Determine content type from file path/extension  
   */  
    getContentType(filePath) {  
      const ext = path.extname(filePath).toLowerCase();  
      switch (ext) {  
        case '.mp3':  
          return 'audio/mpeg';  
        case '.wav':  
          return 'audio/wav';  
        case '.flac':  
          return 'audio/flac';  
        case '.ogg':  
          return 'audio/ogg';  
        case '.m4a':  
          return 'audio/mp4';  
        default:  
          return 'application/octet-stream';  
      }  
    }  

    
  // Transcribe audio using Google Cloud Speech-to-Text  
  async transcribeAudioWithGcsUri(gcsUri, config = {}) {  
    const request = {  
      audio: { uri: gcsUri },  
      config: {  
        languageCode: config.languageCode || 'en-US',  
        encoding: config.encoding || 'LINEAR16',  
        sampleRateHertz: config.sampleRateHertz || 16000,  
        enableAutomaticPunctuation: true,  
        model: config.model || 'default',  
        useEnhanced: true,  
        enableSpeakerDiarization: config.enableSpeakerDiarization || true,  
        diarizationSpeakerCount: config.diarizationSpeakerCount || 2  
      }  
    };  

    // Run speech recognition  
    const [operation] = await this.speechClient.longRunningRecognize(request);  
    const [response] = await operation.promise();  
    
    // Concatenate the transcript  
    return response.results  
      .map(result => result.alternatives[0].transcript)  
      .join('\n');  
  }
    // Store document in Firestore  
    async addDocument(collection, data) {  
      const docRef = data.id ?   
        this.firestore.collection(collection).doc(data.id) :   
        this.firestore.collection(collection).doc();  
      
      await docRef.set({  
        ...data,  
        createdAt: new Date()  
      });  
      
      return docRef.id;  
    }  
    // Upload file to Google Cloud Storage
    async uploadFile2(bucketName, filePath, destination) {
        try {
            const bucket = this.storage.bucket(bucketName);
            await bucket.upload(filePath, {
                destination: destination
            });
            return `File ${filePath} uploaded to ${bucketName}/${destination}`;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('File upload failed');
        }
    }

    // Create a new Firestore document
    async createDocument(collection, data) {
        try {
            const docRef = await this.firestore.collection(collection).add(data);
            return {
                id: docRef.id,
                message: 'Document created successfully'
            };
        } catch (error) {
            console.error('Firestore create error:', error);
            throw new Error('Document creation failed');
        }
    }

    // Publish message to PubSub topic
    async publishMessage(topicName, message) {
        try {
            const topic = this.pubsub.topic(topicName);
            const messageId = await topic.publish(Buffer.from(JSON.stringify(message)));
            return {
                messageId: messageId,
                message: 'Message published successfully'
            };
        } catch (error) {
            console.error('PubSub publish error:', error);
            throw new Error('Message publishing failed');
        }
    }

    // List files in a Google Cloud Storage bucket
    async listFiles(bucketName) {
        try {
            const [files] = await this.storage.bucket(bucketName).getFiles();
            return files.map(file => file.name);
        } catch (error) {
            console.error('File listing error:', error);
            throw new Error('Unable to list files');
        }
    }

    // Close connections
    async disconnect() {
        // In most Google Cloud clients, explicit disconnection isn't required
        // But you can add any cleanup logic here
        console.log('Google Cloud service connections closed');
    }

    //Performs synchronous speech recognition: receive results after all audio has been sent and processed.
    async speechToTextSync(file){
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
    } 

    
   //Performs asynchronous speech recognition: receive results via the google.longrunning.Operations interface.
  // Returns either an Operation.error or an Operation.response which contains a LongRunningRecognizeResponse message.
      async speechToTextAsync(req, res){
      const filename = '0502606168_2'
      const fullFilename = `${filename}.mp3`
      const filepath = path.join(__dirname, '..', 'files', fullFilename);
      const audioFile = fs.readFileSync(filepath);
      const audioBase64 = audioFile.toString('base64');
    
      try {
          const finalTranscript = await transcribeLongRunning(audioContentBase64);
          console.log('Final transcript:', finalTranscript);
    
        // Convert answer to a string (if it's an object, convert to JSON)
        const answerString = typeof finalTranscript === 'object' ? JSON.stringify(finalTranscript, null, 2) : finalTranscript;
    
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

      async  transcribeLongRunning(audioContentBase64) {
        // Endpoint for long-running recognize
        const endpoint = `https://speech.googleapis.com/v1/speech:longrunningrecognize?key=${this.API_KEY}`;
      
        const requestBody = {
          audio: {
            content: audioContentBase64, // Base64-encoded audio
          },
          config: {
            encoding: 'MP3',          // or LINEAR16, FLAC, etc., depending on your audio format
            sampleRateHertz: 16000,   // Make sure this matches your file's sampling rate
            languageCode: 'he-IL',    // Hebrew
          },
        };
      
        // 1) Start the long-running operation
        let response;
        try {
          response = await axios.post(endpoint, requestBody, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('Error starting long-running recognition:', error.response?.data || error.message);
          throw error;
        }
      
        // The operation object returned
        const operation = response.data; 
        // operation.name looks like "projects/PROJECT_ID/operations/OPERATION_ID"
        console.log('Started long-running recognition. Operation name:', operation.name);
      
        // 2) Poll the operation until it's done
        let operationStatus;
        while (true) {
          try {
            await sleep(5000); // wait 5 seconds before polling again
            const statusResponse = await axios.get(
              `https://speech.googleapis.com/v1/${operation.name}?key=${this.API_KEY}`
            );
            operationStatus = statusResponse.data;
      
            if (operationStatus.done) {
              break;
            }
            console.log('Operation still in progress, waiting...');
          } catch (error) {
            console.error('Error polling long-running recognition:', error.response?.data || error.message);
            throw error;
          }
        }
      
        // 3) Check results
        if (operationStatus.error) {
          // If there's an error field, the transcription failed
          throw new Error(`Transcription failed: ${operationStatus.error.message}`);
        }
      
        // If successful, the transcription is in operationStatus.response.results
        const results = operationStatus.response.results || [];
        let transcript = '';
        for (const result of results) {
          const alt = result.alternatives[0];
          transcript += alt.transcript;
        }
      
        return transcript;
      }
}


module.exports = GoogleCloudService;  
//export default GoogleCloudService; 