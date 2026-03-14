#!/usr/bin/env bash
set -euo pipefail

# Start backend API
cd backend

if [ ! -d node_modules ]; then
  npm install --omit=dev
fi

npm start
