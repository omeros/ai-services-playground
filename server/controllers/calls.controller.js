// controllers/call-analysis.controller.js  
const GoogleCloudService = require('../services/Google/google.cloud.service');  
const OpenAIService = require('../services/OpenAi/openAi.service');  
const CallService = require('../services/call.service');  
const path = require('path');
const fs = require('fs')



class CallsController {  
  constructor() {  
    this.googleCloud = new GoogleCloudService();  
    this.openAI = new OpenAIService();  
    this.callService = new CallService(this.googleCloud, this.openAI);  
  }  

  // Analyze an audio file uploaded by the user  
  async processAndAnalyzeAudioCall(req, res) {  
    try {  
      // Validate request  
      if (!req.file) {  
        return res.status(400).json({ error: 'No audio file provided' });  
      }  

      // Extract data from request  
      const audioBuffer = req.file.buffer;  
      const callId = req.body.callId || `call-${Date.now()}`;  
      const metadata = {  
        mimeType: req.file.mimetype,  
        languageCode: req.body.languageCode || 'en-US',  
        // other metadata...  
      };  

      // Use service for business logic  
      const result = await this.callService.processAudioAndAnalyze(  
        audioBuffer,   
        callId,   
        metadata  
      );  

      // Handle HTTP response  
      res.status(200).json({  
        success: true,  
        ...result  
      });  
    } catch (error) {  
      console.error(`Error in call analysis: ${error.message}`);  
      res.status(500).json({   
        success: false,   
        error: error.message   
      });  
    }  
  }  

  // Analyze an existing transcript file  
  async analyzeCallTranscript(req, res) {  
    try {  
      const { callId } = req.params;  
      
      if (!callId) {  
        return res.status(400).json({  
          success: false,  
          error: 'Call ID is required'  
        });  
      }  
      
      // Use callService to handle the business logic  
      const analysis = await this.callService.analyzeExistingTranscript(callId);  
      
      res.status(200).json({  
        success: true,  
        callId,  
        analysis  
      });  
    } catch (error) {  
      console.error(`Error analyzing transcript for call ${req.params.callId}: ${error.message}`);  
      res.status(500).json({  
        success: false,  
        error: `Failed to analyze transcript: ${error.message}`  
      });  
    }  
  }  

  // Get analysis for an existing call  
  async getCallAnalysis(req, res) {
    try {  
      const { callId } = req.params;  
      
      // Use service for data retrieval  
      const analysis = await this.callService.getAnalysis(callId);  
      
      if (!analysis) {  
        return res.status(404).json({  
          success: false,  
          error: `Analysis for call ${callId} not found`  
        });  
      }  
      
      res.status(200).json({  
        success: true,  
        analysis  
      });  
    } catch (error) {  
      res.status(500).json({  
        success: false,  
        error: error.message  
      });  
    }  
  }  

