#!/bin/bash

# Define the directory to search in
SEARCH_DIR="./src"

# Define the search pattern
SEARCH_PATTERN="from '@/services/"

# Define the file types to include
INCLUDE_TYPES="--include=*.js --include=*.vue"

echo "🔍 Searching for Vue components that still import backend services..."
echo ""

# Run the grep command
grep -rnw "$SEARCH_DIR" -e "$SEARCH_PATTERN" $INCLUDE_TYPES

# Check if grep found anything
if [ $? -eq 0 ]; then
    echo ""
    echo "⚠️  Found backend imports in frontend files! Please update them."
else
    echo ""
    echo "✅ No backend imports found in Vue components."
fi
