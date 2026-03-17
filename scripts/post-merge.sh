#!/bin/bash
set -e

npm install --no-audit --ignore-scripts 2>/dev/null || true
npm run db:push --force 2>/dev/null || true
