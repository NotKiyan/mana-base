#!/bin/bash

echo "Starting Mana Nexus..."

# Install dependencies
cd /home/site/wwwroot/server
npm install --production

echo "Starting server..."
node dist/index.js
