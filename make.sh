#!/bin/bash

set -e

echo "Building and starting Docker containers from /mock-exporter-clone..."
cd ./mock-exporter-clone
docker-compose up --build -d  
echo "Docker containers started."

cd ../
echo "Setting up and starting the IBM Metric App"
cd ./client/ibm-metric-app

if [ ! -d "node_modules" ]; then
  npm install
else
  echo "node_modules already exists, skipping npm install."
fi

npm start
