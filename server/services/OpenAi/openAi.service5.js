const { OpenAI } = require('openai');

// by Deepseel-R1
class OpenAIService5 {
  constructor(apiKey = process.env.OPENAI_API_KEY) {
    if (!apiKey) throw new Error('API key is required');
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Generate text completion
   * @param {string} prompt 
   * @param {Object} options 
   * @returns {Promise<string>}
   */
  async createCompletion(prompt, options = {}) {
    try {
      const completion = await this.client.completions.create({
        model: options.model || 'text-davinci-003',
        prompt,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        ...options
      });
      return completion.choices[0].text.trim();
    } catch (error) {
      throw new Error(`Completion error: ${error.message}`);
    }
  }

  /**
   * Create chat completion with messages
   * @param {Array} messages 
   * @param {Object} options 
   * @returns {Promise<string>}
   */
  async createChatCompletion(messages, options = {}) {
    try {
      const chatCompletion = await this.client.chat.completions.create({
        model: options.model || 'gpt-4',
        messages,
        temperature: options.temperature || 0.7,
        ...options
      });
      return chatCompletion.choices[0].message.content;
    } catch (error) {
      throw new Error(`Chat completion error: ${error.message}`);
    }
  }

  /**
   * Generate image from text prompt
   * @param {string} prompt 
   * @param {Object} options 
   * @returns {Promise<string>}
   */
  async generateImage(prompt, options = {}) {
    try {
      const response = await this.client.images.generate({
        prompt,
        n: options.n || 1,
        size: options.size || '1024x1024',
        response_format: 'url',
        ...options
      });
      return response.data[0].url;
    } catch (error) {
      throw new Error(`Image generation error: ${error.message}`);
    }
  }

  /**
   * Create embeddings from text
   * @param {string} input 
   * @param {Object} options 
   * @returns {Promise<Array>}
   */
  async createEmbedding(input, options = {}) {
    try {
      const response = await this.client.embeddings.create({
        input,
        model: options.model || 'text-embedding-ada-002',
        ...options
      });
      return response.data[0].embedding;
    } catch (error) {
      throw new Error(`Embedding error: ${error.message}`);
    }
  }

  /**
   * Moderate text content
   * @param {string} input 
   * @returns {Promise<Object>}
   */
  async moderateContent(input) {
    try {
      const response = await this.client.moderations.create({ input });
      return response.results[0];
    } catch (error) {
      throw new Error(`Moderation error: ${error.message}`);
    }
  }

  /**
   * Create fine-tuning job
   * @param {string} trainingFile 
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async createFineTuningJob(trainingFile, options = {}) {
    try {
      return await this.client.fineTuning.jobs.create({
        training_file: trainingFile,
        model: options.model || 'gpt-3.5-turbo',
        ...options
      });
    } catch (error) {
      throw new Error(`Fine-tuning error: ${error.message}`);
    }
  }

  /**
   * Upload file for fine-tuning
   * @param {Buffer} file 
   * @param {string} purpose 
   * @returns {Promise<Object>}
   */
  async uploadFile(file, purpose = 'fine-tune') {
    try {
      return await this.client.files.create({
        file,
        purpose
      });
    } catch (error) {
      throw new Error(`File upload error: ${error.message}`);
    }
  }

  /**
   * Create function-enabled chat completion
   * @param {Array} messages 
   * @param {Array} functions 
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async createFunctionChatCompletion(messages, functions, options = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || 'gpt-4',
        messages,
        functions,
        function_call: options.functionCall || 'auto',
        ...options
      });
      return response.choices[0];
    } catch (error) {
      throw new Error(`Function chat error: ${error.message}`);
    }
  }
}

module.exports = OpenAIService5;