  async myTranscribeAndSummarizeFromDisk(req, res) {  
    try {  
      // Validate request  
      if (!req.file) {  
        return res.status(400).json({  
          success: false,  
          error: 'No audio file provided'  
        });  
      }  
      const fileName = req.file.originalname;  
      const filepath = path.join(__dirname, '../', process.env.MP3_UPLOAD_FOLDER_FILES, req.file.filename); // Use multer filename   
      console.log(`Processing file: ${fileName}`); 
      // Call the service with the file path  
      const result = await this.callService.myTranscribeAndSummarizeFromDisk(  
        filepath,  
        {  
          sentenceCount: 10,  
          languageCode: 'he-IL'  
        }  
      );  
      // Return a more structured response  
      return res.status(200).json({  
        success: true,  

        summary: result  
      });  
    } catch (error) {  
      console.error(`Error processing call: ${error.message}`, error);  
      return res.status(500).json({  
        success: false,  
        error: `Failed to process call: ${error.message}`  
      });  
    } finally {  
      // Optional: Clean up the uploaded file if desired  
      // if (req.file && req.file.path) {  
      //   fs.unlinkSync(req.file.path);  
      // }  
    }  
  }
  async myAnalyzeCallTranscriptFromDisk(req, res) {  
    try {  
      // Validate request  
      if (!req.file) {  
        return res.status(400).json({  
          success: false,  
          error: 'No audio file provided'  
        });  
      }  
      const fileName = req.file.originalname;  
      const filepath = path.join(__dirname, '../', process.env.MP3_UPLOAD_FOLDER_FILES, req.file.filename); // Use multer filename   
      console.log(`Processing file: ${fileName}`); 
      // Call the service with the file path  
      const result = await this.callService.myAnalyzeCallTranscriptFromDisk(  
        filepath,  
        {  
          sentenceCount: 10,  
          languageCode: 'he-IL'  
        }  
      );  
      // Return a more structured response  
      return res.status(200).json({  
        success: true,  
        summary: result  
      });  
    } catch (error) {  
      console.error(`Error processing call: ${error.message}`, error);  
      return res.status(500).json({  
        success: false,  
        error: `Failed to process call: ${error.message}`  
      });  
    } finally {  
      // Optional: Clean up the uploaded file if desired  
      // if (req.file && req.file.path) {  
      //   fs.unlinkSync(req.file.path);  
      // }  
    }  
  }

  async transcribeAndSummarizeFromDisk(req, res) {  
    try {  
      // Validate request  
      if (!req.file) {  
        return res.status(400).json({  
          success: false,  
          error: 'No audio file provided'  
        });  
      }  
  
      // Same parameter extraction as before...  
  
      // This is the key difference - use the file path instead of buffer   
      const result = await this.callService.transcribeAndSummarizeFromDisk(req.file.path,callId,options);  
  
      // Same response handling as before...  
    } catch (error) {  
      console.error(`Error processing call: ${error.message}`, error);  
      res.status(500).json({  
        success: false,  
        error: `Failed to process call: ${error.message}`  
      });  
    }  
  }

