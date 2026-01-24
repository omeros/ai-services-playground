const { OpenAI } = require('openai');  
const fs = require('fs').promises;  
const path = require('path');  
const axios = require('axios');  
const FormData = require('form-data');  

/**  CLAUDE 3.7 Sonnet
 * Base service with shared OpenAI functionality  
 */  
// This comprehensive implementation showcases:

// 1.Specialized Services:
// ChatService: Text generation and classification
// ImageService: Image generation and editing
// AudioService: Audio transcription, translation, and text-to-speech
// EmbeddingService: Text embeddings and similarity operations
// ModerationService: Content safety checking
// FineTuningService: Model customization
// FileService: File upload and management
// AssistantService: Assistants API integration

// 2.Advanced Features:
// Streaming responses
// Vector similarity calculations
// Automatic content moderation
// Document processing workflows
// Text-to-speech generation
// Image editing and variation creation

// 3.Design Patterns:
// Inheritance for code reuse
// Composition in the comprehensive service
// Strategy pattern for specialized operations
// Factory-like construction for services

// 4.Error Handling & Logging:
// Consistent error management across all API operations
// Detailed error logging through unified interface

//**************************************************** */

//include functions for:
//1.Text completion and chat
// 2.Image generation and editing
// 3.Audio transcription and translation
// 4.Embeddings
// 5.Fine-tuning
// 6.Moderation
// 7.DALL-E image generation
// 8.File management
// 9.Vector operations
// 10.Assistants API

class BaseOpenAiService {  
  /**  
   * Creates a new BaseOpenAiService instance  
   * @param {Object} config - Configuration options  
   */  
  constructor(config = {}) {  
    // Use config.apiKey if provided, otherwise fall back to environment variable  
    const apiKey = config.apiKey || process.env.OPEN_AI_API_KEY;  
    if (!apiKey) {  
      throw new Error('OpenAI API key is required');  
    }  

    this.client = new OpenAI({  
      apiKey: apiKey,  
      organization: config.organization,  
      timeout: config.timeout || 30000,  
      maxRetries: 3  
    });  
    
    this.logger = config.logger || console;  
  }  

  /**  
   * Execute an API call with standardized error handling  
   * @param {string} operationName - Name of the operation being performed  
   * @param {Function} apiCallFn - Async function that makes the API call  
   * @returns {Promise<any>} Result of the API call  
   */  
  async executeApiCall(operationName, apiCallFn) {  
    try {  
      return await apiCallFn();  
    } catch (error) {  
      this.logger.error(`Error ${operationName}:`, error);  
      throw new Error(`OpenAI ${operationName} error: ${error.message}`);  
    }  
  }  
}  

/**  
 * Service for chat and completion related OpenAI features  
 */  
class ChatService extends BaseOpenAiService {  
  /**  
   * Generate a chat completion  
   * @param {Object} params - Chat completion parameters  
   * @param {Array<Object>} params.messages - Array of message objects  
   * @param {string} [params.model='gpt-4o'] - Model to use  
   * @param {number} [params.temperature=0.7] - Sampling temperature  
   * @param {number} [params.maxTokens] - Maximum tokens to generate  
   * @param {number} [params.topP=1] - Nucleus sampling parameter  
   * @param {number} [params.frequencyPenalty=0] - Frequency penalty  
   * @param {number} [params.presencePenalty=0] - Presence penalty  
   * @param {Array<string>} [params.stop] - Stop sequences  
   * @returns {Promise<Object>} Chat completion response  
   */  
  async createChatCompletion({  
    messages,  
    model = 'gpt-4o',  
    temperature = 0.7,  
    maxTokens,  
    topP = 1,  
    frequencyPenalty = 0,  
    presencePenalty = 0,  
    stop  
  }) {  
    return this.executeApiCall('creating chat completion', async () => {  
      const response = await this.client.chat.completions.create({  
        model,  
        messages,  
        temperature,  
        max_tokens: maxTokens,  
        top_p: topP,  
        frequency_penalty: frequencyPenalty,  
        presence_penalty: presencePenalty,  
        stop  
      });  
      
      return response;  
    });  
  }  

