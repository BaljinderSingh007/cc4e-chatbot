// Chat State Management
class ChatApp {
  constructor() {
    this.currentSessionId = this.generateSessionId();
    this.messages = [];
    this.chatHistory = [];
    this.isTyping = false;
    this.currentAction = null;
    this.mcpServers = [];
    
    this.initializeElements();
    this.attachEventListeners();
    this.loadChatHistory();
    this.loadMcpServers();
    this.initializeMcpIntegration();  
    this.initializeWelcomeMessage();
  }

  initializeElements() {
    // Main elements
    this.sidebar = document.getElementById('sidebar');
    this.sidebarToggle = document.getElementById('sidebarToggle');
    this.welcomeScreen = document.getElementById('welcomeScreen');
    this.messagesArea = document.getElementById('messagesArea');
    this.chatContainer = document.getElementById('chatContainer');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.charCount = document.getElementById('charCount');
    this.newChatBtn = document.getElementById('newChatBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.exportBtn = document.getElementById('exportBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    
    // History sections
    this.todayChats = document.getElementById('todayChats');
    this.weekChats = document.getElementById('weekChats');
    this.monthChats = document.getElementById('monthChats');
    
    // Modal elements
    this.modal = document.getElementById('inputModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalInput = document.getElementById('modalInput');
    this.modalClose = document.getElementById('modalClose');
    this.modalCancel = document.getElementById('modalCancel');
    this.modalSubmit = document.getElementById('modalSubmit');
    
    // Settings modal elements
    this.settingsModal = document.getElementById('settingsModal');
    this.settingsModalClose = document.getElementById('settingsModalClose');
    this.settingsModalCancel = document.getElementById('settingsModalCancel');
    this.settingsModalSave = document.getElementById('settingsModalSave');
    this.mcpServersList = document.getElementById('mcpServersList');
    this.addMcpServerBtn = document.getElementById('addMcpServerBtn');
    
    // MCP Server modal elements
    this.mcpServerModal = document.getElementById('mcpServerModal');
    this.mcpServerModalTitle = document.getElementById('mcpServerModalTitle');
    this.mcpServerModalClose = document.getElementById('mcpServerModalClose');
    this.mcpServerModalCancel = document.getElementById('mcpServerModalCancel');
    this.mcpServerModalSave = document.getElementById('mcpServerModalSave');
    this.mcpServerId = document.getElementById('mcpServerId');
    this.mcpServerIcon = document.getElementById('mcpServerIcon');
    this.mcpServerName = document.getElementById('mcpServerName');
    this.mcpServerDescription = document.getElementById('mcpServerDescription');
    this.mcpServerUrl = document.getElementById('mcpServerUrl');
    this.iconUploadArea = document.getElementById('iconUploadArea');
    this.iconPreview = document.getElementById('iconPreview');
  }

  initializeMcpIntegration() {
    if (window.electron) {
        // Load MCP servers from main process (if stored there)
        window.electron.getMcpServers?.().then((servers) => {
            if (servers && Array.isArray(servers)) {
                this.mcpServers = servers;
                this.saveMcpServersToStorage();
            }
            this.renderMcpServers();
        }).catch(err => console.error("Error loading MCP servers from main:", err));
    }
}

  attachEventListeners() {
    // Input events
    this.messageInput.addEventListener('input', () => this.handleInputChange());
    this.messageInput.addEventListener('keydown', (e) => this.handleKeyPress(e));
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    
    // Button events
    this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
    this.newChatBtn.addEventListener('click', () => this.startNewChat());
    this.clearBtn.addEventListener('click', () => this.clearChat());
    this.deleteAllChatsBtn = document.getElementById('deleteAllChatsBtn');
    this.deleteAllChatsBtn.addEventListener('click', () => this.deleteAllChats());
    this.exportBtn.addEventListener('click', () => this.exportChat());
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    
    // Quick actions
    const quickActionCards = document.querySelectorAll('.quick-action-card');
    quickActionCards.forEach(card => {
      card.addEventListener('click', () => {
        const action = card.getAttribute('data-action');
        this.handleQuickAction(action);
      });
    });
    
    // Modal events
    this.modalClose.addEventListener('click', () => this.closeModal());
    this.modalCancel.addEventListener('click', () => this.closeModal());
    this.modalSubmit.addEventListener('click', () => this.submitModal());
    this.modalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitModal();
      } else if (e.key === 'Escape') {
        this.closeModal();
      }
    });
    
