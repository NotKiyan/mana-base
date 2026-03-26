#!/bin/bash

echo "Starting Mana Nexus..."
cd /home/site/wwwroot

# Check what was deployed
echo "Contents of /home/site/wwwroot:"
ls -la

echo "Contents of /home/site/wwwroot/server:"
ls -la server/ || echo "server/ not found"

echo "Starting server..."
cd server
node dist/index.js