  /**  
   * Generate a chat completion with streaming  
   * @param {Object} params - Chat completion parameters  
   * @param {function} onChunk - Callback for each chunk received  
   * @returns {Promise<void>} Completes when stream ends  
   */  
  async streamChatCompletion({  
    messages,  
    model = 'gpt-4o',  
    temperature = 0.7,  
    maxTokens,  
    onChunk  
  }) {  
    return this.executeApiCall('streaming chat completion', async () => {  
      const stream = await this.client.chat.completions.create({  
        model,  
        messages,  
        temperature,  
        max_tokens: maxTokens,  
        stream: true  
      });  
      
      for await (const chunk of stream) {  
        if (onChunk && chunk.choices[0]?.delta?.content) {  
          onChunk(chunk.choices[0].delta.content);  
        }  
      }  
    });  
  }  

  /**  
   * Generate text completion from a prompt  
   * @param {Object} params - Completion parameters  
   * @param {string} params.prompt - Text prompt  
   * @param {string} [params.model='gpt-4o'] - Model to use  
   * @returns {Promise<string>} Generated text  
   */  
  async generateCompletion({ prompt, model = 'gpt-4o', maxTokens = 1000, temperature = 0.7 }) {  
    return this.executeApiCall('generating completion', async () => {  
      const response = await this.createChatCompletion({  
        messages: [{ role: 'user', content: prompt }],  
        model,  
        maxTokens,  
        temperature  
      });  
      
      return response.choices[0].message.content;  
    });  
  }  
  
  /**  
   * Create conversation summary  
   * @param {Object} params - Summary parameters  
   * @param {Array<Object>} params.messages - Conversation messages  
   * @param {number} [params.maxLength=100] - Maximum summary length  
   * @returns {Promise<string>} Conversation summary  
   */  
  async summarizeConversation({ messages, maxLength = 100 }) {  
    return this.executeApiCall('summarizing conversation', async () => {  
      const prompt = `Summarize the following conversation in ${maxLength} words or less:\n\n` +   
        messages.map(m => `${m.role}: ${m.content}`).join('\n');  
      
      return this.generateCompletion({ prompt });  
    });  
  }  

  /**  
   * Classify text into categories  
   * @param {Object} params - Classification parameters  
   * @param {string} params.text - Text to classify  
   * @param {Array<string>} params.categories - Possible categories  
   * @returns {Promise<string>} Best matching category  
   */  
  async classifyText({ text, categories }) {  
    return this.executeApiCall('classifying text', async () => {  
      const categoriesText = categories.join(', ');  
      const prompt = `Classify the following text into exactly one of these categories: ${categoriesText}.\n\nText: "${text}"\n\nCategory:`;  
      
      return this.generateCompletion({ prompt, temperature: 0.3 });  
    });  
  }  
}  

/**  
 * Service for image-related OpenAI features  
 */  
class ImageService extends BaseOpenAiService {  
  /**  
   * Generate image from text prompt  
   * @param {Object} params - Image generation parameters  
   * @param {string} params.prompt - Text description of the image  
   * @param {string} [params.size='1024x1024'] - Image size  
   * @param {number} [params.n=1] - Number of images to generate  
   * @param {string} [params.style='vivid'] - Image style: 'vivid' or 'natural'  
   * @param {string} [params.quality='standard'] - Image quality: 'standard' or 'hd'  
   * @returns {Promise<Array<string>>} Array of image URLs  
   */  
  async generateImage({  
    prompt,  
    size = '1024x1024',  
    n = 1,  
    style = 'vivid',  
    quality = 'standard'  
  }) {  
    return this.executeApiCall('generating image', async () => {  
      const response = await this.client.images.generate({  
        prompt,  
        n,  
        size,  
        style,  
        quality  
      });  
      
      return response.data.map(image => image.url);  
    });  
  }  

