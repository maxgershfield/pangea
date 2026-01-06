# How to Access Swagger/OpenAPI Documentation

**Quick Guide:** Accessing the interactive API documentation

---

## 🚀 Quick Start

### Step 1: Start the Server

```bash
cd /Users/maxgershfield/OASIS_CLEAN/pangea-repo
npm run start:dev
```

**Expected Output:**
```
Pangea Markets Backend is running on: http://0.0.0.0:3000/api
```

### Step 2: Open Swagger UI

Open your browser and navigate to:

```
http://localhost:3000/docs
```

**That's it!** The Swagger UI will load with all API documentation.

---

## 📍 Documentation URLs

### Local Development
```
http://localhost:3000/docs
```

### Production (if deployed)
```
https://api.pangeamarkets.com/docs
```

---

## 🎯 What You'll See

The Swagger UI provides:

1. **Interactive API Documentation**
   - All endpoints organized by tags (Wallet, Transactions, Orders, etc.)
   - Request/response schemas
   - Parameter descriptions
   - Examples

2. **Try It Out Feature**
   - Click "Try it out" on any endpoint
   - Fill in parameters
   - Execute requests directly from the browser
   - See real responses

3. **Authentication**
   - Click the "Authorize" button (🔒) at the top
   - Enter your JWT token
   - All authenticated endpoints will use this token

---

## 🔐 Using Authentication in Swagger

### Step 1: Get Your JWT Token

First, authenticate via Better Auth to get a JWT token (this depends on your frontend/auth setup).

### Step 2: Authorize in Swagger

1. Click the **"Authorize"** button (🔒) at the top right of Swagger UI
2. In the "JWT-auth" section, enter your token:
   ```
   Bearer YOUR_JWT_TOKEN_HERE
   ```
   Or just:
   ```
   YOUR_JWT_TOKEN_HERE
   ```
3. Click **"Authorize"**
4. Click **"Close"**

Now all authenticated endpoints will use this token automatically!

---

## 📖 Navigating the Documentation

### Endpoint Groups (Tags)

- **Wallet** - Wallet management and balance queries
- **Transactions** - Deposit and withdrawal operations
- **Orders** - Order creation and management
- **Trades** - Trade execution and history
- **Assets** - Asset management
- **Auth** - Authentication endpoints

### Finding Specific Endpoints

1. **By Tag:** Click on a tag name to filter endpoints
2. **By Search:** Use browser search (Cmd/Ctrl + F) to find specific endpoints
3. **By Expand:** Click on an endpoint to see details

---

## 🧪 Testing Endpoints

### Example: Generate a Wallet

1. Navigate to **Wallet** section
2. Find **POST /api/wallet/generate**
3. Click **"Try it out"**
4. Fill in the request body:
   ```json
   {
     "providerType": "SolanaOASIS",
     "setAsDefault": true
   }
   ```
5. Click **"Execute"**
6. See the response below

### Example: Get Balances

1. Navigate to **Wallet** section
2. Find **GET /api/wallet/balance**
3. Click **"Try it out"**
4. Make sure you're authorized (see authentication steps above)
5. Click **"Execute"**
6. See your wallet balances

---

## 🔍 Key Features

### 1. Request Examples

Each endpoint shows:
- Required parameters
- Optional parameters
- Example values
- Parameter descriptions

### 2. Response Schemas

Click on a response to see:
- Response structure
- Data types
- Example responses
- Error responses

### 3. Model Definitions

Scroll down to see all DTOs/models:
- `GenerateWalletDto`
- `WithdrawalDto`
- `CreateOrderDto`
- `TransactionResponseDto`
- etc.

---

## 💡 Tips

1. **Authorization Persists:** Once you authorize, the token is saved for the session
2. **Copy as cURL:** Click "Copy as cURL" to get the exact command
3. **Download OpenAPI Spec:** The raw OpenAPI JSON is available at `/docs-json`
4. **Filter by Tag:** Use the tag filter to focus on specific endpoint groups

---

## 🐛 Troubleshooting

### "Cannot GET /docs"

**Solution:** Make sure the server is running:
```bash
npm run start:dev
```

### "401 Unauthorized" when testing endpoints

**Solution:** 
1. Make sure you've authorized with a valid JWT token
2. Check that your token hasn't expired
3. Verify the token format: `Bearer YOUR_TOKEN` or just `YOUR_TOKEN`

### Server won't start

**Solution:**
1. Check if port 3000 is already in use
2. Verify environment variables are set
3. Check database connection
4. Review server logs for errors

---

## 📚 Additional Resources

- **User Guide:** `docs/RISHAV_COMPLETE_GUIDE.md` - Complete setup guide
- **Swagger Documentation:** `docs/SWAGGER_DOCUMENTATION_COMPLETE.md` - What's documented
- **NestJS OpenAPI Docs:** https://docs.nestjs.com/openapi/introduction

---

## 🎯 Quick Reference

| Action | Command/URL |
|--------|-------------|
| Start server | `npm run start:dev` |
| Access Swagger | `http://localhost:3000/docs` |
| OpenAPI JSON | `http://localhost:3000/docs-json` |
| Server URL | `http://localhost:3000/api` |

---

**Last Updated:** January 4, 2025  
**Status:** ✅ Ready to Use





