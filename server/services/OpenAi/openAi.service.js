const OpenAI = require('openai');
const { Configuration, OpenAIApi } = require("openai");

const dotenv = require('dotenv');

class OpenAIService {
  constructor() {
    // Load environment variables
    dotenv.config();
    // const configuration = new Configuration({ apiKey });  //GPT
    // this.openai = new OpenAIApi(configuration);          //GPT
    // Initialize OpenAI client with API key from environment
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY
    });

    // Default configuration for API calls
    this.defaultConfig = {
      model: 'gpt-3.5-turbo',
      maxTokens: 150,
      temperature: 0.7
    };
  }


  /**
   * Resume analyzer using OpenAI Chat Completions.
   *
   * Purpose:
   * Converts a free-text resume into a normalized JSON schema for storage/search/display.
   *
   * Guarantees:
   * - Output is JSON-only (enforced with response_format: json_object + strict instructions).
   * - Extracted values are returned in English (translate from Hebrew if needed).
   * - No hallucination: if a field isn't explicitly present, it returns null (or empty array).
   *
   * Notes:
   * - temperature=0 for deterministic extraction.
   * - "skills" is always an array (possibly empty).
   */
    async resumeAnalysis(resume, model = "gpt-4o-mini") {
    const prompt = `Extract the following from the resume text.
      Return ONLY valid JSON. No markdown. No extra text. Do NOT repeat the resume.
      All extracted text must be in ENGLISH (translate from Hebrew if needed).
      Do not guess. If a field is missing, return null.
      JSON keys:
      - name: string|null
      - phone: string|null
      - address: string|null
      - email: string|null
      - skills: string[]
      - work_experience: { company: string, title: string, start_date: string|null, end_date: string|null, highlights: string }[]
      - education: { institution: string, degree: string|null, field: string|null, year: string|null }[]
      RESUME TEXT:
      """${resume}"""`;
        const response = await this.openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: "You output ONLY valid JSON, in English. Do not invent missing data." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0,
        });
        return JSON.parse(response.choices[0].message.content);
  }
  
  /**
  1 * Generate text completion using OpenAI API
   * @param {string} prompt - Input prompt for text generation
   * @param {Object} [options={}] - Optional configuration overrides
   * @returns {Promise<string>} Generated text response
   */
  async generateText(prompt, options = {}) {
    try {
      // Merge default config with provided options
      const config = { 
        ...this.defaultConfig, 
        ...options 
      };

      const response = await this.openai.chat.completions.create({
        model: config.model,
        messages: [{ 
          role: 'user', 
          content: prompt 
        }],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Improved error handling for v4.x
      if (error instanceof OpenAI.APIError) {
        console.error('OpenAI API Error Details:', {
          status: error.status,
          code: error.code,
          type: error.type
        });
      }
      
      throw new Error('Failed to generate text');
    }
  }
  //2 by GPT
  async generateText2(prompt, model = "gpt-3.5-turbo", maxTokens = 150) {
    try {
      const response = await this.openai.createChatCompletion({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
      });
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error generating text:", error);
      throw error;
    }
  }

  /**
  3* Generate image using DALL-E
   * @param {string} prompt - Descriptive image generation prompt
   * @param {Object} [options={}] - Optional image generation parameters
   * @returns {Promise<string>} URL of generated image
   */
  async generateImage(prompt, options = {}) {
    try {
      const imageResponse = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard'
      });

      return imageResponse.data[0].url;
    } catch (error) {
      console.error('Image Generation Error:', error);
      
      // Improved error handling for v4.x
      if (error instanceof OpenAI.APIError) {
        console.error('OpenAI Image API Error Details:', {
          status: error.status,
          code: error.code,
          type: error.type
        });
      }
      
      throw new Error('Failed to generate image');
    }
  }