  /**  
   * Create image variation  
   * @param {Object} params - Variation parameters  
   * @param {string} params.imagePath - Path to image file  
   * @param {number} [params.n=1] - Number of variations to generate  
   * @param {string} [params.size='1024x1024'] - Image size  
   * @returns {Promise<Array<string>>} Array of image URLs  
   */  
  async createImageVariation({ imagePath, n = 1, size = '1024x1024' }) {  
    return this.executeApiCall('creating image variation', async () => {  
      const imageBuffer = await fs.readFile(imagePath);  
      const fileName = path.basename(imagePath);  
      
      const response = await this.client.images.createVariation({  
        image: new File([imageBuffer], fileName),  
        n,  
        size  
      });  
      
      return response.data.map(image => image.url);  
    });  
  }  

  /**  
   * Edit an image with a mask  
   * @param {Object} params - Edit parameters  
   * @param {string} params.imagePath - Path to image file  
   * @param {string} params.maskPath - Path to mask file  
   * @param {string} params.prompt - Instruction for editing  
   * @param {number} [params.n=1] - Number of results  
   * @returns {Promise<Array<string>>} Array of image URLs  
   */  
  async editImage({ imagePath, maskPath, prompt, n = 1, size = '1024x1024' }) {  
    return this.executeApiCall('editing image', async () => {  
      const imageBuffer = await fs.readFile(imagePath);  
      const maskBuffer = await fs.readFile(maskPath);  
      const imageName = path.basename(imagePath);  
      const maskName = path.basename(maskPath);  
      
      const response = await this.client.images.edit({  
        image: new File([imageBuffer], imageName),  
        mask: new File([maskBuffer], maskName),  
        prompt,  
        n,  
        size  
      });  
      
      return response.data.map(image => image.url);  
    });  
  }  
  
  /**  
   * Download generated image to local file  
   * @param {Object} params - Download parameters  
   * @param {string} params.imageUrl - URL of image to download  
   * @param {string} params.outputPath - Path to save image to  
   * @returns {Promise<string>} Path to saved image  
   */  
  async downloadImage({ imageUrl, outputPath }) {  
    return this.executeApiCall('downloading image', async () => {  
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });  
      await fs.writeFile(outputPath, Buffer.from(response.data));  
      return outputPath;  
    });  
  }  
}  

/**  
 * Service for audio-related OpenAI features  
 */  
class AudioService extends BaseOpenAiService {  
  /**  
   * Transcribe audio to text  
   * @param {Object} params - Transcription parameters  
   * @param {string} params.audioFilePath - Path to audio file  
   * @param {string} [params.language] - Optional language code  
   * @param {string} [params.prompt] - Optional prompt to guide transcription  
   * @returns {Promise<string>} Transcribed text  
   */  
  async transcribeAudio({ audioFilePath, language, prompt }) {  
    return this.executeApiCall('transcribing audio', async () => {  
      const fileBuffer = await fs.readFile(audioFilePath);  
      const fileName = path.basename(audioFilePath);  
      
      const response = await this.client.audio.transcriptions.create({  
        file: new File([fileBuffer], fileName),  
        model: 'whisper-1',  
        language,  
        prompt  
      });  
      
      return response.text;  
    });  
  }  

  /**  
   * Translate audio directly to English  
   * @param {Object} params - Translation parameters  
   * @param {string} params.audioFilePath - Path to audio file  
   * @param {string} [params.prompt] - Optional prompt to guide translation  
   * @returns {Promise<string>} Translated text in English  
   */  
  async translateAudio({ audioFilePath, prompt }) {  
    return this.executeApiCall('translating audio', async () => {  
      const fileBuffer = await fs.readFile(audioFilePath);  
      const fileName = path.basename(audioFilePath);  
      
      const response = await this.client.audio.translations.create({  
        file: new File([fileBuffer], fileName),  
        model: 'whisper-1',  
        prompt  
      });  
      
      return response.text;  
    });  
  }  
  
