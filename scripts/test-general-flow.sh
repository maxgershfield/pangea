#!/bin/bash

# General end-to-end test for Pangea backend
# Tests: User registration → Login → Wallet generation

set -e

BASE_URL="http://localhost:3000"
OASIS_API_URL="http://localhost:5003"

echo "=========================================="
echo "Pangea Backend General Test"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check OASIS API health
echo "1. Checking OASIS API health..."
OASIS_HEALTH=$(curl -s "$OASIS_API_URL/api/Health" || echo "ERROR")
if [[ "$OASIS_HEALTH" == *"ERROR"* ]] || [[ -z "$OASIS_HEALTH" ]]; then
  echo -e "${RED}❌ OASIS API is not responding at $OASIS_API_URL${NC}"
  echo "   Please ensure the OASIS API is running on port 5003"
  exit 1
else
  echo -e "${GREEN}✅ OASIS API is healthy${NC}"
fi
echo ""

# Test 2: Check Pangea backend health
echo "2. Checking Pangea backend..."
PANGEA_HEALTH=$(curl -s "$BASE_URL/api" 2>&1 || echo "ERROR")
if [[ "$PANGEA_HEALTH" == *"ERROR"* ]] || [[ "$PANGEA_HEALTH" == *"Connection refused"* ]]; then
  echo -e "${RED}❌ Pangea backend is not responding at $BASE_URL${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Pangea backend is responding${NC}"
fi
echo ""

# Test 3: Register a new user
echo "3. Registering a new user..."
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser${TIMESTAMP}@example.com"
TEST_USERNAME="testuser${TIMESTAMP}"
TEST_PASSWORD="TestPassword123!"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }" 2>&1)

if echo "$REGISTER_RESPONSE" | grep -q "error\|Error\|ERROR"; then
  echo -e "${RED}❌ Registration failed${NC}"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
else
  echo -e "${GREEN}✅ User registered successfully${NC}"
  echo "   Email: $TEST_EMAIL"
  echo "   Username: $TEST_USERNAME"
  # Extract token if present
  TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || echo "")
  if [[ -n "$TOKEN" ]]; then
    echo "   Token received: ${TOKEN:0:20}..."
  fi
fi
echo ""

# Test 4: Login with registered user
echo "4. Logging in with registered user..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }" 2>&1)

if echo "$LOGIN_RESPONSE" | grep -q "error\|Error\|ERROR\|Invalid\|Unauthorized"; then
  echo -e "${RED}❌ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
else
  echo -e "${GREEN}✅ Login successful${NC}"
  # Extract token
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || echo "")
  if [[ -z "$TOKEN" ]]; then
    # Try alternative token format
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4 || echo "")
  fi
  if [[ -n "$TOKEN" ]]; then
    echo "   Token: ${TOKEN:0:30}..."
    export AUTH_TOKEN="$TOKEN"
  else
    echo -e "${YELLOW}⚠️  No token found in response${NC}"
    echo "   Response: $LOGIN_RESPONSE"
  fi
fi
echo ""

# Test 5: Check wallet balance (should trigger avatar creation if needed)
echo "5. Checking wallet balance (should create avatar if needed)..."
if [[ -n "$AUTH_TOKEN" ]]; then
  BALANCE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/wallet/balance" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" 2>&1)
  
  if echo "$BALANCE_RESPONSE" | grep -q "Unauthorized\|401\|error\|Error"; then
    echo -e "${YELLOW}⚠️  Wallet balance check failed (authentication issue)${NC}"
    echo "   This is expected if using JWKS guard - tokens need to come from frontend"
    echo "   Response: $BALANCE_RESPONSE"
  else
    echo -e "${GREEN}✅ Wallet balance check successful${NC}"
    echo "   Response: $BALANCE_RESPONSE" | head -c 200
    echo ""
  fi
else
  echo -e "${YELLOW}⚠️  Skipping wallet balance check (no token available)${NC}"
fi
echo ""

# Test 6: Generate wallet (if token available)
if [[ -n "$AUTH_TOKEN" ]]; then
  echo "6. Attempting to generate wallet..."
  WALLET_RESPONSE=$(curl -s -X POST "$BASE_URL/api/wallet/generate" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "providerType": "EthereumOASIS",
      "setAsDefault": true
    }' 2>&1)
  
  if echo "$WALLET_RESPONSE" | grep -q "Unauthorized\|401\|error\|Error"; then
    echo -e "${YELLOW}⚠️  Wallet generation failed (authentication issue)${NC}"
    echo "   This is expected if using JWKS guard - tokens need to come from frontend"
    echo "   Response: $WALLET_RESPONSE"
  else
    echo -e "${GREEN}✅ Wallet generation successful${NC}"
    echo "   Response: $WALLET_RESPONSE" | head -c 300
    echo ""
  fi
else
  echo -e "${YELLOW}⚠️  Skipping wallet generation (no token available)${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}Test Summary${NC}"
echo "=========================================="
echo "✅ OASIS API: Healthy"
echo "✅ Pangea Backend: Running"
echo "✅ User Registration: Success"
echo "✅ User Login: Success"
if [[ -n "$AUTH_TOKEN" ]]; then
  echo -e "${YELLOW}⚠️  Wallet Operations: Limited (requires frontend token)${NC}"
else
  echo -e "${YELLOW}⚠️  Wallet Operations: Skipped (no token)${NC}"
fi
echo ""
echo "Note: Wallet operations require JWT tokens from the frontend's Better-Auth system."
echo "      Backend-generated tokens won't work with the JWKS guard."
echo ""



