#!/bin/bash

# Install dependencies
npm install

# Install specific package
npm install lodash

# Install dev dependencies
npm install --save-dev jest

# Run tests
npm test

# Run build
npm run build

# Start development server
npm run dev

# Add a package
npm add express

# Remove a package
npm remove lodash

# Run a custom script
npm run lint

# Check version
npm --version