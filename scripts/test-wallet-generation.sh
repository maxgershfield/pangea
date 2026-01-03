#!/bin/bash

# Test wallet generation through Pangea backend
# This script tests the full flow: registration -> wallet generation

set -e

BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
OASIS_API_URL="${OASIS_API_URL:-https://api.oasisweb4.com}"

echo "=========================================="
echo "WALLET GENERATION TEST"
echo "=========================================="
echo ""
echo "Backend URL: $BACKEND_URL"
echo "OASIS API URL: $OASIS_API_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Generate random test user
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_USERNAME="testuser$(date +%s)"

echo "📝 Test User:"
echo "   Email: $TEST_EMAIL"
echo "   Username: $TEST_USERNAME"
echo ""

# Step 1: Check if backend is running
echo "🔍 Step 1: Checking backend health..."
if curl -s -f "$BACKEND_URL/api/auth/register" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not responding at $BACKEND_URL${NC}"
    echo "   Please make sure the backend is running: npm run start:dev"
    exit 1
fi

# Step 2: Register user (this creates OASIS avatar)
echo ""
echo "🔍 Step 2: Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"username\": \"$TEST_USERNAME\",
        \"firstName\": \"Test\",
        \"lastName\": \"User\"
    }")

echo "Register response: $REGISTER_RESPONSE" | head -c 500
echo ""

# Check if registration was successful
if echo "$REGISTER_RESPONSE" | grep -q "success\|token\|accessToken"; then
    echo -e "${GREEN}✅ User registered successfully${NC}"
    
    # Extract token if available
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || \
            echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 || \
            echo "")
    
    if [ -z "$TOKEN" ]; then
        echo -e "${YELLOW}⚠️  No token found in response. You may need to login separately.${NC}"
        echo ""
        echo "🔍 Step 2b: Attempting login..."
        LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
            -H "Content-Type: application/json" \
            -d "{
                \"email\": \"$TEST_EMAIL\",
                \"password\": \"$TEST_PASSWORD\"
            }")
        
        echo "Login response: $LOGIN_RESPONSE" | head -c 500
        echo ""
        
        TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || \
                echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 || \
                echo "")
    fi
else
    echo -e "${RED}❌ Registration failed${NC}"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

# Step 3: Generate wallet
echo ""
echo "🔍 Step 3: Generating Solana wallet..."

if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}⚠️  No token available. Testing without authentication...${NC}"
    echo "   (This will fail if JwksJwtGuard is enabled)"
    WALLET_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/wallet/generate" \
        -H "Content-Type: application/json" \
        -d "{
            \"providerType\": \"SolanaOASIS\",
            \"setAsDefault\": true
        }")
else
    echo -e "${GREEN}✅ Using token for authentication${NC}"
    WALLET_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/wallet/generate" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{
            \"providerType\": \"SolanaOASIS\",
            \"setAsDefault\": true
        }")
fi

echo "Wallet generation response:"
echo "$WALLET_RESPONSE" | jq '.' 2>/dev/null || echo "$WALLET_RESPONSE"
echo ""

# Check if wallet generation was successful
if echo "$WALLET_RESPONSE" | grep -q "success\|walletId\|walletAddress"; then
    echo -e "${GREEN}✅ Wallet generated successfully!${NC}"
    
    # Extract wallet details
    WALLET_ID=$(echo "$WALLET_RESPONSE" | grep -o '"walletId":"[^"]*"' | cut -d'"' -f4 || echo "")
    WALLET_ADDRESS=$(echo "$WALLET_RESPONSE" | grep -o '"walletAddress":"[^"]*"' | cut -d'"' -f4 || echo "")
    
    if [ ! -z "$WALLET_ID" ]; then
        echo ""
        echo "📊 Wallet Details:"
        echo "   Wallet ID: $WALLET_ID"
        [ ! -z "$WALLET_ADDRESS" ] && echo "   Wallet Address: $WALLET_ADDRESS"
    fi
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "✅ TEST PASSED"
    echo "==========================================${NC}"
    exit 0
else
    echo -e "${RED}❌ Wallet generation failed${NC}"
    echo ""
    echo "Error details:"
    echo "$WALLET_RESPONSE" | jq '.' 2>/dev/null || echo "$WALLET_RESPONSE"
    echo ""
    echo -e "${RED}=========================================="
    echo "❌ TEST FAILED"
    echo "==========================================${NC}"
    exit 1
fi


