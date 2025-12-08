# AI Chatbot Configuration

This file contains configuration options for the AI Chatbot application.

## API Configuration

To connect to your backend chat service, update the following settings in `chat-service.js`:

```javascript
this.apiEndpoint = 'http://localhost:8080/api/chat';
```

Replace with your actual API endpoint URL.

## Supported Endpoints

The application expects the following API endpoints:

1. **POST /api/chat** - Send message to chat service
   - Body: Plain text message
   - Returns: String response

2. **DELETE /api/chat/session/{sessionId}** - Clear chat session
   - Returns: Success/failure status

3. **GET /api/chat/history/{sessionId}** - Get chat history
   - Returns: Array of messages

## Environment Variables

You can also configure the API endpoint using environment variables:

```bash
# Set API endpoint
CHAT_API_ENDPOINT=http://localhost:8080/api/chat

# Set request timeout (milliseconds)
CHAT_REQUEST_TIMEOUT=30000
```

## Quick Actions Configuration

To customize quick actions, edit the quick action buttons in `index.html` and their handlers in `renderer.js`.

## Customization

### Theme Colors
Edit CSS variables in `styles.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  /* ... more colors */
}
```

### Window Settings
Edit window configuration in `main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  /* ... more options */
});
```
