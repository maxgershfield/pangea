# Quick Start - Testing User Registration Flow

## Step 1: Start OASIS API

Open a terminal and run:
```bash
cd /Users/maxgershfield/OASIS_CLEAN/pangea-repo
./scripts/start-oasis-api.sh 5003
```

Wait for it to show:
```
🚀 OASIS API is running on: http://localhost:5003
```

**Keep this terminal open** - the API needs to keep running.

## Step 2: Start Pangea Backend

Open a **new terminal** and run:
```bash
cd /Users/maxgershfield/OASIS_CLEAN/pangea-repo
PORT=3001 npm run start:dev
```

Wait for it to show:
```
🚀 Pangea Markets Backend is running on: http://0.0.0.0:3001/api
```

**Keep this terminal open** too.

## Step 3: Run the Test

Open a **third terminal** and run:
```bash
cd /Users/maxgershfield/OASIS_CLEAN/pangea-repo
./scripts/test-user-registration-and-linking.sh
```

## What the Test Does

1. ✅ Checks backend is running
2. ✅ Checks OASIS API is running  
3. ✅ Registers a new user
4. ✅ Creates OASIS avatar
5. ✅ Links Pangea User ID ↔ OASIS Avatar ID
6. ✅ Verifies link in JWT token
7. ✅ Tests login (verifies link persists)
8. ✅ Tests OASIS operations

## Expected Output

You should see:
```
✅ Backend is running on http://localhost:3001
✅ OASIS API is reachable
✅ User registered successfully
   User ID (Pangea): [UUID]
   Avatar ID (OASIS): [UUID]
✅ Link established: [Pangea UUID] ↔ [OASIS UUID]
✅ ALL TESTS PASSED!
```

## Troubleshooting

### OASIS API won't start
- Make sure .NET SDK is installed: `dotnet --version`
- Check if port 5003 is free: `lsof -i :5003`
- Try building manually: `cd ../../ONODE/NextGenSoftware.OASIS.API.ONODE.WebAPI && dotnet build`

### Backend won't start
- Make sure Node.js is installed: `node --version`
- Check if port 3001 is free: `lsof -i :3001`
- Install dependencies: `npm install`

### Test fails
- Make sure both services are running
- Check the error message for details
- Verify OASIS API is accessible: `curl http://localhost:5003/api/Health`






