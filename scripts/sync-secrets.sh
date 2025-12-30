#!/bin/bash

# Sync local .env values to GitHub repository secrets
# Requires: GitHub CLI (gh) - https://cli.github.com/
#
# Usage: ./scripts/sync-secrets.sh
#
# This script reads your local .env file and uploads the values
# to GitHub repository secrets for use in GitHub Actions.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 GitHub Secrets Sync Script${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}You need to authenticate with GitHub CLI first.${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
if [ -z "$REPO" ]; then
    echo -e "${RED}Error: Not in a GitHub repository or remote not set.${NC}"
    exit 1
fi

echo -e "Repository: ${GREEN}$REPO${NC}"
echo ""

# Check for .env file
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}No .env file found. Creating template...${NC}"
    cat > "$ENV_FILE" << 'EOF'
# Firebase Configuration
# Get these from: Firebase Console > Project Settings > General > Your apps
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Cloudflare Web Analytics (optional)
VITE_CLOUDFLARE_BEACON_TOKEN=
EOF
    echo -e "${GREEN}Created .env template. Please fill in the values and run this script again.${NC}"
    exit 0
fi

echo -e "${YELLOW}Reading .env file and syncing to GitHub secrets...${NC}"
echo ""

# Map of .env variable names to GitHub secret names
declare -A SECRET_MAP=(
    ["VITE_FIREBASE_API_KEY"]="FIREBASE_API_KEY"
    ["VITE_FIREBASE_AUTH_DOMAIN"]="FIREBASE_AUTH_DOMAIN"
    ["VITE_FIREBASE_PROJECT_ID"]="FIREBASE_PROJECT_ID"
    ["VITE_FIREBASE_STORAGE_BUCKET"]="FIREBASE_STORAGE_BUCKET"
    ["VITE_FIREBASE_MESSAGING_SENDER_ID"]="FIREBASE_MESSAGING_SENDER_ID"
    ["VITE_FIREBASE_APP_ID"]="FIREBASE_APP_ID"
    ["VITE_CLOUDFLARE_BEACON_TOKEN"]="CLOUDFLARE_BEACON_TOKEN"
)

# Read .env and set secrets
SYNCED=0
SKIPPED=0

while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    # Remove any surrounding quotes from value
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    
    # Skip if value is empty
    if [ -z "$value" ]; then
        echo -e "  ${YELLOW}⏭ Skipping $key (empty value)${NC}"
        ((SKIPPED++))
        continue
    fi
    
    # Get the GitHub secret name
    SECRET_NAME="${SECRET_MAP[$key]}"
    
    if [ -n "$SECRET_NAME" ]; then
        echo -n "  Setting $SECRET_NAME... "
        if gh secret set "$SECRET_NAME" --body "$value" 2>/dev/null; then
            echo -e "${GREEN}✓${NC}"
            ((SYNCED++))
        else
            echo -e "${RED}✗${NC}"
        fi
    fi
done < "$ENV_FILE"

echo ""
echo -e "${GREEN}Done!${NC} Synced: $SYNCED, Skipped: $SKIPPED"
echo ""
echo -e "${YELLOW}Note:${NC} GitHub secrets are write-only. You cannot read them back."
echo "Your local .env file is the source of truth for these values."

