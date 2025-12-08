# Quick Start Guide

## Getting Started with AI Chatbot

### 1. Install Dependencies
```bash
npm install
```

This will install:
- Electron framework
- Electron Builder for packaging
- Axios for HTTP requests

### 2. Run the Application

**Development Mode (with DevTools):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### 3. Using the Chatbot

#### Welcome Screen
When you first open the app, you'll see:
- Welcome message
- Four quick action buttons for common tasks
- Message input area at the bottom

#### Quick Actions
Click any quick action button to:
- **Show all projects** - Get a list of all projects
- **Show all contracts** - View all contracts
- **Search project by ID** - Enter a project ID to search
- **How can you help?** - Learn about the bot's capabilities

#### Typing Messages
1. Click the text area at the bottom
2. Type your message (max 2000 characters)
3. Press Enter to send (Shift+Enter for new line)
4. Or click the send button

#### Chat History
- All your chats are saved in the left sidebar
- Organized by: Today, Previous 7 Days, Previous 30 Days
- Click any chat to reload it

#### Menu Options
- **New Chat** (Ctrl/Cmd+N) - Start fresh conversation
- **Clear Chat** - Delete current chat messages
- **Export Chat** (Ctrl/Cmd+E) - Save chat as text file
- **Settings** (Ctrl/Cmd+,) - Configure the app

### 4. Connecting to Your Backend

Edit `chat-service.js` to point to your API:

```javascript
this.apiEndpoint = 'http://your-api-url.com/api/chat';
```

The app expects:
- **POST /api/chat** - Send message, receive response
- **DELETE /api/chat/session/{id}** - Clear session
- **GET /api/chat/history/{id}** - Get history

### 5. Building for Distribution

**Build for current platform:**
```bash
npm run build
```

**Build for specific platforms:**
```bash
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```

The built app will be in the `dist` folder.

### 6. Customization

**Change Colors:**
Edit CSS variables in `styles.css`

**Modify Quick Actions:**
Edit buttons in `index.html` and handlers in `renderer.js`

**Adjust Window Size:**
Change dimensions in `main.js`

### Tips
- The app works offline with fallback responses
- Chat history is stored locally
- All features work without backend (demo mode)
- Connect to your API for real functionality

### Need Help?
Check the full README.md for detailed documentation.