//4
  async summaryTextFile(path){
    // reading the transcription file
    const thefile = await this.readJsonFile(path)
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
//5
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
 //6. 
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


//7. TODO: config path and file name
  async speechToText(path){
    try {
      const filename = '0502606168_2'
      const fullFilename = `${filename}.mp3`
      const filepath = path.join(__dirname, '..', 'files', fullFilename);
      const answer = await this.transcriptGPT(filepath);
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
//8
  async transcriptGPT(filepath){
    
    const transcription = await  this.openai.audio.transcriptions.create({
    file: fs.createReadStream(filepath),
    model: "whisper-1",
  });

    console.log(transcription.text);
    return transcription.text
  }
  /**
  9* Estimate total API usage cost
   * @param {number} promptTokens - Number of input tokens
   * @param {number} completionTokens - Number of output tokens
   * @returns {number} Estimated cost in USD
   */
  calculateApiCost(promptTokens, completionTokens) {
    const INPUT_COST_PER_1K = 0.01;   // $0.01 per 1000 tokens
    const OUTPUT_COST_PER_1K = 0.03;  // $0.03 per 1000 tokens

    const inputCost = (promptTokens / 1000) * INPUT_COST_PER_1K;
    const outputCost = (completionTokens / 1000) * OUTPUT_COST_PER_1K;

    return Number((inputCost + outputCost).toFixed(4));
  }

  /**
  10 * Get token usage from API response
   * @param {Object} response - OpenAI API response
   * @returns {Object} Token usage details
   */
  getTokenUsage(response) {
    return {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0
    };
  }
//11
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




  
  // Analyze text using OpenAI - general purpose function  
  async analyzeText(text, options = {}) {  
    // Determine which analysis type to perform based on options  
    switch (options.analysisType) {  
      case 'summary':  
        return this.summarizeText(text, options.sentenceCount || 10);  
      case 'call-transcript':  
        return this.analyzeCallTranscript(text, options);  
      default:  
        throw new Error(`Unknown analysis type: ${options.analysisType}`);  
    }  
  }  

  // Summarize text into a specified number of sentences  
  async summarizeText(text, sentenceCount = 10) {  
    const response = await this.openai.chat.completions.create({  
      model: "gpt-4o",  
      messages: [  
        {  
          role: "system",  
          content: `You are an expert call analyzer. Your task is to summarize the provided call transcript concisely in exactly ${sentenceCount} clear sentences. Focus on the key points, main topics discussed, any decisions made, and action items.`  
        },  
        {  
          role: "user",  
          content: text  
        }  
      ],  
      temperature: 0.3, // Lower temperature for more focused output  
      max_tokens: 1000  
    });  

    return {  
      summary: response.choices[0].message.content,  
      model: response.model,  
      usage: response.usage  
    };  
  }  

  // Analyze call transcript with entity extraction  
  async analyzeCallTranscript(text, options = {}) {  
    const systemPrompt = `You are an expert call analyzer. Analyze the following call transcript and provide:  
1. A summary of the key points  
2. Main topics discussed  
3. Sentiments expressed  
${options.extractEntities ? '4. Important entities mentioned (people, companies, products, dates, etc.)' : ''}  
5. Any action items or next steps mentioned`;  

    const response = await this.openai.chat.completions.create({  
      model: "gpt-4o",  
      messages: [  
        {  
          role: "system",  
          content: systemPrompt  
        },  
        {  
          role: "user",  
          content: text  
        }  
      ],  
      temperature: 0.2,  
      max_tokens: 1500  
    });  

    return {  
      analysis: response.choices[0].message.content,  
      model: response.model,  
      usage: response.usage  
    };  
  }  

//******** Enhanced OpenAIService with Transcript Analysis Functions ****************************

  /**  
   * Analyze transcript with multiple analysis types in a single API call  
   * @param {string} transcript - The transcript text to analyze  
   * @param {Object} options - Analysis options  
   * @returns {Promise<Object>} Combined analysis results  
   */  
  async analyzeTranscript(transcript, options = {}) {  
    try {  
      // Build a structured prompt that combines all requested analyses  
      const prompt = this.buildAnalysisPrompt(transcript, options);  
      
      // Make a single API call to analyze everything at once  
      const response = await this.openai.chat.completions.create({  
        model: options.model || "gpt-4o",  
        messages: [  
          {  
            role: "system",  
            content: "You are an expert call analyzer specializing in sales conversations. Provide detailed, actionable insights."  
          },  
          {  
            role: "user",  
            content: prompt  
          }  
        ],  
        temperature: 0.3,  
        max_tokens: 2000  
      });  

      // Parse the response to extract each analysis section  
      const analysisText = response.choices[0].message.content;  
      const parsedResults = this.parseAnalysisResponse(analysisText);  
      
      return {  
        ...parsedResults,  
        model: response.model,  
        usage: response.usage  
      };  
    } catch (error) {  
      console.error('Error analyzing transcript:', error);  
      throw new Error(`Failed to analyze transcript: ${error.message}`);  
    }  
  }  

  /**  
   * Build a comprehensive analysis prompt based on requested options  
   * @private  
   */  
  buildAnalysisPrompt(transcript, options) {  
    // Start with instructions  
    let prompt = `Analyze this sales call transcript and provide:\n\n`;  
    
    // Add requested analysis sections  
    if (options.includeSummary !== false) {  
      prompt += "# SUMMARY\nProvide a concise summary of the conversation in 5-7 sentences.\n\n";  
    }  
    
    if (options.includeSalePrecision !== false) {  
      prompt += "# SALES PRECISION\nEvaluate how effectively the sales approach matched the customer's needs. Rate on a scale of 1-10 and explain why.\n\n";  
    }  
    
    if (options.includeSaleMoves !== false) {  
      prompt += "# RECOMMENDED MOVES\nList 5 specific actions that could improve the chance of making a sale based on this conversation. Number each recommendation.\n\n";  
    }  
    
    // Add any custom analysis sections  
    if (options.customAnalysis) {  
      options.customAnalysis.forEach(analysis => {  
        prompt += `# ${analysis.title.toUpperCase()}\n${analysis.instructions}\n\n`;  
      });  
    }  
    
    // Add the transcript  
    prompt += "# TRANSCRIPT\n" + transcript;  
    
    return prompt;  
  }  

  /**  
   * Parse the combined analysis response into separate sections  
   * @private  
   */  
  parseAnalysisResponse(responseText) {  
    const result = {};  
    
    // Extract Summary section  
    const summaryMatch = responseText.match(/# SUMMARY\s+([\s\S]*?)(?=# |$)/i);  
    if (summaryMatch) {  
      result.summary = summaryMatch[1].trim();  
    }  
    
    // Extract Sales Precision section  
    const precisionMatch = responseText.match(/# SALES PRECISION\s+([\s\S]*?)(?=# |$)/i);  
    if (precisionMatch) {  
      result.salePrecision = precisionMatch[1].trim();  
    }  
    
    // Extract Recommended Moves section  
    const movesMatch = responseText.match(/# RECOMMENDED MOVES\s+([\s\S]*?)(?=# |$)/i);  
    if (movesMatch) {  
      result.saleMoves = movesMatch[1].trim();  
    }  
    
    // Extract any custom sections  
    const customSections = responseText.match(/# ([A-Z][A-Z\s]+)\s+([\s\S]*?)(?=# |$)/gi);  
    if (customSections) {  
      customSections.forEach(section => {  
        const [, title, content] = section.match(/# ([A-Z][A-Z\s]+)\s+([\s\S]*)/i) || [];  
        if (title && content && !['SUMMARY', 'SALES PRECISION', 'RECOMMENDED MOVES', 'TRANSCRIPT'].includes(title.trim())) {  
          result[title.toLowerCase().replace(/\s+/g, '_')] = content.trim();  
        }  
      });  
    }  
    
    return result;  
  }  
  
  /**  
   * Save analysis results to files  
   * @param {string} baseName - Base name for the files  
   * @param {Object} analysis - Analysis results to save  
   * @returns {Promise<Object>} Paths to saved files  
   */  
  async saveAnalysisResults(baseName, analysis) {  
    const resultsDir = path.join(__dirname, '..', 'analysis_results');  
    
    // Create directory if it doesn't exist  
    try {  
      await fs.mkdir(resultsDir, { recursive: true });  
    } catch (error) {  
      if (error.code !== 'EEXIST') throw error;  
    }  
    
    const timestamp = Date.now();  
    const filePaths = {};  
    
    // Save each analysis section to a separate file  
    for (const [key, content] of Object.entries(analysis)) {  
      if (typeof content === 'string' && !['model', 'usage'].includes(key)) {  
        const fileName = `${baseName}-${key}-${timestamp}.txt`;  
        const filePath = path.join(resultsDir, fileName);  
        await fs.writeFile(filePath, content, 'utf8');  
        filePaths[key] = filePath;  
        console.log(`Saved ${key} to: ${filePath}`);  
      }  
    }  
    
    // Save combined results to a JSON file  
    const jsonFileName = `${baseName}-full-analysis-${timestamp}.json`;  
    const jsonFilePath = path.join(resultsDir, jsonFileName);  
    await fs.writeFile(jsonFilePath, JSON.stringify(analysis, null, 2), 'utf8');  
    filePaths.fullAnalysis = jsonFilePath;  
    
    return filePaths;  
  }  

  /**  
   * Analyze transcript with options to save results  
   * @param {string} transcript - Transcript text to analyze  
   * @param {Object} options - Analysis options  
   * @param {boolean} saveResults - Whether to save results to files  
   * @returns {Promise<Object>} Analysis results and file paths  
   */  
  async analyzeAndSaveTranscript(transcript, options = {}, saveResults = false) {  
    // Perform analysis  
    const analysis = await this.analyzeTranscript(transcript, options);  
    
    // Save results if requested  
    if (saveResults) {  
      const baseName = options.baseName || 'transcript';  
      const filePaths = await this.saveAnalysisResults(baseName, analysis);  
      return { ...analysis, filePaths };  
    }  
    
    return analysis;  
  }  
  
  /**  
   * Read a transcript file and analyze it  
   * @param {string} filePath - Path to transcript file  
   * @param {Object} options - Analysis options  
   * @returns {Promise<Object>} Analysis results  
   */  
  async analyzeTranscriptFile(filePath, options = {}) {  
    try {  
      // Read the transcript file  
      const transcript = await fs.readFile(filePath, 'utf8');  
      
      // Set base name for saved files from original filename  
      const baseName = path.basename(filePath, path.extname(filePath));  
      options.baseName = baseName;  
      
      // Analyze and optionally save results  
      return await this.analyzeAndSaveTranscript(transcript, options, options.saveResults);  
    } catch (error) {  
      console.error(`Error analyzing transcript file: ${error.message}`);  
      throw error;  
    }  
  }  









  



}

module.exports = OpenAIService;  