  /**  
   * Generate speech from text  
   * @param {Object} params - Text-to-speech parameters  
   * @param {string} params.text - Text to convert to speech  
   * @param {string} [params.voice='alloy'] - Voice to use  
   * @param {string} [params.model='tts-1'] - Model to use  
   * @param {string} [params.outputPath] - Optional path to save audio  
   * @returns {Promise<ArrayBuffer|string>} Audio buffer or path to saved file  
   */  
  async generateSpeech({ text, voice = 'alloy', model = 'tts-1', outputPath }) {  
    return this.executeApiCall('generating speech', async () => {  
      const response = await this.client.audio.speech.create({  
        input: text,  
        voice,  
        model  
      });  
      
      const buffer = await response.arrayBuffer();  
      
      if (outputPath) {  
        await fs.writeFile(outputPath, Buffer.from(buffer));  
        return outputPath;  
      }  
      
      return buffer;  
    });  
  }  
}  

/**  
 * Service for embeddings and vector operations  
 */  
class EmbeddingService extends BaseOpenAiService {  
  /**  
   * Create embeddings for text  
   * @param {Object} params - Embedding parameters  
   * @param {string|string[]} params.input - Text to embed  
   * @param {string} [params.model='text-embedding-3-small'] - Embedding model  
   * @param {string} [params.dimensions] - Optional dimensions to request  
   * @returns {Promise<number[][]>} Vector embeddings  
   */  
  async createEmbeddings({ input, model = 'text-embedding-3-small', dimensions }) {  
    return this.executeApiCall('creating embeddings', async () => {  
      const response = await this.client.embeddings.create({  
        input,  
        model,  
        dimensions  
      });  
      
      return response.data.map(item => item.embedding);  
    });  
  }  
  
  /**  
   * Calculate cosine similarity between vectors  
   * @param {Object} params - Similarity parameters  
   * @param {number[]} params.vector1 - First vector  
   * @param {number[]} params.vector2 - Second vector  
   * @returns {Promise<number>} Similarity score between 0 and 1  
   */  
  async calculateSimilarity({ vector1, vector2 }) {  
    return this.executeApiCall('calculating similarity', async () => {  
      if (vector1.length !== vector2.length) {  
        throw new Error('Vectors must have the same dimensions');  
      }  
      
      let dotProduct = 0;  
      let magnitude1 = 0;  
      let magnitude2 = 0;  
      
      for (let i = 0; i < vector1.length; i++) {  
        dotProduct += vector1[i] * vector2[i];  
        magnitude1 += vector1[i] * vector1[i];  
        magnitude2 += vector2[i] * vector2[i];  
      }  
      
      magnitude1 = Math.sqrt(magnitude1);  
      magnitude2 = Math.sqrt(magnitude2);  
      
      return dotProduct / (magnitude1 * magnitude2);  
    });  
  }  
  
  /**  
   * Find most similar texts to a query  
   * @param {Object} params - Search parameters  
   * @param {string} params.query - Query text  
   * @param {string[]} params.texts - Array of texts to search  
   * @param {string} [params.model='text-embedding-3-small'] - Embedding model  
   * @param {number} [params.topK=5] - Number of results to return  
   * @returns {Promise<Array<{text: string, score: number}>>} Top matches  
   */  
  async findSimilarTexts({ query, texts, model = 'text-embedding-3-small', topK = 5 }) {  
    return this.executeApiCall('finding similar texts', async () => {  
      // Get embeddings for query and all texts  
      const [queryEmbedding] = await this.createEmbeddings({  
        input: query,  
        model  
      });  
      
      const textEmbeddings = await this.createEmbeddings({  
        input: texts,  
        model  
      });  
      
      // Calculate similarities  
      const similarities = await Promise.all(  
        textEmbeddings.map((embedding, index) =>   
          this.calculateSimilarity({  
            vector1: queryEmbedding,  
            vector2: embedding  
          }).then(score => ({ text: texts[index], score }))  
        )  
      );  
      
      // Sort by similarity and return top K  
      return similarities  
        .sort((a, b) => b.score - a.score)  
        .slice(0, topK);  
    });  
  }  
}  

/**  
 * Service for moderation and content filtering  
 */  
