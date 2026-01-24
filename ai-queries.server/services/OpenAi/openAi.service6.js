/**********************************************
 * OpenAIService - Node.js class using Axios 
 * for raw HTTP requests to OpenAI API
 **********************************************/
const axios = require('axios');


// GPT-o1
class OpenAIService {
  /**
   * Constructor for the OpenAIService class
   * @param {string} apiKey - Your OpenAI API key
   * @param {string} organization - (optional) Your OpenAI organization ID
   * @param {string} baseUrl - (optional) Override base URL (e.g., Azure endpoint)
   */
  constructor(apiKey = process.env.OPENAI_API_KEY, organization = null, baseUrl = 'https://api.openai.com/v1') {
    if (!apiKey) {
      throw new Error('OpenAI API key is required.');
    }
    
    this.apiKey = apiKey;
    this.organization = organization;
    this.baseUrl = baseUrl;

    // Create an Axios instance with default settings
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: this._getDefaultHeaders(),
    });

    // Optionally handle request/response interceptors if needed
    this.client.interceptors.request.use(
      (config) => {
        // You can add logging or other custom logic here
        // e.g., console.log('Request:', config);
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        // Optionally handle successes
        return response;
      },
      (error) => {
        // Optionally handle errors in a centralized place
        // e.g., log them or transform the error object
        return Promise.reject(error);
      }
    );
  }

  /**
   * Build default headers used for every request
   */
  _getDefaultHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
    // If an organization ID is provided, attach it
    if (this.organization) {
      headers['OpenAI-Organization'] = this.organization;
    }
    return headers;
  }

  /**
   * [1] CREATE COMPLETION (text-davinci-003 or other GPT-3 model)
   * @param {Object} params - The request body params per OpenAI documentation
   *   Example:
   *   {
   *     model: "text-davinci-003",
   *     prompt: "Say this is a test",
   *     max_tokens: 100
   *   }
   */
  async createCompletion(params) {
    try {
      const response = await this.client.post('/completions', params);
      return response.data; // includes choices, usage, etc.
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [2] CREATE CHAT COMPLETION (gpt-3.5-turbo, gpt-4, etc.)
   * @param {Object} params - The request body params (per Chat Completion docs)
   *   Example:
   *   {
   *     model: "gpt-3.5-turbo",
   *     messages: [{ role: "user", content: "Hello!" }]
   *   }
   */
  async createChatCompletion(params) {
    try {
      const response = await this.client.post('/chat/completions', params);
      return response.data; // includes choices, usage, etc.
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [3] CREATE EMBEDDING
   * @param {Object} params - The request body params
   *   Example:
   *   {
   *     model: "text-embedding-ada-002",
   *     input: "Hello world"
   *   }
   */
  async createEmbedding(params) {
    try {
      const response = await this.client.post('/embeddings', params);
      return response.data; // includes embedding vectors, usage, etc.
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [4] CREATE IMAGE (DALL·E)
   * @param {Object} params - The request body params
   *   Example:
   *   {
   *     prompt: "A cute baby sea otter",
   *     n: 1,
   *     size: "1024x1024"
   *   }
   */
  async createImage(params) {
    try {
      const response = await this.client.post('/images/generations', params);
      return response.data; // includes data array of image URLs or Base64
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [5] CREATE IMAGE EDIT
   *   This endpoint is for editing an existing image
   *   (requires form-data with image, mask, prompt, etc.)
   *   Example usage:
   *     service.createImageEdit({
   *       image: fs.createReadStream('./image.png'),
   *       mask: fs.createReadStream('./mask.png'),
   *       prompt: 'Change the background color to blue',
   *       n: 1,
   *       size: '1024x1024'
   *     })
   */
  async createImageEdit(formData) {
    try {
      // Notice we override headers for multipart/form-data
      const response = await this.client.post('/images/edits', formData, {
        headers: {
          ...this._getDefaultHeaders(),
          ...formData.getHeaders(),
        },
      });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [6] CREATE IMAGE VARIATION
   *   Creates variations of a given image
   */
  async createImageVariation(formData) {
    try {
      const response = await this.client.post('/images/variations', formData, {
        headers: {
          ...this._getDefaultHeaders(),
          ...formData.getHeaders(),
        },
      });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [7] CREATE MODERATION - for content filtering
   * @param {Object} params - The request body, e.g. { input: "user text to moderate" }
   */
  async createModeration(params) {
    try {
      const response = await this.client.post('/moderations', params);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [8] CREATE TRANSCRIPTION (Whisper ASR)
   *  This requires a multipart/form-data request with audio file
   *  example formData:
   *   {
   *     file: fs.createReadStream('./audio.mp3'),
   *     model: 'whisper-1'
   *   }
   */
  async createTranscription(formData) {
    try {
      const response = await this.client.post('/audio/transcriptions', formData, {
        headers: {
          ...this._getDefaultHeaders(),
          ...formData.getHeaders(),
        },
      });
      return response.data; // includes { text: "...transcribed text..." }
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [9] CREATE TRANSLATION (Whisper-based translation)
   *  This requires multipart/form-data as well
   */
  async createTranslation(formData) {
    try {
      const response = await this.client.post('/audio/translations', formData, {
        headers: {
          ...this._getDefaultHeaders(),
          ...formData.getHeaders(),
        },
      });
      return response.data; // includes { text: "...translated text..." }
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [10] CREATE EDIT (Edits endpoint for text)
   * @param {Object} params - e.g. { model: "text-davinci-edit-001", input: "", instruction: "Fix the grammar" }
   */
  async createEdit(params) {
    try {
      const response = await this.client.post('/edits', params);
      return response.data; // includes edited text
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [11] FINE-TUNE A MODEL
   * @param {Object} params - e.g. { training_file: "file-abc123", model: "davinci" }
   */
  async createFineTune(params) {
    try {
      const response = await this.client.post('/fine-tunes', params);
      return response.data; 
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [12] LIST FINE-TUNES
   */
  async listFineTunes() {
    try {
      const response = await this.client.get('/fine-tunes');
      return response.data; 
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [13] RETRIEVE A FINE-TUNE
   * @param {string} fineTuneId - ID of the fine-tune job
   */
  async retrieveFineTune(fineTuneId) {
    try {
      const response = await this.client.get(`/fine-tunes/${fineTuneId}`);
      return response.data; 
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [14] CANCEL A FINE-TUNE
   * @param {string} fineTuneId - ID of the fine-tune job
   */
  async cancelFineTune(fineTuneId) {
    try {
      const response = await this.client.post(`/fine-tunes/${fineTuneId}/cancel`);
      return response.data; 
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [15] LIST FILES
   */
  async listFiles() {
    try {
      const response = await this.client.get('/files');
      return response.data; 
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [16] UPLOAD FILE
   *   This requires multipart/form-data.
   *   Example formData fields:
   *   {
   *     file: fs.createReadStream('./training_data.jsonl'),
   *     purpose: 'fine-tune'
   *   }
   */
  async uploadFile(formData) {
    try {
      const response = await this.client.post('/files', formData, {
        headers: {
          ...this._getDefaultHeaders(),
          ...formData.getHeaders(),
        },
      });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [17] DELETE FILE
   * @param {string} fileId - The file ID
   */
  async deleteFile(fileId) {
    try {
      const response = await this.client.delete(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [18] RETRIEVE FILE
   * @param {string} fileId - The file ID
   */
  async retrieveFile(fileId) {
    try {
      const response = await this.client.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [19] LIST MODELS
   */
  async listModels() {
    try {
      const response = await this.client.get('/models');
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * [20] RETRIEVE MODEL
   * @param {string} modelName - e.g. "gpt-3.5-turbo"
   */
  async retrieveModel(modelName) {
    try {
      const response = await this.client.get(`/models/${modelName}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Helper method to handle errors in a consistent manner
   */
  _handleError(error) {
    // Check if it's an Axios error with a response
    if (error.response) {
      console.error(`OpenAI API Error (Status ${error.response.status}):`, error.response.data);
      throw new Error(`OpenAI API Error: ${JSON.stringify(error.response.data)}`);
    } else {
      // Some other error (request never made it, or other issues)
      console.error('Network / Axios Error:', error.message);
      throw error;
    }
  }
}

module.exports = OpenAIService;


/*********************** 1. Example - How to Use the Service: ****************************************************************************/

//Instantiate the service with your API key:
//const OpenAIService = require('./OpenAIService');

// Example: Instantiating with environment variable or direct string
//const openai = new OpenAIService(process.env.OPENAI_API_KEY);


//2. Call any method to interact with the API. For example, generating a simple text completion:
// (async () => {
//   try {
//     const completion = await openai.createCompletion({
//       model: 'text-davinci-003',
//       prompt: 'Write a short poem about the sun',
//       max_tokens: 50
//     });
//     console.log('Completion:', completion.choices[0].text);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// })();

//3. Chat completion (gpt-3.5-turbo, gpt-4, etc.):
//(async () => {
//   try {
//     const chatResponse = await openai.createChatCompletion({
//       model: 'gpt-3.5-turbo',
//       messages: [{ role: 'user', content: 'Hello, how are you?' }]
//     });
//     console.log('Chat Completion:', chatResponse.choices[0].message.content);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// })();

//4.Embeddings:
// (async () => {
//   try {
//     const embeddingResult = await openai.createEmbedding({
//       model: 'text-embedding-ada-002',
//       input: 'Hello world'
//     });
//     console.log('Embedding:', embeddingResult.data[0].embedding);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// })();

//5. Image generation (DALL·E):
// (async () => {
//   try {
//     const imageResult = await openai.createImage({
//       prompt: 'A surreal painting of a tree made of galaxies',
//       n: 1,
//       size: '512x512'
//     });
//     console.log('Image Data:', imageResult.data);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// })();