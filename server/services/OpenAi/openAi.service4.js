const axios = require('axios');

//GPT-o3-mini-high
class OpenAIService4 {
  /**
   * Constructs an instance of OpenAIService.
   * @param {string} apiKey - Your OpenAI API key.
   */
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.OPEN_AI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Sends a chat completion request to OpenAI.
   * @param {string} prompt - The user prompt.
   * @returns {Promise<Object>} - The API response.
   */
  async chat(prompt) {
    const data = {
      model: 'gpt-4', // or any other model you prefer
      messages: [{ role: 'user', content: prompt }]
    };
    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, data, { headers: this.headers });
      return response.data;
    } catch (error) {
      throw new Error(`Chat error: ${error.message}`);
    }
  }

  /**
   * Summarizes a given text.
   * @param {string} text - The text to summarize.
   * @returns {Promise<Object>} - The summarized output.
   */
  async summarize(text) {
    const prompt = `Please provide a concise summary for the following text:\n\n${text}`;
    return await this.chat(prompt);
  }

  /**
   * Translates a given text to a specified language.
   * @param {string} text - The text to translate.
   * @param {string} targetLanguage - The target language (default is Spanish).
   * @returns {Promise<Object>} - The translated text.
   */
  async translate(text, targetLanguage = 'Spanish') {
    const prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;
    return await this.chat(prompt);
  }

  /**
   * Generates code based on a description.
   * @param {string} description - The code description.
   * @returns {Promise<Object>} - The generated code snippet.
   */
  async generateCode(description) {
    const prompt = `Generate a code snippet based on the following description:\n\n${description}`;
    return await this.chat(prompt);
  }

  /**
   * Generates creative content like stories or poems.
   * @param {string} promptText - The creative prompt.
   * @returns {Promise<Object>} - The creative output.
   */
  async creativeWriting(promptText) {
    const prompt = `Write a creative story or poem based on the following prompt:\n\n${promptText}`;
    return await this.chat(prompt);
  }

  /**
   * Analyzes and debugs a given code snippet.
   * @param {string} codeSnippet - The code to debug.
   * @returns {Promise<Object>} - The analysis and debugging suggestions.
   */
  async debugCode(codeSnippet) {
    const prompt = `Analyze the following code snippet for errors and suggest improvements:\n\n${codeSnippet}`;
    return await this.chat(prompt);
  }

  /**
   * Answers a given question in a detailed manner.
   * @param {string} question - The question to answer.
   * @returns {Promise<Object>} - The detailed answer.
   */
  async answerQuestion(question) {
    const prompt = `Answer the following question in detail:\n\n${question}`;
    return await this.chat(prompt);
  }

  /**
   * Provides a basic data analysis plan for the described data.
   * @param {string} dataDescription - Description of the data.
   * @returns {Promise<Object>} - The data analysis plan.
   */
  async analyzeData(dataDescription) {
    const prompt = `Provide a data analysis plan for the following data description:\n\n${dataDescription}`;
    return await this.chat(prompt);
  }

  /**
   * Simulates calling a specific function with parameters.
   * This demonstrates how you might integrate function-calling features.
   * @param {string} functionName - The function name to call.
   * @param {Object} parameters - The parameters for the function.
   * @returns {Promise<Object>} - The simulated function call result.
   */
  async callFunction(functionName, parameters) {
    const prompt = `Simulate calling the function "${functionName}" with parameters: ${JSON.stringify(parameters)}. Provide the result.`;
    return await this.chat(prompt);
  }
}

module.exports = OpenAIService4;
