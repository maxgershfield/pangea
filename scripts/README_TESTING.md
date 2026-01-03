# Testing Scripts - Quick Start

## Start Services

### 1. Start OASIS API (Port 5003)
```bash
cd pangea-repo
./scripts/start-oasis-api.sh 5003
```

This will:
- Build the OASIS API project
- Start it on http://localhost:5003
- Keep it running in the foreground (press Ctrl+C to stop)

### 2. Start Pangea Backend (Port 3001)
```bash
cd pangea-repo
PORT=3001 npm run start:dev
```

Or use the helper script:
```bash
./scripts/start-backend.sh 3001
```

## Run Tests

### Test User Registration and Avatar Linking
```bash
cd pangea-repo
./scripts/test-user-registration-and-linking.sh
```

This test:
- ✅ Registers a new user
- ✅ Creates OASIS avatar
- ✅ Links Pangea User ID ↔ OASIS Avatar ID
- ✅ Verifies link in JWT token
- ✅ Tests login persistence
- ✅ Tests OASIS operations

### Test Email Verification Bypass
```bash
cd pangea-repo
./scripts/test-email-verification-bypass.sh
```

## Configuration

The test scripts use these defaults:
- **Pangea Backend**: http://localhost:3001
- **OASIS API**: http://localhost:5003

You can override with environment variables:
```bash
BACKEND_URL=http://localhost:3002 OASIS_API_URL=http://localhost:5004 ./scripts/test-user-registration-and-linking.sh
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5003
lsof -i :3001

# Kill the process
kill -9 $(lsof -ti:5003)
```

### OASIS API Not Starting
- Check .NET SDK is installed: `dotnet --version`
- Check the project builds: `cd ONODE/NextGenSoftware.OASIS.API.ONODE.WebAPI && dotnet build`
- Check port 5003 is available

### Backend Not Starting
- Check Node.js is installed: `node --version`
- Check dependencies: `npm install`
- Check port 3001 is available

