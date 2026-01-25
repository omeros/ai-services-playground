const { OpenAI } = require('openai');  
const fs = require('fs').promises;  
const path = require('path');  

/**  CLAUDE 3.5
 * Service class for interacting with OpenAI's API  
 */  
class OpenAiService2 {  
  /**  
   * Creates a new OpenAiCloudService instance  
   * @param {Object} config - Configuration options  
   * @param {string} config.apiKey - OpenAI API key  
   * @param {string} config.organization - Optional organization ID  
   * @param {number} config.timeout - Request timeout in ms (default: 30000)  
   * @param {string} config.defaultModel - Default model to use for completions  
   */  
  constructor(config = {}) { 
    // Use config.apiKey if provided, otherwise fall back to environment variable  
    const apiKey = config.apiKey || process.env.OPEN_AI_API_KEY; 
    if (!apiKey) {  
      throw new Error('OpenAI API key is required');  
    }  

    this.defaultModel = config.defaultModel || 'gpt-4o';  
    
    this.client = new OpenAI({  
      apiKey: apiKey,  
      organization: config.organization,  
      timeout: config.timeout || 30000,  
      maxRetries: 3  
    });  
    
    this.logger = config.logger || console;  
  }  

  /**  
  1* Generate text completion based on provided prompt  
   * @param {Object} params - Completion parameters  
   * @param {string} params.prompt - The input prompt  
   * @param {string} params.model - Optional model override  
   * @param {number} params.maxTokens - Maximum tokens to generate  
   * @param {number} params.temperature - Randomness of output (0-2)  
   * @returns {Promise<string>} Generated text  
   */  
  async generateCompletion({ prompt, model, maxTokens = 1000, temperature = 0.7 }) {  
    try {  
      const response = await this.client.chat.completions.create({  
        model: model || this.defaultModel,  
        messages: [{ role: 'user', content: prompt }],  
        max_tokens: maxTokens,  
        temperature,  
      });  
      
      return response.choices[0].message.content;  
    } catch (error) {  
      this.logger.error('Error generating completion:', error);  
      throw new Error(`OpenAI API error: ${error.message}`);  
    }  
  }  

  /**  
  2* Generate image from text prompt  
   * @param {Object} params - Image generation parameters   
   * @param {string} params.prompt - Text description of the image  
   * @param {string} params.size - Image size (e.g., '1024x1024')  
   * @param {number} params.n - Number of images to generate  
   * @returns {Promise<Array<string>>} Array of image URLs  
   */  
  async generateImage({ prompt, size = '1024x1024', n = 1 }) {  
    try {  
      const response = await this.client.images.generate({  
        prompt,  
        n,  
        size,  
      });  
      
      return response.data.map(image => image.url);  
    } catch (error) {  
      this.logger.error('Error generating image:', error);  
      throw new Error(`OpenAI image generation error: ${error.message}`);  
    }  
  }  

  /**  
  3* Transcribe audio to text  
   * @param {Object} params - Transcription parameters  
   * @param {string} params.audioFilePath - Path to audio file  
   * @param {string} params.language - Optional language code  
   * @returns {Promise<string>} Transcribed text  
   */  
  async transcribeAudio({ audioFilePath, language }) {  
    try {  
      const file = await fs.readFile(audioFilePath);  
      const fileName = path.basename(audioFilePath);  
      
      const response = await this.client.audio.transcriptions.create({  
        file: new File([file], fileName),  
        model: 'whisper-1',  
        language,  
      });  
      
      return response.text;  
    } catch (error) {  
      this.logger.error('Error transcribing audio:', error);  
      throw new Error(`OpenAI transcription error: ${error.message}`);  
    }  
  }  

  /**  
  4* Embed text using OpenAI's embedding models  
   * @param {Object} params - Embedding parameters  
   * @param {string|string[]} params.input - Text to embed  
   * @param {string} params.model - Embedding model to use  
   * @returns {Promise<number[][]>} Vector embeddings  
   */  
  async createEmbeddings({ input, model = 'text-embedding-3-small' }) {  
    try {  
      const response = await this.client.embeddings.create({  
        input,  
        model,  
      });  
      
      return response.data.map(item => item.embedding);  
    } catch (error) {  
      this.logger.error('Error creating embeddings:', error);  
      throw new Error(`OpenAI embedding error: ${error.message}`);  
    }  
  }  

  /**  
  5* Create a fine-tuned model  
   * @param {Object} params - Fine-tuning parameters  
   * @param {string} params.trainingFileId - File ID containing training data  
   * @param {string} params.baseModel - Base model to fine-tune  
   * @returns {Promise<Object>} Fine-tuning job details  
   */  
  async createFineTuningJob({ trainingFileId, baseModel = 'gpt-3.5-turbo' }) {  
    try {  
      const response = await this.client.fineTuning.jobs.create({  
        training_file: trainingFileId,  
        model: baseModel,  
      });  
      
      return response;  
    } catch (error) {  
      this.logger.error('Error creating fine-tuning job:', error);  
      throw new Error(`OpenAI fine-tuning error: ${error.message}`);  
    }  
  }  
}  

module.exports = OpenAiService2;