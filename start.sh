#!/bin/bash
# Load environment variables from .env
export $(cat .env | xargs)

# Start Spring Boot in the background
echo "🚀 Starting Spring Boot..."
mvn spring-boot:run &
SPRING_PID=$!

# Start React frontend
echo "⚛️  Starting React frontend..."
cd client && npm run dev &
REACT_PID=$!

# Wait for both
echo "✅ Both servers running. Press Ctrl+C to stop."
trap "kill $SPRING_PID $REACT_PID" EXIT
wait
