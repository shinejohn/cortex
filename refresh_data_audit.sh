#!/bin/bash

# Define output directory
OUTPUT_DIR="Data/Audit"

# Ensure directory exists
mkdir -p "$OUTPUT_DIR"

echo "Starting Data Architecture Audit..."
echo "Output Directory: $OUTPUT_DIR"

# Run the audit command
php artisan audit:data-structure --output="$OUTPUT_DIR"

echo "Done. Artifacts available in $OUTPUT_DIR"
