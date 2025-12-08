#!/bin/bash
# Startup script for AI Chatbot (macOS/Linux)

echo "===================================="
echo "  CC4E Chatbot - Electron Desktop"
echo "===================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
    echo ""
fi

echo "Starting CC4E Chatbot..."
echo ""
npm start

if [ $? -ne 0 ]; then
    echo ""
    echo "Error: Failed to start application"
    exit 1
fi
