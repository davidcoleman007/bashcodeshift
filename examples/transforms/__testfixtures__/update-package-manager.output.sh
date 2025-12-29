#!/bin/bash

# Install dependencies
yarn

# Install specific package
yarn lodash

# Install dev dependencies
yarn --save-dev jest

# Run tests
yarn test

# Run build
yarn build

# Start development server
yarn dev

# Add a package
yarn add express

# Remove a package
yarn remove lodash

# Run a custom script
yarn lint

# Check version
yarn --version