class ModerationService extends BaseOpenAiService {  
  /**  
   * Check if content violates OpenAI's content policy  
   * @param {Object} params - Moderation parameters  
   * @param {string|string[]} params.input - Text to check  
   * @param {string} [params.model='text-moderation-latest'] - Model to use  
   * @returns {Promise<Object>} Moderation results  
   */  
  async moderateContent({ input, model = 'text-moderation-latest' }) {  
    return this.executeApiCall('moderating content', async () => {  
      const response = await this.client.moderations.create({  
        input,  
        model  
      });  
      
      return response.results;  
    });  
  }  
  
  /**  
   * Check if content is safe (convenience wrapper)  
   * @param {Object} params - Safety check parameters  
   * @param {string} params.text - Text to check  
   * @returns {Promise<{safe: boolean, categories: Object}>} Safety assessment  
   */  
  async isSafeContent({ text }) {  
    return this.executeApiCall('checking content safety', async () => {  
      const [result] = await this.moderateContent({ input: text });  
      
      return {  
        safe: !result.flagged,  
        categories: result.categories  
      };  
    });  
  }  
}  

/**  
 * Service for fine-tuning models  
 */  
class FineTuningService extends BaseOpenAiService {  
  /**  
   * Create a fine-tuning job  
   * @param {Object} params - Fine-tuning parameters  
   * @param {string} params.trainingFileId - File ID for training data  
   * @param {string} [params.validationFileId] - File ID for validation data  
   * @param {string} [params.baseModel='gpt-3.5-turbo'] - Base model to fine-tune  
   * @param {number} [params.epochs] - Number of epochs to train for  
   * @returns {Promise<Object>} Fine-tuning job details  
   */  
  async createFineTuningJob({  
    trainingFileId,  
    validationFileId,  
    baseModel = 'gpt-3.5-turbo',  
    epochs  
  }) {  
    return this.executeApiCall('creating fine-tuning job', async () => {  
      const params = {  
        training_file: trainingFileId,  
        model: baseModel  
      };  
      
      if (validationFileId) params.validation_file = validationFileId;  
      if (epochs) params.hyperparameters = { n_epochs: epochs };  
      
      return await this.client.fineTuning.jobs.create(params);  
    });  
  }  

  /**  
   * Retrieve fine-tuning job status  
   * @param {Object} params - Job status parameters  
   * @param {string} params.jobId - Fine-tuning job ID  
   * @returns {Promise<Object>} Job status  
   */  
  async getFineTuningJob({ jobId }) {  
    return this.executeApiCall('retrieving fine-tuning job', async () => {  
      return await this.client.fineTuning.jobs.retrieve(jobId);  
    });  
  }  
  
  /**  
   * List all fine-tuning jobs  
   * @returns {Promise<Array<Object>>} List of jobs  
   */  
  async listFineTuningJobs() {  
    return this.executeApiCall('listing fine-tuning jobs', async () => {  
      const response = await this.client.fineTuning.jobs.list();  
      return response.data;  
    });  
  }  
  
  /**  
   * Cancel a fine-tuning job  
   * @param {Object} params - Cancellation parameters  
   * @param {string} params.jobId - Fine-tuning job ID to cancel  
   * @returns {Promise<Object>} Cancelled job details  
   */  
  async cancelFineTuningJob({ jobId }) {  
    return this.executeApiCall('cancelling fine-tuning job', async () => {  
      return await this.client.fineTuning.jobs.cancel(jobId);  
    });  
  }  
}  

/**  
 * Service for file management  
 */  
class FileService extends BaseOpenAiService {  
  /**  
   * Upload a file to OpenAI  
   * @param {Object} params - Upload parameters  
   * @param {string} params.filePath - Path to file  
   * @param {string} params.purpose - Purpose of file  
   * @returns {Promise<Object>} Uploaded file info  
   */  
  async uploadFile({ filePath, purpose }) {  
    return this.executeApiCall('uploading file', async () => {  
      const fileBuffer = await fs.readFile(filePath);  
      const fileName = path.basename(filePath);  
      
      const response = await this.client.files.create({  
        file: new File([fileBuffer], fileName),  
        purpose  
      });  
      
      return response;  
    });  
  }  

