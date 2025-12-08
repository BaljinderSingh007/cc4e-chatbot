const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Send message to chat API
  sendMessage: (message, sessionId) => ipcRenderer.invoke('send-message', message, sessionId),
  
  // Clear chat session
  clearSession: (sessionId) => ipcRenderer.invoke('clear-session', sessionId),
  
  // Get chat history
  getHistory: (sessionId) => ipcRenderer.invoke('get-history', sessionId),
  
  // Listen for menu events
  onNewChat: (callback) => ipcRenderer.on('new-chat', callback),
  onExportChat: (callback) => ipcRenderer.on('export-chat', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback),
  
  // Remove listeners
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback)
});