  async myCallTranscriptFromDiskMp4(req, res){
    try {  
      // Validate request  
      if (!req.file) {  
        return res.status(400).json({  
          success: false,  
          error: 'No audio file provided'  
        });  
      }  
      const fileName = req.file.originalname;  
      const filepath = path.join(__dirname, '../',  process.env.MP4_UPLOAD_FOLDER_FILES, req.file.filename); // Use multer filename   
      console.log(`Processing file: ${fileName}`); 
      // Call the service with the file path  
      const result = await this.callService.myCallTranscriptFromDiskMp4(  
        filepath,  
        {  
          sentenceCount: 10,  
          languageCode: 'he-IL'  
        }  
      );  
      // Return a more structured response  
      return res.status(200).json({  
        success: true,  
        transcription: result  
      });  
    } catch (error) {  
      console.error(`Error processing call: ${error.message}`, error);  
      return res.status(500).json({  
        success: false,  
        error: `Failed to process call: ${error.message}`  
      });  
    } finally {  
      // Optional: Clean up the uploaded file if desired  
      // if (req.file && req.file.path) {  
      //   fs.unlinkSync(req.file.path);  
      // }  
    } 
  }


async myCallTranscriptFromDiskM4A(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No audio file provided' });
    }
    console.log(' controller - myCallTranscriptFromDiskM4A:');
    console.log('req.file keys:', req.file && Object.keys(req.file));
    console.log('has buffer?', !!req.file?.buffer, 'has path?', req.file?.path);
    console.log('saved path:', req.file.path);
    console.log('original:', req.file.originalname);
    // Prefer multer's real saved path
    const filepath = req.file.path;
    // Validate M4A early (return 400, not 500)
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== '.m4a') {
      return res.status(400).json({
        success: false,
        error: `Only .m4a files are supported. Got: ${ext || '(no extension)'}`
      });
    }
    console.log(`Processing file: ${req.file.originalname}`);
    console.log(`Saved path: ${filepath}`);
    const result = await this.callService.myCallTranscriptFromDiskM4A(filepath, {
      languageCode: 'he-IL',
      sentenceCount: 10, // service currently ignores this (unless you use it later)
    });
    return res.status(200).json({
      success: true,
      transcription:  result.transcript,   // cleaner payload
    });
  } catch (error) {
    console.error(`Error processing call: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      error: `Failed to process call: ${error.message}`
    });
  }
}



  async myCallTranscriptFromDiskMp3Heb(req, res){
    try {  
      // Validate request  
      if (!req.file) {  
        return res.status(400).json({  
          success: false,  
          error: 'No audio file provided'  
        });  
      }  
      const fileName = req.file.originalname;  
      const filepath = path.join(__dirname, '../', process.env.MP3_UPLOAD_FOLDER_FILES, req.file.filename); // Use multer filename   
      console.log(`Processing file: ${fileName}`); 
      // Call the service with the file path  
      const result = await this.callService.myCallTranscriptFromDiskMp3(  
        filepath,  
        {  
          sentenceCount: 10,  
          languageCode: 'he-IL'  
        }  
      );  
   // const transcriptFromFile = fs.readFileSync('./trasnscription_files/0502606168_2-transcript-1743454075915.txt', 'utf8'); 
      // await fs.write(result, `./files/transcribed_${fileName}.txt`,'utf8')
      // Return a more structured response  
      return res.status(200).json({  
        success: true,  
        transcription:  result.transcript,    
      });  
    } catch (error) {  
      console.error(`Error processing call: ${error.message}`, error);  
      return res.status(500).json({  
        success: false,  
        error: `Failed to process call: ${error.message}`  
      });  
    } finally {  
      // Optional: Clean up the uploaded file if desired  
      // if (req.file && req.file.path) {  
      //   fs.unlinkSync(req.file.path);  
      // }  
    } 
  }
  async myCallTranscriptFromDiskMp3Eng(req, res){
    try {  
      // Validate request  
      if (!req.file) {  
        return res.status(400).json({  
          success: false,  
          error: 'No audio file provided'  
        });  
      }  
      const fileName = req.file.originalname;  
      const filepath = path.join(__dirname, '../', process.env.MP3_UPLOAD_FOLDER_FILES, req.file.filename); // Use multer filename   
      console.log(`Processing file: ${fileName}`); 
      // Call the service with the file path  
      const result = await this.callService.myCallTranscriptFromDiskMp3(  
        filepath,  
        {  
          sentenceCount: 10,  
          languageCode: 'en-US'  
        }  
      );  
   // const transcriptFromFile = fs.readFileSync('./trasnscription_files/0502606168_2-transcript-1743454075915.txt', 'utf8'); 
      // await fs.write(result, `./files/transcribed_${fileName}.txt`,'utf8')
      // Return a more structured response  
      return res.status(200).json({  
        success: true,  
       transcription:  result.transcript,    
      });  
    } catch (error) {  
      console.error(`Error processing call: ${error.message}`, error);  
      return res.status(500).json({  
        success: false,  
        error: `Failed to process call: ${error.message}`  
      });  
    } finally {  
      // Optional: Clean up the uploaded file if desired  
      // if (req.file && req.file.path) {  
      //   fs.unlinkSync(req.file.path);  
      // }  
    } 
  }
  async transcribeAndSummarizeFromBuffer(req, res) {  
    try {  
      // Validate request  
      if (!req.file || !req.file.buffer) {  
        return res.status(400).json({   
          success: false,   
          error: 'No audio file buffer provided'   
        });  
      }  
  
      // Extract parameters from request  
      const callId = req.body.callId || `call-${Date.now()}`;  
      const options = {  
        mimeType: req.file.mimetype,  
        languageCode: req.body.languageCode || 'en-US',  
        encoding: req.body.encoding || 'LINEAR16',  
        sampleRateHertz: parseInt(req.body.sampleRateHertz || '16000', 10),  
        speakerCount: parseInt(req.body.speakerCount || '2', 10),  
        sentenceCount: parseInt(req.body.sentenceCount || '10', 10),  
        duration: req.body.duration ? parseFloat(req.body.duration) : undefined,  
        additionalInfo: {  
          userId: req.user?.id,  
          source: req.body.source || 'manual-upload',  
          clientInfo: req.get('User-Agent')  
        }  
      };  
  
      // Process the call using our buffer-specific service method  
      const result = await this.callService.transcribeAndSummarizeFromBuffer(  
        req.file.buffer,  
        callId,  
        options  
      );  
  
      // Return result  
      res.status(200).json({  
        success: true,  
        callId: result.callId,  
        summary: result.summary,  
        // Only include transcript if specifically requested  
        ...(req.query.includeTranscript === 'true' ? { transcript: result.transcript } : {})  
      });  
    } catch (error) {  
      console.error(`Error processing call from buffer: ${error.message}`, error);  
      res.status(500).json({   
        success: false,   
        error: `Failed to process call: ${error.message}`   
      });  
    }  
  }
  
  
  // Process and summarize a call  
  async transcribeAndSummarize(req, res) {  
    try {  
      // Validate request  
      if (!req.file) {  
        return res.status(400).json({   
          success: false,   
          error: 'No audio file provided'   
        });  
      }  

      // Extract parameters from request  
      const callId = req.body.callId || `call-${Date.now()}`;  
      const options = {  
        mimeType: req.file.mimetype,  
        languageCode: req.body.languageCode || 'en-US',  
        encoding: req.body.encoding || 'LINEAR16',  
        sampleRateHertz: parseInt(req.body.sampleRateHertz || '16000', 10),  
        speakerCount: parseInt(req.body.speakerCount || '2', 10),  
        sentenceCount: parseInt(req.body.sentenceCount || '10', 10),  
        duration: req.body.duration ? parseFloat(req.body.duration) : undefined,  
        additionalInfo: {  
          userId: req.user?.id,  
          source: req.body.source || 'manual-upload',  
          clientInfo: req.get('User-Agent')  
        }  
      };  

      // Process the call using our service  
      const result = await this.callService.transcribeAndSummarize(  
        req.file.buffer,  
        callId,  
        options  
      );  

      // Return result  
      res.status(200).json({  
        success: true,  
        callId: result.callId,  
        summary: result.summary,  
        // Only include transcript if specifically requested  
        ...(req.query.includeTranscript === 'true' ? { transcript: result.transcript } : {})  
      });  
    } catch (error) {  
      console.error(`Error processing call: ${error.message}`, error);  
      res.status(500).json({   
        success: false,   
        error: `Failed to process call: ${error.message}`   
      });  
    }  
  }  

  

  // Get a specific call summary  
  async getCallSummary(req, res) {  
    try {  
      const { callId } = req.params;  
      
      if (!callId) {  
        return res.status(400).json({  
          success: false,  
          error: 'Call ID is required'  
        });  
      }  
      
      const callData = await this.callService.getCallSummary(callId);  
      
      if (!callData) {  
        return res.status(404).json({  
          success: false,  
          error: `Call summary not found for call ${callId}`  
        });  
      }  
      
      res.status(200).json({  
        success: true,  
        callId,  
        summary: callData.summary,  
        metadata: callData.metadata,  
        // Only include transcript if specifically requested  
        ...(req.query.includeTranscript === 'true' ? { transcript: callData.transcript } : {})  
      });  
    } catch (error) {  
      console.error(`Error retrieving call summary: ${error.message}`);  
      res.status(500).json({  
        success: false,  
        error: `Failed to retrieve call summary: ${error.message}`  
      });  
    }  
  }  
}  

module.exports = CallsController;