    // Electron IPC events
    if (window.electron) {
      window.electron.onNewChat(() => this.startNewChat());
      window.electron.onExportChat(() => this.exportChat());
      window.electron.onOpenSettings(() => this.openSettings());
    }
    
    // Auto-resize textarea
    this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
    
    // Settings modal events
    this.settingsModalClose.addEventListener('click', () => this.closeSettingsModal());
    this.settingsModalCancel.addEventListener('click', () => this.closeSettingsModal());
    this.settingsModalSave.addEventListener('click', () => this.saveSettings());
    
    // Settings tabs
    const settingsTabs = document.querySelectorAll('.settings-tab');
    settingsTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchSettingsTab(tab.dataset.tab));
    });
    
    // MCP Server modal events
    this.addMcpServerBtn.addEventListener('click', () => this.openMcpServerModal());
    this.mcpServerModalClose.addEventListener('click', () => this.closeMcpServerModal());
    this.mcpServerModalCancel.addEventListener('click', () => this.closeMcpServerModal());
    this.mcpServerModalSave.addEventListener('click', () => this.saveMcpServer());
    
    // Icon upload
    this.iconUploadArea.addEventListener('click', () => this.mcpServerIcon.click());
    this.mcpServerIcon.addEventListener('change', (e) => this.handleIconUpload(e));
  }

  initializeWelcomeMessage() {
    const welcomeMsg = {
      id: this.generateId(),
      text: 'Hello! How can I help you today? You can ask me about projects, contracts, or use the quick actions below.',
      sender: 'bot',
      timestamp: new Date()
    };
    this.messages.push(welcomeMsg);
  }

  handleInputChange() {
    const text = this.messageInput.value;
    const length = text.length;
    this.charCount.textContent = `${length} / 2000`;
    
    // Enable/disable send button
    this.sendBtn.disabled = text.trim().length === 0 || length > 2000 || this.isTyping;
    
    // Change color if over limit
    if (length > 2000) {
      this.charCount.style.color = '#ef4444';
    } else {
      this.charCount.style.color = 'var(--text-secondary)';
    }
  }

  handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!this.sendBtn.disabled) {
        this.sendMessage();
      }
    }
  }

  autoResizeTextarea() {
    this.messageInput.style.height = 'auto';
    this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 200) + 'px';
  }

  async sendMessage(customMessage = null) {
    const messageText = customMessage || this.messageInput.value.trim();
    
    if (!messageText || messageText.length > 2000) {
      return;
    }

    // Hide welcome screen if visible
    if (!this.welcomeScreen.style.display || this.welcomeScreen.style.display !== 'none') {
      this.welcomeScreen.style.display = 'none';
      this.messagesArea.classList.add('active');
    }

    // Create user message
    const userMessage = {
      id: this.generateId(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.displayMessage(userMessage);
    
    // Clear input
    this.messageInput.value = '';
    this.messageInput.style.height = 'auto';
    this.handleInputChange();

    // Show typing indicator
    this.showTypingIndicator();

    // Send to API
    try {
      await this.getBotResponse(messageText);
    } catch (error) {
      console.error('Error getting bot response:', error);
      this.hideTypingIndicator();
      this.displayErrorMessage();
    }

    // Update chat history
    this.updateChatHistory();
    this.scrollToBottom();
  }

  async getBotResponse(userMessage) {
    try {
      // Call Electron IPC to send message to backend
      // Only send the message string and sessionId as expected by main.js
      const response = await window.electron.sendMessage(userMessage, this.currentSessionId);
      
      console.log('=== BOT RESPONSE DEBUG ===');
      console.log('User message:', userMessage);
      console.log('Response object:', response);
      console.log('Response type:', typeof response);
      console.log('Response.success:', response.success);
      console.log('Response.response:', response.response);
      console.log('========================');
      
      this.hideTypingIndicator();

      if (response.success) {
        let formattedText;

if (typeof response.response === 'object') {
  // Pretty-print JSON for the chat bubble
  formattedText = JSON.stringify(response.response, null, 2);
} else {
  formattedText = response.response;
}

const botMessage = {
  id: this.generateId(),
  text: formattedText,
  sender: 'bot',
  timestamp: new Date()
};

        this.messages.push(botMessage);
        this.displayMessage(botMessage);
      } else {
        // Use fallback response without logging error
        const fallbackResponse = this.generateFallbackResponse(userMessage);
        const botMessage = {
          id: this.generateId(),
          text: fallbackResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        this.messages.push(botMessage);
        this.displayMessage(botMessage);
      }
    } catch (error) {
      this.hideTypingIndicator();
      // Fallback to local response
      const fallbackResponse = this.generateFallbackResponse(userMessage);
      const botMessage = {
        id: this.generateId(),
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      this.messages.push(botMessage);
      this.displayMessage(botMessage);
    }
  }

  generateFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! How can I assist you today?';
    } else if (lowerMessage.includes('help')) {
      return 'I\'m here to help! You can ask me about:\n- Project information\n- Contract details\n- General assistance\n\nFeel free to use the quick actions or type your question.';
    } else if (lowerMessage.includes('project')) {
      return 'I can help you with project-related questions. What specific information do you need about projects?';
    } else if (lowerMessage.includes('contract')) {
      return 'I can assist with contract information. Would you like to see all contracts or search for a specific one?';
    } else if (lowerMessage.includes('all projects') || lowerMessage.includes('show projects')) {
      return 'Here are all the projects:\n\n1. Project Alpha - Active\n2. Project Beta - Completed\n3. Project Gamma - In Progress\n\nWould you like more details about any specific project?';
    } else if (lowerMessage.includes('all contracts') || lowerMessage.includes('show contracts')) {
      return 'Here are all the contracts:\n\n1. Contract #001 - Active\n2. Contract #002 - Pending\n3. Contract #003 - Completed\n\nNeed information about a specific contract?';
    } else {
      return `I understand you're asking about "${userMessage}". While I'm currently in demo mode, I can help you with projects, contracts, and general information. Try using the quick actions or ask me specific questions!`;
    }
  }

  displayMessage(message) {
    const messageGroup = document.createElement('div');
    messageGroup.className = `message-group ${message.sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = message.sender === 'user' 
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3z"/></svg>';

    const content = document.createElement('div');
    content.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = message.text;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = this.formatTime(message.timestamp);

    content.appendChild(bubble);
    content.appendChild(time);

    if (message.sender === 'user') {
      messageGroup.appendChild(content);
      messageGroup.appendChild(avatar);
    } else {
      messageGroup.appendChild(avatar);
      messageGroup.appendChild(content);
    }

    this.messagesArea.appendChild(messageGroup);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    this.isTyping = true;
    this.handleInputChange();

    const typingGroup = document.createElement('div');
    typingGroup.className = 'message-group bot typing-indicator-group';
    typingGroup.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3z"/></svg>';

    const content = document.createElement('div');
    content.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

    bubble.appendChild(typingIndicator);
    content.appendChild(bubble);
    typingGroup.appendChild(avatar);
    typingGroup.appendChild(content);

    this.messagesArea.appendChild(typingGroup);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isTyping = false;
    this.handleInputChange();
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  displayErrorMessage(errorText = null) {
    const errorMessage = {
      id: this.generateId(),
      text: errorText || 'I apologize, but I encountered an error. Please try again.',
      sender: 'bot',
      timestamp: new Date()
    };
    this.messages.push(errorMessage);
    this.displayMessage(errorMessage);
  }

  handleQuickAction(action) {
    switch (action) {
      case 'projects':
        this.sendMessage('Show me all projects');
        break;
      case 'contracts':
        this.currentAction = 'contracts-by-project';
        this.openModal('Enter Project ID', 'Enter the project ID to get contracts');
        break;
      case 'project-id':
        this.currentAction = 'project-id';
        this.openModal('Enter Project ID', 'Enter the project ID to search');
        break;
      case 'contract-id':
        this.currentAction = 'contract-id';
        this.openModal('Enter Contract ID', 'Enter the contract ID to search');
        break;
      case 'help':
        this.sendMessage('How can you help me?');
        break;
    }
  }

  openModal(title, placeholder) {
    this.modalTitle.textContent = title;
    this.modalInput.placeholder = placeholder;
    this.modalInput.value = '';
    this.modal.classList.add('active');
    setTimeout(() => this.modalInput.focus(), 100);
  }

  closeModal() {
    this.modal.classList.remove('active');
    this.currentAction = null;
  }

  submitModal() {
    const value = this.modalInput.value.trim();
    if (!value) return;

    if (this.currentAction === 'project-id') {
      this.sendMessage(`Show me project with ID ${value}`);
    } else if (this.currentAction === 'contract-id') {
      this.sendMessage(`Show me contract with ID ${value}`);
    } else if (this.currentAction === 'contracts-by-project') {
      this.sendMessage(`show contracts for project ${value}`);
    }

    this.closeModal();
  }

  toggleSidebar() {
    this.sidebar.classList.toggle('collapsed');
  }

  startNewChat() {
    // Check if current chat already has messages
    const hasMessages = this.messages.length > 1;
    
    // Reset typing state
    this.isTyping = false;
    
    // Only create new chat if current chat has messages or is not already new
    if (hasMessages) {
      this.messages = [];
      this.messagesArea.innerHTML = '';
      this.currentSessionId = this.generateSessionId();
      this.welcomeScreen.style.display = 'flex';
      this.messagesArea.classList.remove('active');
      this.initializeWelcomeMessage();
      this.renderChatHistory();
    } else {
      // Already on a new chat, just make sure welcome screen is visible
      this.welcomeScreen.style.display = 'flex';
      this.messagesArea.classList.remove('active');
    }
    
    // Re-enable input field
    this.handleInputChange();
  }

  async clearChat() {
    if (this.messages.length <= 1) return;

      // Reset typing state
      this.isTyping = false;

      try {
        if (window.electron) {
          await window.electron.clearSession(this.currentSessionId);
        }
        // Delete current chat from history
        this.deleteChat(this.currentSessionId);
        // Start a new chat
        this.messages = [];
        this.messagesArea.innerHTML = '';
        this.currentSessionId = this.generateSessionId();
        this.welcomeScreen.style.display = 'flex';
        this.messagesArea.classList.remove('active');
        this.initializeWelcomeMessage();
        this.renderChatHistory();
        
        // Re-enable input field
        this.handleInputChange();
        this.initializeWelcomeMessage();
        this.renderChatHistory();
      } catch (error) {
        console.error('Error clearing chat:', error);
        this.deleteChat(this.currentSessionId);
        this.messages = [];
        this.messagesArea.innerHTML = '';
        this.currentSessionId = this.generateSessionId();
        this.welcomeScreen.style.display = 'flex';
        this.messagesArea.classList.remove('active');
        this.initializeWelcomeMessage();
        this.renderChatHistory();
      }
  }

    deleteAllChats() {
    if (confirm('Delete ALL chats? This cannot be undone.')) {
      this.chatHistory = [];
      this.saveChatHistory();
      this.messages = [];
      this.messagesArea.innerHTML = '';
      this.currentSessionId = this.generateSessionId();
      this.welcomeScreen.style.display = 'flex';
      this.messagesArea.classList.remove('active');
      this.initializeWelcomeMessage();
      this.renderChatHistory();
    }
  }

  exportChat() {
    if (this.messages.length <= 1) {
      alert('No messages to export');
      return;
    }

    const chatText = this.messages.map(msg => {
      const time = this.formatTime(msg.timestamp);
      const sender = msg.sender === 'user' ? 'You' : 'CC4E Assistant';
      return `[${time}] ${sender}: ${msg.text}`;
    }).join('\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  openSettings() {
    this.settingsModal.classList.add('active');
    this.renderMcpServers();
  }

  closeSettingsModal() {
    this.settingsModal.classList.remove('active');
  }

  switchSettingsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.settings-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update panels
    document.querySelectorAll('.settings-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}-panel`);
    });
  }

