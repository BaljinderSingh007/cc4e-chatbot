const axios = require('axios');

class ChatService {
  constructor() {
    this.apiEndpoint = 'http://localhost:8085/api/chat';
    this.requestTimeout = 60000; // Allow up to 60 seconds for MCP tool + LLM formatting
  }

  /**
   * Send message to chat API
   * @param {string} userMessage - The user's message
   * @param {string} sessionId - Session ID for context
   * @returns {Promise<string>} Bot response
   */
  async sendMessage(userMessage, sessionId) {
    try {
      if (!userMessage || userMessage.trim().length === 0) {
        throw new Error('User message cannot be empty');
      }

      if (userMessage.length > 2000) {
        throw new Error('Message is too long. Please keep it under 2000 characters.');
      }

      const response = await axios.post(
        this.apiEndpoint,
        userMessage.trim(),
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          },
          timeout: this.requestTimeout
        }
      );

      return response.data;
    } catch (error) {
      // Silently fail to fallback mode when server is not available
      throw this.handleError(error);
    }
  }

  /**
   * Clear chat session
   * @param {string} sessionId - Session ID to clear
   * @returns {Promise<void>}
   */
  async clearSession(sessionId) {
    try {
      // MCP client doesn't have session management, just return success
      return Promise.resolve();
    } catch (error) {
      // Don't throw error, just log it
      return Promise.resolve();
    }
  }

  /**
   * Get chat history
   * @param {string} sessionId - Session ID
   * @returns {Promise<Array>} Chat history
   */
  async getChatHistory(sessionId) {
    try {
      const response = await axios.get(
        `${this.apiEndpoint}/history/${sessionId}`,
        { timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  /**
   * Handle errors from API calls
   * @param {Error} error - The error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    let errorMessage = 'An unknown error occurred';

    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 400:
          errorMessage = 'Bad Request: Invalid message format';
          break;
        case 401:
          errorMessage = 'Unauthorized: Authentication required';
          break;
        case 403:
          errorMessage = 'Forbidden: Access denied';
          break;
        case 404:
          errorMessage = 'Not Found: Chat service unavailable';
          break;
        case 429:
          errorMessage = 'Too Many Requests: Rate limit exceeded';
          break;
        case 500:
          errorMessage = 'Internal Server Error: Please try again later';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Service Unavailable: Please try again later';
          break;
        default:
          errorMessage = `Server Error: ${error.response.status}`;
      }

      if (error.response.data && error.response.data.message) {
        errorMessage += ` - ${error.response.data.message}`;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout: The server took too long to respond';
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'Network Error: Unable to reach the server';
    } else {
      errorMessage = error.message || errorMessage;
    }

    return new Error(errorMessage);
  }

  /**
   * Update API endpoint
   * @param {string} endpoint - New API endpoint
   */
  setApiEndpoint(endpoint) {
    this.apiEndpoint = endpoint;
  }

  /**
   * Generate a unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = ChatService;
