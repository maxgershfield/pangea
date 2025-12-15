# Pangea Markets Frontend Analysis

## Overview
**URL:** https://pangea.rkund.com/home  
**Framework:** Next.js (based on `_next/static` assets)  
**Application Type:** Markets/Trading Platform with Authentication

## Frontend Structure

### Routes Identified
- `/` - Home/Landing page
- `/home` - Main dashboard (redirects to login if not authenticated)
- `/login` - Authentication page
- `/registration` - User registration
- `/forgot-password` - Password recovery

### Authentication Features
1. **Email/Password Login**
   - Email field (required)
   - Password field (required)
   - "Remember me" checkbox
   - Test credentials visible: `pangea_alliance@test.com` / `padmin`

2. **OAuth Integration**
   - Google Sign-In button available

3. **Password Recovery**
   - "Forgot password?" link
   - Route: `/forgot-password`

### UI Components
- Modern, clean design
- Custom fonts loaded (Season Collection, Univers Next Variable)
- Responsive layout with banner navigation
- Alert component present

## Backend Requirements (Inferred)

### Authentication Endpoints Needed
1. **POST /api/auth/login**
   - Email and password
   - Returns: JWT token or session
   - Should support "remember me" functionality

2. **POST /api/auth/register**
   - User registration endpoint
   - Email, password, possibly other fields

3. **POST /api/auth/forgot-password**
   - Password reset request
   - Email address

4. **POST /api/auth/reset-password**
   - Password reset with token

5. **GET /api/auth/google**
   - OAuth callback/initiation

6. **GET /api/user/profile** (protected)
   - User profile information

### Data Models (Likely)
- **User**
  - email (unique)
  - password (hashed)
  - createdAt
  - lastLogin
  - rememberMeToken (optional)

- **Session**
  - userId
  - token
  - expiresAt
  - rememberMe (boolean)

## Technology Stack Recommendations

### Backend Framework Options
1. **Node.js/Express** - Good Next.js integration
2. **Python/FastAPI** - Modern, fast API framework
3. **Node.js/NestJS** - Enterprise-grade structure

### Database
- PostgreSQL or MongoDB for user data
- Redis for session management (if using JWT with refresh tokens)

### Authentication
- JWT tokens for stateless auth
- bcrypt for password hashing
- Passport.js (Node) or similar for OAuth

## Next Steps
1. Check if backend repository exists
2. Identify current backend stack
3. Map out API endpoints
4. Set up development environment
5. Create backend structure matching frontend needs
