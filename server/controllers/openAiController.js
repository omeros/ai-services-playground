



const { EOF } = require("dns");
//const schedule = require("node-schedule");
const loggerService = require("../services/loggerService");
const puppeteer = require('puppeteer');
const fs = require('fs').promises;;
const path = require('path');
const axios = require('axios');
require('dotenv').config();
// import OpenAI from "openai";
const OpenAI = require('openai');
const OpenAIService = require('../services/OpenAi/openAi.service');




class OpenAiController {
  constructor() {
    this.openAIService = OpenAIService
    this.API_KEY = process.env.OPEN_AI_API_KEY;
    this.openai = new OpenAI({ apiKey: this.API_KEY });
    // this.openai = new OpenAI({
    //     organization: "org-snJIYxTb7krWzFXdz4LfYXgc",
    //     project: "$PROJECT_ID",
    // });
  }
  async summaryTextFile(req, res){
    const queries = req.body
    // reading the transcription file
    const thefile = await this.readJsonFile('0528899664_1.mp3_transcription.txt')
    // refactor the transcription file into array of text:
    const result = this.extractAllTranscripts(thefile)
    // reffering to GPT for running queries on the stream data ('system', 'user', 'assistant' ):
    const stream = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [   
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `summarize this  text: ${result}` }
      ],
      store: true,
      stream: true,
  });
  for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
      res.end()
  }

  extractAllTranscripts(theFile) {
    if (!theFile || !Array.isArray(theFile.results)) {
      console.error("Invalid file structure");
      return "";
    }
  
    const allTranscripts = theFile.results
      .flatMap(item => 
        item.alternatives?.map(alt => alt.transcript) || []
      )
      .join(' ');
  
    return allTranscripts;
  }
  
  async  readJsonFile(fullFilename) {
    try {
       const filepath = path.join(__dirname, '..', 'trasnscription_files/', fullFilename);
      const data = await fs.readFile(filepath, 'utf8');
      const jsonData = JSON.parse(data);
      console.log(jsonData);
      return jsonData; // You can return the JSON data to use outside
    } catch (err) {
      console.error("Error reading file:", err);
    }
  }

  // keep the conversation in "maxHistory" size.
  
  manageChatHistory(history, maxHistory) {
    // Keep system prompt
    const systemMessage = history[0];
    
    // Get conversation excluding system prompt
    const conversationMessages = history.slice(1);
    
    // If conversation exceeds limit, remove oldest messages
    if (conversationMessages.length > maxHistory - 1) {
      conversationMessages.splice(0, conversationMessages.length - (maxHistory - 1));
    }
    
    // Rebuild conversation
    return [systemMessage, ...conversationMessages];
  }



  async speechToText(req, res){
    try {
      const filename = '0502606168_2'
      const fullFilename = `${filename}.mp3`
      const filepath = path.join(__dirname, '..', 'files', fullFilename);
      await this.openAIService(filepath)
      // const answer = await this.transcriptGPT(filepath);
      // console.log('answer==============>', answer);
  
      // // Convert answer to a string (if it's an object, convert to JSON)
      // const answerString = typeof answer === 'object' ? JSON.stringify(answer, null, 2) : answer;
  
      // // Write the answer to a file
      // fs.writeFile(`${filename}_transcription.txt`, answerString, 'utf8', (err) => {
      //   if (err) {
      //     console.error('Error writing to file:', err);
      //   } else {
      //     console.log('Transcription saved to transcription.txt');
      //   }
      // });
  
    } catch (error) {
      console.error('Error in transcription:', error);
    }
    res.end()
  }

  async transcriptGPT(filepath){
    
    const transcription = await  this.openai.audio.transcriptions.create({
    file: fs.createReadStream(filepath),
    model: "whisper-1",
  });

    console.log(transcription.text);
    return transcription.text
  }

}

module.exports = new OpenAiController();






