#!/bin/bash

# Network Error Troubleshooting Script

echo "🔧 Social Network App - Network Error Troubleshooting"
echo "======================================================"
echo ""

# Check if backend is running
echo "1. Checking if backend is running..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running on localhost:5000"
else
    echo "   ❌ Backend is NOT running"
    echo "   Start it with: cd backend && python app.py"
    exit 1
fi

# Check if frontend is running
echo ""
echo "2. Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running on localhost:3000"
else
    echo "   ❌ Frontend is NOT running"
    echo "   Start it with: cd frontend && npm start"
    exit 1
fi

# Check CORS headers
echo ""
echo "3. Checking CORS headers..."
CORS_HEADER=$(curl -s -i http://localhost:5000/api/users 2>&1 | grep -i "Access-Control-Allow-Origin")
if [ ! -z "$CORS_HEADER" ]; then
    echo "   ✅ CORS headers found"
    echo "   $CORS_HEADER"
else
    echo "   ⚠️  CORS header not found (may need to restart backend)"
fi

# Check API endpoints
echo ""
echo "4. Testing API endpoints..."
echo "   Testing GET /api/users..."
curl -s http://localhost:5000/api/users -o /dev/null -w "   Response: %{http_code}\n"

echo "   Testing POST /api/users..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","bio":"test"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
echo "   Response: $HTTP_CODE"

# Check for common issues
echo ""
echo "5. Common issues and solutions:"
echo "   ❌ Network Error → Backend not running or different port"
echo "   ❌ CORS Error → Backend needs restart to apply CORS"
echo "   ❌ Port in use → Kill process with: lsof -ti:5000 | xargs kill -9"
echo "   ❌ Node modules issue → cd frontend && rm -rf node_modules && npm install"
echo ""
echo "✅ If all checks pass, try:"
echo "   1. Clear browser cache (Ctrl+Shift+Del)"
echo "   2. Refresh page (Ctrl+R)"
echo "   3. Open DevTools (F12) → Console tab"
echo "   4. Try creating a user again and check console for error details"
