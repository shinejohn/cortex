#!/bin/bash

# Bulk fix script to remove inline FK constraints from all migrations
# This converts patterns like:
#   ->constrained('table')->cascadeOnDelete()
#   ->constrained()->nullOnDelete()
# To just the column definition without the constraint

echo "🔧 Fixing inline FK constraints in migrations..."

cd /Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/database/migrations

# Pattern 1: foreignUuid('col')->constrained('table')->cascadeOnDelete()
# Convert to: uuid('col')
find . -name "*.php" -exec sed -i '' \
  "s/\->foreignUuid('\([^']*\)')\->constrained('[^']*')\->[a-zA-Z]*()/->\uuid('\1')/g" {} \;

# Pattern 2: foreignUuid('col')->nullable()->constrained('table')->nullOnDelete()
# Convert to: uuid('col')->nullable()
find . -name "*.php" -exec sed -i '' \
  "s/\->foreignUuid('\([^']*\)')\->nullable()\->constrained('[^']*')\->[a-zA-Z]*()/->\uuid('\1')->nullable()/g" {} \;

# Pattern 3: foreignId('col')->constrained()->cascadeOnDelete()
# Convert to: unsignedBigInteger('col')
find . -name "*.php" -exec sed -i '' \
  "s/\->foreignId('\([^']*\)')\->constrained()\->[a-zA-Z]*()/->\unsignedBigInteger('\1')/g" {} \;

# Pattern 4: foreignId('col')->nullable()->constrained()->nullOnDelete()
# Convert to: unsignedBigInteger('col')->nullable()
find . -name "*.php" -exec sed -i '' \
  "s/\->foreignId('\([^']*\)')\->nullable()\->constrained()\->[a-zA-Z]*()/->\unsignedBigInteger('\1')->nullable()/g" {} \;

# Pattern 5: uuid('col')->constrained('table')->cascadeOnDelete()
# Convert to: uuid('col')
find . -name "*.php" -exec sed -i '' \
  "s/\->uuid('\([^']*\)')\->constrained('[^']*')\->[a-zA-Z]*()/->\uuid('\1')/g" {} \;

# Pattern 6: uuid('col')->nullable()->constrained('table')->nullOnDelete()
# Convert to: uuid('col')->nullable()
find . -name "*.php" -exec sed -i '' \
  "s/\->uuid('\([^']*\)')\->nullable()\->constrained('[^']*')\->[a-zA-Z]*()/->\uuid('\1')->nullable()/g" {} \;

echo "✅ Done! Verify with: grep -r 'constrained' *.php | wc -l"
