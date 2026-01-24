// jobs/processCallBatch.js  
const { CronJob } = require('cron');  
const GoogleCloudService = require('../services/google.cloud.service');  
const OpenAIService = require('../services/openai.service');  
const CallAnalysisController = require('../controllers/call-analysis.controller');  

// Initialize services and controller  
const googleCloud = new GoogleCloudService();  
const openAI = new OpenAIService();  
const callAnalysisController = new CallAnalysisController(googleCloud, openAI);  

// Define job to process recent calls  
const processRecentCalls = async () => {  
  try {  
    // Get calls from last 24 hours that need processing  
    const recentCalls = await googleCloud.queryDocuments('calls', [  
      ['timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)],  
      ['processed', '==', false]  
    ]);  
    
    // Process each call  
    for (const call of recentCalls) {  
      await callAnalysisController.analyzeCallTranscript(call.id);  
      await googleCloud.updateDocument('calls', call.id, { processed: true });  
      console.log(`Processed call ${call.id}`);  
    }  
  } catch (error) {  
    console.error('Error processing recent calls:', error);  
  }  
};  

// Schedule job to run every hour  
const job = new CronJob('0 * * * *', processRecentCalls);  
//job.start();