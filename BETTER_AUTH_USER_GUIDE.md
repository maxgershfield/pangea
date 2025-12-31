# Better-Auth User Guide

Complete documentation for email/password authentication in Pangea Markets Backend.

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
4. [Sign Up](#sign-up)
5. [Sign In](#sign-in)
6. [Session Management](#session-management)
7. [Error Handling](#error-handling)
8. [Examples](#examples)

## Overview

The Pangea Markets backend uses Better-Auth for email/password authentication. Users can sign up, sign in, and receive JWT access tokens for authenticated requests.

**Base URL:** `https://pangea-production-128d.up.railway.app/api`

## Authentication Flow

1. **Sign Up**: Create a new user account with email and password
2. **Sign In**: Authenticate with email and password to receive access token
3. **Use Token**: Include the access token in Authorization header for protected endpoints

## API Endpoints

### Authentication Endpoints

All authentication endpoints are prefixed with `/api/auth`:

- `POST /api/auth/sign-up/email` - Create new user account
- `POST /api/auth/sign-in/email` - Sign in with email/password
- `GET /api/auth/session` - Get current session (if authenticated)

## Sign Up

Create a new user account.

### Endpoint

```
POST /api/auth/sign-up/email
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Fields:**
- `email` (required): Valid email address
- `password` (required): Password (minimum 8 characters recommended)
- `name` (optional): User's full name

### Response (Success - 200/201)

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2025-12-31T18:00:00.000Z",
    "updatedAt": "2025-12-31T18:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpiresAt": "2026-01-07T18:00:00.000Z"
}
```

**Fields:**
- `user`: User object with profile information
- `accessToken`: JWT token for authenticated requests
- `tokenExpiresAt`: Token expiration timestamp

### Response (Error - 400)

```json
{
  "code": "EMAIL_ALREADY_EXISTS",
  "message": "An account with this email already exists"
}
```

### Example Request (cURL)

```bash
curl -X POST https://pangea-production-128d.up.railway.app/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'
```

### Example Request (JavaScript/Fetch)

```javascript
const response = await fetch('https://pangea-production-128d.up.railway.app/api/auth/sign-up/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    password: 'SecurePassword123!',
    name: 'John Doe'
  })
});

const data = await response.json();
if (response.ok) {
  console.log('User created:', data.user);
  console.log('Access token:', data.accessToken);
  // Store the token for future requests
  localStorage.setItem('accessToken', data.accessToken);
} else {
  console.error('Error:', data.message);
}
```

## Sign In

Authenticate with email and password to receive an access token.

### Endpoint

```
POST /api/auth/sign-in/email
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Fields:**
- `email` (required): User's email address
- `password` (required): User's password

### Response (Success - 200)

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2025-12-31T18:00:00.000Z",
    "updatedAt": "2025-12-31T18:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpiresAt": "2026-01-07T18:00:00.000Z"
}
```

### Response (Error - 401)

```json
{
  "code": "INVALID_EMAIL_OR_PASSWORD",
  "message": "Invalid email or password"
}
```

### Example Request (cURL)

```bash
curl -X POST https://pangea-production-128d.up.railway.app/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

### Example Request (JavaScript/Fetch)

```javascript
const response = await fetch('https://pangea-production-128d.up.railway.app/api/auth/sign-in/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    password: 'SecurePassword123!'
  })
});

const data = await response.json();
if (response.ok) {
  console.log('Signed in:', data.user);
  console.log('Access token:', data.accessToken);
  // Store the token for future requests
  localStorage.setItem('accessToken', data.accessToken);
} else {
  console.error('Error:', data.message);
}
```

## Session Management

### Getting Current Session

Check if user is authenticated and get current session information.

### Endpoint

```
GET /api/auth/session
```

### Request Headers

```
Authorization: Bearer <accessToken>
```

### Response (Success - 200)

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "session": {
    "id": "session-id",
    "token": "session-token",
    "expiresAt": "2026-01-07T18:00:00.000Z"
  }
}
```

### Response (Error - 401)

```json
{
  "code": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

### Example Request (JavaScript/Fetch)

```javascript
const token = localStorage.getItem('accessToken');

const response = await fetch('https://pangea-production-128d.up.railway.app/api/auth/session', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
if (response.ok) {
  console.log('Current user:', data.user);
} else {
  // Token expired or invalid, redirect to login
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
}
```

## Using Access Tokens

Include the access token in the `Authorization` header for protected endpoints.

### Header Format

```
Authorization: Bearer <accessToken>
```

### Example: Making Authenticated Requests

```javascript
const token = localStorage.getItem('accessToken');

const response = await fetch('https://pangea-production-128d.up.railway.app/api/orders', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const orders = await response.json();
```

## Error Handling

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_EMAIL_OR_PASSWORD` | 401 | Email or password is incorrect |
| `EMAIL_ALREADY_EXISTS` | 400 | Email is already registered |
| `INVALID_EMAIL` | 400 | Email format is invalid |
| `UNAUTHORIZED` | 401 | Token is missing, invalid, or expired |
| `PASSWORD_TOO_SHORT` | 400 | Password doesn't meet minimum length requirement |

### Error Response Format

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Handling Errors in JavaScript

```javascript
try {
  const response = await fetch('https://pangea-production-128d.up.railway.app/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    switch (data.code) {
      case 'INVALID_EMAIL_OR_PASSWORD':
        alert('Invalid email or password. Please try again.');
        break;
      case 'INVALID_EMAIL':
        alert('Please enter a valid email address.');
        break;
      default:
        alert(`Error: ${data.message}`);
    }
    return;
  }

  // Success - handle token and user data
  localStorage.setItem('accessToken', data.accessToken);
  // Redirect or update UI

} catch (error) {
  console.error('Network error:', error);
  alert('Network error. Please check your connection.');
}
```

## Complete Examples

### Full Authentication Flow (JavaScript)

```javascript
class AuthService {
  constructor(baseURL) {
    this.baseURL = baseURL || 'https://pangea-production-128d.up.railway.app/api';
  }

  async signUp(email, password, name) {
    const response = await fetch(`${this.baseURL}/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      return { success: true, user: data.user, token: data.accessToken };
    } else {
      return { success: false, error: data.message, code: data.code };
    }
  }

  async signIn(email, password) {
    const response = await fetch(`${this.baseURL}/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      return { success: true, user: data.user, token: data.accessToken };
    } else {
      return { success: false, error: data.message, code: data.code };
    }
  }

  async getSession() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const response = await fetch(`${this.baseURL}/auth/session`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, user: data.user, session: data.session };
    } else {
      localStorage.removeItem('accessToken');
      return { success: false, error: data.message };
    }
  }

  signOut() {
    localStorage.removeItem('accessToken');
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      this.signOut();
      throw new Error('Session expired');
    }

    return response.json();
  }
}

// Usage example
const auth = new AuthService();

// Sign up
const signUpResult = await auth.signUp(
  'john.doe@example.com',
  'SecurePassword123!',
  'John Doe'
);
if (signUpResult.success) {
  console.log('Signed up:', signUpResult.user);
}

// Sign in
const signInResult = await auth.signIn(
  'john.doe@example.com',
  'SecurePassword123!'
);
if (signInResult.success) {
  console.log('Signed in:', signInResult.user);
}

// Check session
const session = await auth.getSession();
if (session.success) {
  console.log('Current user:', session.user);
}

// Make authenticated request
try {
  const orders = await auth.makeAuthenticatedRequest(
    'https://pangea-production-128d.up.railway.app/api/orders'
  );
  console.log('Orders:', orders);
} catch (error) {
  console.error('Request failed:', error);
}
```

### React Hook Example

```javascript
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = new AuthService(); // Use AuthService from above

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const session = await auth.getSession();
    if (session.success) {
      setUser(session.user);
    }
    setLoading(false);
  }

  async function signUp(email, password, name) {
    const result = await auth.signUp(email, password, name);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  }

  async function signIn(email, password) {
    const result = await auth.signIn(email, password);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  }

  function signOut() {
    auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Usage in component
function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await signIn(email, password);
    if (!result.success) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Sign In</button>
    </form>
  );
}
```

## Security Best Practices

1. **Store tokens securely**: Use `localStorage` for web apps, or secure storage for mobile apps
2. **HTTPS only**: Always use HTTPS in production (already configured)
3. **Token expiration**: Tokens expire after 7 days - handle refresh or re-authentication
4. **Password strength**: Enforce strong passwords on the client side
5. **Error messages**: Don't reveal if an email exists (generic error messages)
6. **CSRF protection**: Better-Auth handles CSRF protection automatically
7. **Rate limiting**: Consider implementing rate limiting for sign-in attempts

## Support

For issues or questions:
- Check error codes and messages in responses
- Verify email format and password requirements
- Ensure tokens are included in Authorization header
- Check token expiration time

## Notes

- Tokens expire after 7 days
- Email verification is currently disabled but can be enabled
- Passwords are hashed using secure algorithms
- Sessions are managed server-side with Better-Auth

