#!/bin/bash

# Social Network Application - Startup Script

echo "🚀 Starting Social Network Application..."
echo ""

# Kill any existing processes on ports 5000 and 3000
echo "Cleaning up existing processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# Start backend
echo "📦 Starting Flask backend on port 5000..."
cd /workspaces/codespaces-blank/backend
nohup python app.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "⏳ Waiting for backend to initialize..."
for i in {1..30}; do
  if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✓ Backend is ready!"
    break
  fi
  sleep 1
  if [ $i -eq 30 ]; then
    echo "✗ Backend failed to start!"
    exit 1
  fi
done

# Start frontend
echo ""
echo "⚛️  Starting React frontend on port 3000..."
cd /workspaces/codespaces-blank/frontend
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "✅ Application started successfully!"
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Logs:"
echo "   Backend log: /workspaces/codespaces-blank/backend/backend.log"
echo "   Frontend log: /workspaces/codespaces-blank/frontend/frontend.log"
echo ""
echo "Press Ctrl+C to stop the application, or run: pkill -f 'python app.py' && pkill -f 'npm start'"

# Wait for both processes
wait