  /**  
   * List all files  
   * @param {Object} [params] - List parameters  
   * @param {string} [params.purpose] - Filter by purpose  
   * @returns {Promise<Array<Object>>} List of files  
   */  
  async listFiles({ purpose } = {}) {  
    return this.executeApiCall('listing files', async () => {  
      const response = await this.client.files.list({ purpose });  
      return response.data;  
    });  
  }  

  /**  
   * Delete a file  
   * @param {Object} params - Deletion parameters  
   * @param {string} params.fileId - ID of file to delete  
   * @returns {Promise<Object>} Deletion status  
   */  
  async deleteFile({ fileId }) {  
    return this.executeApiCall('deleting file', async () => {  
      return await this.client.files.del(fileId);  
    });  
  }  
  
  /**  
   * Retrieve file content  
   * @param {Object} params - Retrieval parameters  
   * @param {string} params.fileId - ID of file to retrieve  
   * @returns {Promise<string>} File content  
   */  
  async retrieveFileContent({ fileId }) {  
    return this.executeApiCall('retrieving file content', async () => {  
      const response = await this.client.files.content(fileId);  
      return await response.text();  
    });  
  }  
}  

/**  
 * Service for Assistants API  
 */  
class AssistantService extends BaseOpenAiService {  
  /**  
   * Create an assistant  
   * @param {Object} params - Assistant parameters  
   * @param {string} params.name - Assistant name  
   * @param {string} params.instructions - Instructions for the assistant  
   * @param {string} [params.model='gpt-4o'] - Model to use  
   * @param {string[]} [params.tools] - Tools to enable  
   * @returns {Promise<Object>} Created assistant  
   */  
  async createAssistant({  
    name,  
    instructions,  
    model = 'gpt-4o',  
    tools = []  
  }) {  
    return this.executeApiCall('creating assistant', async () => {  
      return await this.client.beta.assistants.create({  
        name,  
        instructions,  
        model,  
        tools  
      });  
    });  
  }  

  /**  
   * Create a thread  
   * @param {Object} [params] - Thread parameters  
   * @param {Array<Object>} [params.messages] - Initial messages  
   * @returns {Promise<Object>} Created thread  
   */  
  async createThread({ messages } = {}) {  
    return this.executeApiCall('creating thread', async () => {  
      return await this.client.beta.threads.create({  
        messages  
      });  
    });  
  }  

  /**  
   * Add a message to a thread  
   * @param {Object} params - Message parameters  
   * @param {string} params.threadId - Thread ID  
   * @param {string} params.content - Message content  
   * @param {string} [params.role='user'] - Message role  
   * @returns {Promise<Object>} Created message  
   */  
  async addMessage({  
    threadId,  
    content,  
    role = 'user'  
  }) {  
    return this.executeApiCall('adding message', async () => {  
      return await this.client.beta.threads.messages.create(  
        threadId,  
        {  
          role,  
          content  
        }  
      );  
    });  
  }  

  /**  
   * Run an assistant on a thread  
   * @param {Object} params - Run parameters  
   * @param {string} params.threadId - Thread ID  
   * @param {string} params.assistantId - Assistant ID  
   * @param {string} [params.instructions] - Override instructions  
   * @returns {Promise<Object>} Created run  
   */  
  async runAssistant({  
    threadId,  
    assistantId,  
    instructions  
  }) {  
    return this.executeApiCall('running assistant', async () => {  
      return await this.client.beta.threads.runs.create(  
        threadId,  
        {  
          assistant_id: assistantId,  
          instructions  
        }  
      );  
    });  
  }  

  /**  
   * Get the status of a run  
   * @param {Object} params - Status parameters  
   * @param {string} params.threadId - Thread ID  
   * @param {string} params.runId - Run ID  
   * @returns {Promise<Object>} Run status  
   */  
  async getRunStatus({  
    threadId,  
    runId  
  }) {  
    return this.executeApiCall('getting run status', async () => {  
      return await this.client.beta.threads.runs.retrieve(  
        threadId,  
        runId  
      );  
    });  
  }  

  /**  
   * List messages from a thread  
   * @param {Object} params - List parameters  
   * @param {string} params.threadId - Thread ID  
   * @param {Object} [params.options] - Pagination options  
   * @returns {Promise<Array<Object>>} Thread messages  
   */  
  async listMessages({  
    threadId,  
    options = {}  
  }) {  
    return this.executeApiCall('listing messages', async () => {  
      const response = await this.client.beta.threads.messages.list(  
        threadId,  
        options  
      );  
      return response.data;  
    });  
  }  
}  

/**  
 * Comprehensive OpenAI service that combines all specialized services  
 */  
class ComprehensiveOpenAiService {  
  /**  
   * Creates a new comprehensive OpenAI service  
   * @param {Object} config - Configuration options  
   */  
  constructor(config) {  
    // Initialize specialized services  
    this.chat = new ChatService(config);  
    this.image = new ImageService(config);  
    this.audio = new AudioService(config);  
    this.embedding = new EmbeddingService(config);  
    this.moderation = new ModerationService(config);  
    this.fineTuning = new FineTuningService(config);  
    this.file = new FileService(config);  
    this.assistant = new AssistantService(config);  
    
    // Store common references  
    this.client = this.chat.client;  
    this.logger = this.chat.logger;  
  }  
  
  /**  
   * One-shot text generation  
   * @param {string} prompt - Text prompt  
   * @returns {Promise<string>} Generated text  
   */  
  async quickGenerate(prompt) {  
    return this.chat.generateCompletion({ prompt });  
  }  
  
  /**  
   * One-shot image generation  
   * @param {string} prompt - Image description  
   * @returns {Promise<string>} Image URL  
   */  
  async quickImage(prompt) {  
    const urls = await this.image.generateImage({ prompt });  
    return urls[0];  
  }  
  
  /**  
   * Process a document with text and image generation  
   * @param {Object} params - Document processing parameters  
   * @param {string} params.text - Input text  
   * @param {string} [params.imagePrompt] - Optional image prompt  
   * @returns {Promise<Object>} Processed document with text and optional image  
   */  
  async processDocument({ text, imagePrompt }) {  
    const summary = await this.chat.generateCompletion({  
      prompt: `Summarize the following text: ${text}`,  
      maxTokens: 300  
    });  
    
    const result = { summary };  
    
    if (imagePrompt) {  
      const [imageUrl] = await this.image.generateImage({ prompt: imagePrompt });  
      result.imageUrl = imageUrl;  
    }  
    
    return result;  
  }  
  
  /**  
   * Check if content is safe and moderate it if needed  
   * @param {Object} params - Moderation parameters  
   * @param {string} params.content - Content to check  
   * @param {boolean} [params.autoModerate=false] - Whether to automatically rewrite unsafe content  
   * @returns {Promise<Object>} Moderation results  
   */  
  async moderateIfNeeded({ content, autoModerate = false }) {  
    const safetyCheck = await this.moderation.isSafeContent({ text: content });  
    
    if (safetyCheck.safe || !autoModerate) {  
      return {  
        original: content,  
        safe: safetyCheck.safe,  
        moderated: safetyCheck.safe ? content : null,  
        categories: safetyCheck.categories  
      };  
    }  
    
    // Auto-moderate by rewriting  
    const prompt = `Rewrite the following text to remove any inappropriate content, keeping the original meaning as much as possible: "${content}"`;  
    const moderated = await this.chat.generateCompletion({ prompt });  
    
    return {  
      original: content,  
      safe: false,  
      moderated,  
      categories: safetyCheck.categories  
    };  
  }  
}  

module.exports = {  
  BaseOpenAiService,  
  ChatService,  
  ImageService,  
  AudioService,  
  EmbeddingService,  
  ModerationService,  
  FineTuningService,  
  FileService,  
  AssistantService,  
  ComprehensiveOpenAiService  
};