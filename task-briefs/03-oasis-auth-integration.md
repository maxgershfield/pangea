# Task Brief: OASIS Authentication Integration

**Phase:** 1 - Foundation  
**Priority:** Critical  
**Estimated Time:** 2-3 days  
**Dependencies:** Task 01 (Project Setup), Task 02 (Database Schema)

---

## Overview

Integrate OASIS Avatar API for user authentication, registration, and session management. This replaces the need to build custom authentication from scratch.

---

## Requirements

### 1. OASIS Avatar API Integration

Integrate with OASIS Avatar API endpoints:

- `POST /api/avatar/register` - User registration
- `POST /api/avatar/authenticate` - User login
- `POST /api/avatar/refresh-token` - Refresh JWT token
- `GET /api/avatar/{avatarId}` - Get user profile
- `PUT /api/avatar/{avatarId}` - Update user profile
- `POST /api/avatar/forgot-password` - Password reset request
- `POST /api/avatar/reset-password` - Reset password

### 2. Service Layer

Create an authentication service that:
- Wraps OASIS API calls
- Maps OASIS "Avatar" concept to Pangea "User"
- Handles JWT token management
- Syncs user data to local database

### 3. API Endpoints

Create Pangea API endpoints that proxy to OASIS:

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/user/profile
PUT    /api/user/profile
```

---

## Technical Specifications

### OASIS API Client Service

```typescript
// services/oasis-auth.service.ts
import axios from 'axios';

class OasisAuthService {
  private baseUrl = process.env.OASIS_API_URL || 'https://api.oasisplatform.world';
  private apiKey = process.env.OASIS_API_KEY;

  async register(data: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }) {
    const response = await axios.post(
      `${this.baseUrl}/api/avatar/register`,
      {
        email: data.email,
        password: data.password,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await axios.post(
      `${this.baseUrl}/api/avatar/authenticate`,
      {
        email,
        password
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    
    return response.data;
  }

  async getUserProfile(avatarId: string) {
    const response = await axios.get(
      `${this.baseUrl}/api/avatar/${avatarId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    
    return response.data;
  }
}
```

### User Sync Service

```typescript
// services/user-sync.service.ts
class UserSyncService {
  async syncOasisUserToLocal(oasisAvatar: any): Promise<User> {
    // Map OASIS Avatar to local User model
    // Store in local database
    // Link wallet addresses if available
  }
}
```

### Authentication Controller

```typescript
// controllers/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(
    private oasisAuthService: OasisAuthService,
    private userSyncService: UserSyncService
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    // 1. Call OASIS API
    const oasisResult = await this.oasisAuthService.register(dto);
    
    // 2. Sync to local database
    const user = await this.userSyncService.syncOasisUserToLocal(
      oasisResult.result
    );
    
    // 3. Return JWT token
    return {
      user,
      token: oasisResult.result.token
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    // Similar flow
  }
}
```

### JWT Guard

```typescript
// guards/jwt.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Validate JWT token from OASIS
    // Extract user info
    // Attach to request
  }
}
```

---

## Acceptance Criteria

- [ ] OASIS API client service created
- [ ] User registration endpoint working
- [ ] User login endpoint working
- [ ] JWT token validation working
- [ ] User data synced to local database
- [ ] Password reset flow working
- [ ] Profile endpoints working
- [ ] JWT guard protecting routes
- [ ] Error handling for OASIS API failures
- [ ] Unit tests for auth service

---

## Deliverables

1. OASIS API client service
2. Authentication controller with all endpoints
3. User sync service
4. JWT authentication guard
5. Error handling middleware
6. Unit tests

---

## References

- OASIS API Documentation: `../OASIS_API_REUSE_ANALYSIS.md` Section 3.1
- Main Implementation Plan: `../IMPLEMENTATION_PLAN.md` Section 3.1
- OASIS Avatar API: `/Volumes/Storage 4/OASIS_CLEAN/Docs/Devs/API Documentation/WEB4 OASIS API/Avatar-API.md`

---

## Notes

- Store OASIS avatar ID in local user table for linking
- Handle OASIS API failures gracefully
- Cache user data locally to reduce OASIS API calls
- Consider rate limiting for OASIS API calls
- Map OASIS error responses to user-friendly messages
