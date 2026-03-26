#!/bin/bash

echo "Starting Mana Nexus deployment..."

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build backend
echo "Building backend..."
cd server
npm install
npm run build
cd ..

echo "Build complete. Starting server..."
cd server
node dist/index.js
