
// routes/calls.routes.js  
const express = require('express');  
const router = express.Router();  
const multer = require('multer');  
const path = require('path');
const CallsController = require('../controllers/calls.controller');  
const { sizeChecker } = require('../middleware/fileSize.middleware'); 
const { uploadToDisk,  uploadToMemory, uploadMP4ToDisk, uploadM4A} = require('../middleware/saveFiles.middleware')

const callsController = new CallsController();  

router.post('/transcript/mysummarize', uploadToDisk .single('audioFile'), (req, res) => callsController.myTranscribeAndSummarizeFromDisk(req, res));  
router.post('/transcript/anayzel', uploadToDisk .single('audioFile') ,(req, res) => callsController.myAnalyzeCallTranscriptFromDisk(req, res));  
router.post('/transcript/disk/mp3', uploadToDisk .single('audioMp3File') ,(req, res) => callsController.myCallTranscriptFromDiskMp3(req, res));  
router.post('/transcript/disk/mp4', uploadMP4ToDisk .single('audioMp4File') ,(req, res) => callsController.myCallTranscriptFromDiskMp4(req, res));  
router.post('/transcript/disk/m4a', uploadM4A.single('audioM4AFile'), (req, res) => callsController.myCallTranscriptFromDiskM4A(req, res));




// for files <= then 15MB
router.post('/summarize/small',uploadToDisk.single('audioFile'), (req, res) => callsController.transcribeAndSummarizeFromBuffer(req, res)  
);  
// Route to process and summarize an audio call files in any size
router.post('/summarize', uploadToDisk .single('audioFile'), (req, res) => callsController.transcribeAndSummarizeFromDisk(req, res));  

// Process and analyze uploaded audio  
router.post('/analyze', uploadToMemory.single('audioFile'),(req, res) => callsController.processAndAnalyzeAudioCall(req, res) );  

// Example route that uses disk storage  
router.post('/backup', uploadToDisk.single('audioFile'), (req, res) => callsController.backupAudioFile(req, res));  
// Routes with no file upload  
router.get('/:callId/summary', async (req, res) => {  callsController.getCallSummary(req, res); })
// Get analysis for a call  
router.get('/:callId/analysis',(req, res) => callsController.getCallAnalysis(req, res));  
// Analyze an existing transcript  
router.post('/:callId/transcript/anayzel', (req, res) => callsController.analyzeCallTranscript(req, res));  


module.exports = router;