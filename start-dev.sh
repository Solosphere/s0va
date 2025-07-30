#!/bin/bash

# MT8 Development Startup Script
# This script starts both the frontend and backend servers

echo "🚀 Starting MT8 Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if FFmpeg is installed (for video processing)
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg is not installed. Video processing will not work."
    echo "   Install FFmpeg: brew install ffmpeg (macOS) or sudo apt install ffmpeg (Ubuntu)"
fi

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "📡 Starting backend server..."
cd server
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp config.env.example .env
fi

npm install
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
cd ..
npm install
npm run dev &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/api/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait 