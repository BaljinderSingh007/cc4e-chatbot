# AI Chatbot - Electron Desktop Application

A beautiful, modern AI chatbot desktop application built with Electron.js, featuring a Gemini/ChatGPT-style interface.

## Features

✨ **Modern UI Design**
- Clean and intuitive interface inspired by Gemini and ChatGPT
- Smooth animations and transitions
- Dark/Light theme support (coming soon)
- Responsive layout

🚀 **Core Functionality**
- Real-time chat with AI assistant
- Quick action buttons for common tasks
- Chat history management
- Session persistence
- Message export functionality
- Typing indicators
- Character count tracking

💬 **Chat Features**
- Show all projects
- Show all contracts
- Search by project ID
- Search by contract ID
- General help and assistance
- Context-aware responses

🔧 **Technical Features**
- Built with Electron.js
- Secure IPC communication
- Context isolation for security
- Local storage for chat history
- API integration ready
- Cross-platform support (Windows, macOS, Linux)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm (v8 or higher)

## Installation

1. Navigate to the project directory:
```bash
cd ai-chatbot-electron
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode
Run the application in development mode with DevTools:
```bash
npm run dev
```

### Production Mode
Run the application in production mode:
```bash
npm start
```

## Building the Application

### Build for Current Platform
```bash
npm run build
```

### Build for Specific Platforms
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

### Create Distributable Package
```bash
npm run dist
```

The built application will be available in the `dist` folder.

## Project Structure

```
ai-chatbot-electron/
├── main.js              # Electron main process
├── preload.js           # Preload script for IPC
├── renderer.js          # Renderer process (UI logic)
├── chat-service.js      # Chat API service
├── index.html           # Main HTML file
├── styles.css           # Application styles
├── package.json         # Project configuration
├── assets/              # Application assets
│   └── icon.png         # Application icon
└── README.md            # This file
```

## Configuration

### API Endpoint
To configure the chat API endpoint, edit the `chat-service.js` file:

```javascript
this.apiEndpoint = 'http://localhost:8080/api/chat';
```

Or update it at runtime through the settings panel (coming soon).

### Customization
- **Colors**: Edit CSS variables in `styles.css`
- **Quick Actions**: Modify the quick actions in `index.html` and `renderer.js`
- **Window Size**: Adjust dimensions in `main.js`

## Usage

### Quick Actions
The chatbot provides several quick action buttons:
1. **Show all projects** - View all available projects
2. **Show all contracts** - View all contracts
3. **Search project by ID** - Find specific project details
4. **How can you help?** - Learn about bot capabilities

### Keyboard Shortcuts
- `Ctrl/Cmd + N` - Start new chat
- `Ctrl/Cmd + E` - Export chat
- `Ctrl/Cmd + ,` - Open settings
- `Enter` - Send message
- `Shift + Enter` - New line in message

### Chat Commands
You can type natural language queries such as:
- "Show me all projects"
- "Show me all contracts"
- "Show me project with ID 12345"
- "Show me contract with ID ABC123"
- "How can you help me?"

## Integration with Backend

The application is designed to integrate with your existing chat service. Update the `main.js` file to connect to your backend:

```javascript
ipcMain.handle('send-message', async (event, message, sessionId) => {
  try {
    const chatService = new ChatService();
    const response = await chatService.sendMessage(message, sessionId);
    return {
      success: true,
      response: response,
      sessionId: sessionId
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});
```

## Features Coming Soon

- [ ] Settings panel with API configuration
- [ ] Dark/Light theme toggle
- [ ] Custom themes
- [ ] Voice input support
- [ ] File attachments
- [ ] Advanced export options (PDF, JSON)
- [ ] Chat search functionality
- [ ] Keyboard shortcuts customization
- [ ] Multi-language support
- [ ] Auto-update functionality

## Troubleshooting

### Application won't start
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be v16+)
- Try deleting `node_modules` and reinstalling

### Chat API not responding
- Verify the API endpoint is correct in `chat-service.js`
- Check if the backend service is running
- Look for errors in DevTools console (`npm run dev`)

### Build fails
- Ensure you have write permissions in the project directory
- Check available disk space
- Try running with admin/sudo privileges

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please create an issue in the repository.

---

Built with ❤️ using Electron.js