saveSettings() {
  // Save locally
  this.saveMcpServersToStorage();
  // Sync config to backend (no restart needed)
  this.syncMcpServersToClient();
  this.closeSettingsModal();
}

  async syncMcpServersToClient() {
    // Convert chatbot MCP servers to MCP client config format
    const mcpConfig = { mcpServers: {} };
    this.mcpServers.forEach(server => {
      const serverKey = server.name.toLowerCase().replace(/\s+/g, '-');
      mcpConfig.mcpServers[serverKey] = {
        url: server.url,
        name: server.name,
        description: server.description
      };
    });
    // Save to localStorage for UI use
    localStorage.setItem('mcpClientConfig', JSON.stringify(mcpConfig));
    // POST to backend
    try {
      const response = await fetch('http://localhost:8085/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mcpConfig)
      });
      if (response.ok) {
        console.log('MCP servers synchronized via client API!');
      } else {
        console.error('Failed to sync MCP servers via client API:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to sync MCP servers via client API:', error);
    }
  }

  // MCP Server Management
  loadMcpServers() {
    try {
      const saved = localStorage.getItem('mcpServers');
      if (saved) {
        this.mcpServers = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading MCP servers:', error);
      this.mcpServers = [];
    }
  }

  saveMcpServersToStorage() {
    try {
      localStorage.setItem('mcpServers', JSON.stringify(this.mcpServers));
    } catch (error) {
      console.error('Error saving MCP servers:', error);
    }
  }

  renderMcpServers() {
    this.mcpServersList.innerHTML = '';
    
    if (this.mcpServers.length === 0) {
      this.mcpServersList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No MCP servers configured yet. Click "Add MCP Server" to get started.</p>';
      return;
    }
    
    this.mcpServers.forEach(server => {
      const card = document.createElement('div');
      card.className = 'mcp-server-card';
      
      const iconHtml = server.icon 
        ? `<img src="${server.icon}" alt="${server.name}">`
        : `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
             <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
             <circle cx="8.5" cy="8.5" r="1.5"/>
             <polyline points="21 15 16 10 5 21"/>
           </svg>`;
      
      card.innerHTML = `
        <div class="mcp-server-icon">${iconHtml}</div>
        <div class="mcp-server-info">
          <div class="mcp-server-name">${this.escapeHtml(server.name)}</div>
          ${server.description ? `<div class="mcp-server-description">${this.escapeHtml(server.description)}</div>` : ''}
          <div class="mcp-server-url">${this.escapeHtml(server.url)}</div>
        </div>
        <div class="mcp-server-actions">
          <button class="mcp-server-action-btn edit" data-id="${server.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="mcp-server-action-btn delete" data-id="${server.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `;
      
      // Add event listeners
      card.querySelector('.edit').addEventListener('click', () => this.editMcpServer(server.id));
      card.querySelector('.delete').addEventListener('click', () => this.deleteMcpServer(server.id));
      
      this.mcpServersList.appendChild(card);
    });
  }

  openMcpServerModal(serverId = null) {
    if (serverId) {
      const server = this.mcpServers.find(s => s.id === serverId);
      if (server) {
        this.mcpServerModalTitle.textContent = 'Edit MCP Server';
        this.mcpServerId.value = server.id;
        this.mcpServerName.value = server.name;
        this.mcpServerDescription.value = server.description || '';
        this.mcpServerUrl.value = server.url;
        
        if (server.icon) {
          this.iconPreview.innerHTML = `<img src="${server.icon}" alt="Icon preview">`;
        }
      }
    } else {
      this.mcpServerModalTitle.textContent = 'Add MCP Server';
      this.mcpServerId.value = '';
      this.mcpServerName.value = '';
      this.mcpServerDescription.value = '';
      this.mcpServerUrl.value = '';
      this.iconPreview.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <p>Click to upload icon</p>
        <small>Minimum size: 128 x 128 px</small>
      `;
    }
    
    this.mcpServerModal.classList.add('active');
  }

  closeMcpServerModal() {
    this.mcpServerModal.classList.remove('active');
  }

  handleIconUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.iconPreview.innerHTML = `<img src="${e.target.result}" alt="Icon preview">`;
        this.iconPreview.dataset.icon = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveMcpServer() {
    const name = this.mcpServerName.value.trim();
    const url = this.mcpServerUrl.value.trim();
    
    if (!name || !url) {
      alert('Please fill in all required fields (Name and URL)');
      return;
    }
    
    const server = {
      id: this.mcpServerId.value || this.generateId(),
      name: name,
      description: this.mcpServerDescription.value.trim(),
      url: url,
      icon: this.iconPreview.dataset.icon || null
    };
    
    const existingIndex = this.mcpServers.findIndex(s => s.id === server.id);
    if (existingIndex >= 0) {
      this.mcpServers[existingIndex] = server;
    } else {
      this.mcpServers.push(server);
    }
    
    this.saveMcpServersToStorage();
    this.renderMcpServers();
    this.closeMcpServerModal();
  }

  editMcpServer(serverId) {
    this.openMcpServerModal(serverId);
  }

  deleteMcpServer(serverId) {
    if (confirm('Are you sure you want to delete this MCP server?')) {
      this.mcpServers = this.mcpServers.filter(s => s.id !== serverId);
      this.saveMcpServersToStorage();
      this.renderMcpServers();
    }
  }

  async syncMcpServersToClient() {
    // Convert chatbot MCP servers to MCP client config format
    const mcpConfig = {
      mcpServers: {}
    };
    this.mcpServers.forEach(server => {
      const serverKey = server.name.toLowerCase().replace(/\s+/g, '-');
      mcpConfig.mcpServers[serverKey] = {
        url: server.url,
        name: server.name,
        description: server.description
      };
    });
    // Save to localStorage for UI use
    localStorage.setItem('mcpClientConfig', JSON.stringify(mcpConfig));
    console.log('MCP servers synced:', mcpConfig);
    // Call MCP client API to update config
    try {
      const response = await fetch('http://localhost:8085/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mcpConfig)
      });
      if (response.ok) {
        console.log('MCP servers synchronized via client API!');
      } else {
        console.error('Failed to sync MCP servers via client API:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to sync MCP servers via client API:', error);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  updateChatHistory() {
    // Get first user message as chat title
    const firstUserMessage = this.messages.find(msg => msg.sender === 'user');
    const title = firstUserMessage 
      ? firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '')
      : 'New Chat';

    const historyItem = {
      id: this.currentSessionId,
      title: title,
      timestamp: new Date(),
      messages: this.messages
    };

    // Add to history if not exists
    const existingIndex = this.chatHistory.findIndex(item => item.id === this.currentSessionId);
    if (existingIndex >= 0) {
      this.chatHistory[existingIndex] = historyItem;
    } else {
      this.chatHistory.unshift(historyItem);
    }

    this.saveChatHistory();
    this.renderChatHistory();
  }

  renderChatHistory() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.todayChats.innerHTML = '';
    this.weekChats.innerHTML = '';
    this.monthChats.innerHTML = '';

    this.chatHistory.forEach(chat => {
      const chatDate = new Date(chat.timestamp);
      const button = this.createHistoryButton(chat);

      if (chatDate > oneDayAgo) {
        this.todayChats.appendChild(button);
      } else if (chatDate > oneWeekAgo) {
        this.weekChats.appendChild(button);
      } else if (chatDate > oneMonthAgo) {
        this.monthChats.appendChild(button);
      }
    });
  }

  createHistoryButton(chat) {
    const container = document.createElement('div');
    container.className = 'history-item-container';
    
    const button = document.createElement('button');
    button.className = 'history-item';
    button.textContent = chat.title;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'history-delete-btn';
    deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    deleteBtn.title = 'Delete chat';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteChat(chat.id);
    });
    
    if (chat.id === this.currentSessionId) {
      button.classList.add('active');
      container.classList.add('active');
    }

    button.addEventListener('click', () => this.loadChat(chat));
    
    container.appendChild(deleteBtn);
    container.appendChild(button);
    return container;
  }

  deleteChat(chatId) {
    if (confirm('Delete this chat?')) {
      // Remove from history
      this.chatHistory = this.chatHistory.filter(item => item.id !== chatId);
      this.saveChatHistory();
      
      // If deleting current chat, start new one
      if (chatId === this.currentSessionId) {
        this.messages = [];
        this.messagesArea.innerHTML = '';
        this.currentSessionId = this.generateSessionId();
        this.welcomeScreen.style.display = 'flex';
        this.messagesArea.classList.remove('active');
        this.initializeWelcomeMessage();
      }
      
      this.renderChatHistory();
    }
  }

  loadChat(chat) {
    this.currentSessionId = chat.id;
    this.messages = chat.messages || [];
    this.messagesArea.innerHTML = '';
    
    if (this.messages.length > 1) {
      this.welcomeScreen.style.display = 'none';
      this.messagesArea.classList.add('active');
      this.messages.slice(1).forEach(msg => this.displayMessage(msg));
    } else {
      this.welcomeScreen.style.display = 'flex';
      this.messagesArea.classList.remove('active');
    }

    this.renderChatHistory();
    this.scrollToBottom();
  }

  saveChatHistory() {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  loadChatHistory() {
    try {
      const saved = localStorage.getItem('chatHistory');
      if (saved) {
        this.chatHistory = JSON.parse(saved);
        this.renderChatHistory();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      this.chatHistory = [];
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }, 100);
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  generateSessionId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new ChatApp();
  
  // Make app globally accessible for debugging
  window.chatApp = app;
});
