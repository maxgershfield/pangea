#!/bin/bash

# Test Remote OASIS API Connection
# This script verifies that the backend can connect to the remote OASIS API

set -e

OASIS_API_URL="${OASIS_API_URL:-https://api.oasisweb4.com}"

echo "=========================================="
echo "REMOTE OASIS API CONNECTION TEST"
echo "=========================================="
echo ""
echo "OASIS API URL: ${OASIS_API_URL}"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Test Health Endpoint
echo "🔍 Step 1: Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s "${OASIS_API_URL}/api/Health")
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${OASIS_API_URL}/api/Health")

if [ "$HEALTH_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✅ Health endpoint is accessible${NC}"
  echo "Response: ${HEALTH_RESPONSE}"
else
  echo -e "${RED}❌ Health endpoint failed (Status: ${HEALTH_STATUS})${NC}"
  exit 1
fi
echo ""

# Step 2: Test Swagger/OpenAPI Endpoint
echo "🔍 Step 2: Testing Swagger Endpoint..."
SWAGGER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${OASIS_API_URL}/swagger/index.html" || echo "000")

if [ "$SWAGGER_STATUS" -eq 200 ]; then
  echo -e "${GREEN}✅ Swagger documentation is accessible${NC}"
  echo "   URL: ${OASIS_API_URL}/swagger/index.html"
else
  echo -e "${YELLOW}⚠️  Swagger endpoint not accessible (Status: ${SWAGGER_STATUS})${NC}"
  echo "   This is optional - API may still work"
fi
echo ""

# Step 3: Test API Base URL (check if it's HTTPS)
echo "🔍 Step 3: Verifying API URL configuration..."
if [[ "$OASIS_API_URL" == https://* ]]; then
  echo -e "${GREEN}✅ Using HTTPS (secure connection)${NC}"
elif [[ "$OASIS_API_URL" == http://* ]]; then
  echo -e "${YELLOW}⚠️  Using HTTP (not secure)${NC}"
  echo "   Consider using HTTPS for production: https://api.oasisweb4.com"
else
  echo -e "${RED}❌ Invalid URL format${NC}"
  exit 1
fi
echo ""

# Step 4: Test SSL Certificate (if HTTPS)
if [[ "$OASIS_API_URL" == https://* ]]; then
  echo "🔍 Step 4: Verifying SSL Certificate..."
  SSL_CHECK=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${OASIS_API_URL}/api/Health" 2>&1)
  if echo "$SSL_CHECK" | grep -q "200"; then
    echo -e "${GREEN}✅ SSL certificate is valid${NC}"
  else
    echo -e "${YELLOW}⚠️  SSL certificate check inconclusive${NC}"
  fi
  echo ""
fi

# Step 5: Test Response Time
echo "🔍 Step 5: Testing Response Time..."
START_TIME=$(date +%s%N)
curl -s "${OASIS_API_URL}/api/Health" > /dev/null
END_TIME=$(date +%s%N)
DURATION=$((($END_TIME - $START_TIME) / 1000000)) # Convert to milliseconds

if [ $DURATION -lt 1000 ]; then
  echo -e "${GREEN}✅ Response time: ${DURATION}ms (excellent)${NC}"
elif [ $DURATION -lt 3000 ]; then
  echo -e "${GREEN}✅ Response time: ${DURATION}ms (good)${NC}"
elif [ $DURATION -lt 5000 ]; then
  echo -e "${YELLOW}⚠️  Response time: ${DURATION}ms (acceptable)${NC}"
else
  echo -e "${YELLOW}⚠️  Response time: ${DURATION}ms (slow)${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}✅ Remote OASIS API is accessible${NC}"
echo "   URL: ${OASIS_API_URL}"
echo "   Health Status: OK"
echo ""
echo "Next steps:"
echo "  1. Update backend .env file: OASIS_API_URL=${OASIS_API_URL}"
echo "  2. Restart backend to use remote API"
echo "  3. Run test scripts to verify integration"
echo ""

