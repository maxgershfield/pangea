# Email Verification Bypass - Quick Reference

## 📁 Key Files

### Configuration
```
ONODE/NextGenSoftware.OASIS.API.ONODE.WebAPI/OASIS_DNA.json
└── "DoesAvatarNeedToBeVerifiedBeforeLogin": false
```

### Core Bypass Logic
```
OASIS Architecture/.../AvatarManager-Private.cs
└── ProcessAvatarLogin() [lines 1127-1141]
    ├── Check: OASISDNA?.OASIS?.Security?.DoesAvatarNeedToBeVerifiedBeforeLogin == false
    ├── Auto-Activate: IsActive = true
    └── Auto-Verify: Verified = DateTime.UtcNow
```

### Pangea Integration
```
pangea-repo/src/auth/services/
├── auth.service.ts          → Main orchestration
├── oasis-auth.service.ts    → OASIS API client
└── user-sync.service.ts     → User synchronization
```

## 🔄 Flow Summary

```
User Registration
├── Pangea Backend → OASIS API
├── Avatar Created (IsActive=false, IsVerified=false)
└── User + avatarId saved to Pangea DB

User Login (First Time)
├── Pangea Backend → OASIS API
├── ProcessAvatarLogin() checks config
├── Bypass enabled? → Auto-activate & verify
└── Authentication succeeds ✅

User Login (Subsequent)
├── Normal authentication flow
└── No verification checks needed
```

## ⚙️ Configuration

| Setting | Value | Effect |
|---------|-------|--------|
| `DoesAvatarNeedToBeVerifiedBeforeLogin` | `false` | ✅ Bypass enabled - auto-verify on login |
| `DoesAvatarNeedToBeVerifiedBeforeLogin` | `true` | ❌ Bypass disabled - require email verification |

## 🎯 Decision Point

```csharp
// In ProcessAvatarLogin()
if (!result.Result.IsVerified && 
    OASISDNA?.OASIS?.Security?.DoesAvatarNeedToBeVerifiedBeforeLogin == false)
{
    // Auto-activate and auto-verify
    result.Result.IsActive = true;
    result.Result.Verified = DateTime.UtcNow;
    SaveAvatar(result.Result);
}
```

## 📊 File Map

```
┌─────────────────────────────────────────────────────────┐
│                    OASIS API                             │
├─────────────────────────────────────────────────────────┤
│ OASIS_DNA.json (Config)                                 │
│   ↓                                                      │
│ AvatarController.cs (Endpoints)                         │
│   ↓                                                      │
│ AvatarManager.cs (Orchestration)                         │
│   ↓                                                      │
│ AvatarManager-Private.cs (Bypass Logic) ⭐              │
└─────────────────────────────────────────────────────────┘
                        ↕ HTTP
┌─────────────────────────────────────────────────────────┐
│                  Pangea Backend                         │
├─────────────────────────────────────────────────────────┤
│ auth.controller.ts (Endpoints)                          │
│   ↓                                                      │
│ auth.service.ts (Orchestration)                         │
│   ↓                                                      │
│ oasis-auth.service.ts (OASIS Client)                    │
│   ↓                                                      │
│ user-sync.service.ts (Sync)                             │
│   ↓                                                      │
│ user.entity.ts (Database Model)                         │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Where Bypass Happens

**File**: `AvatarManager-Private.cs`  
**Method**: `ProcessAvatarLogin()`  
**Lines**: 1127-1141

```csharp
// Line 1127: Check if verification is disabled
if (!result.Result.IsVerified && 
    OASISDNA?.OASIS?.Security?.DoesAvatarNeedToBeVerifiedBeforeLogin == false)
{
    // Lines 1131-1135: Auto-activate
    if (!result.Result.IsActive)
        result.Result.IsActive = true;
    
    // Line 1135: Auto-verify
    result.Result.Verified = DateTime.UtcNow;
    
    // Line 1136: Save changes
    SaveAvatar(result.Result);
}
```

---

**See full architecture diagram**: `EMAIL_VERIFICATION_BYPASS_ARCHITECTURE.md`






