# Oditit Dashboard - Testing & Startup Guide

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd /Users/anmolsarda/Desktop/codebase/repo/ouditit
npm run start:dev
```

**Expected Output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] PrismaModule dependencies initialized
[Nest] INFO [RoutesResolver] Mapped {/api/v1/auth/login, POST} route
[Nest] INFO [NestApplication] Nest application successfully started on port 3000
```

### 2. Start Dashboard
```bash
cd /Users/anmolsarda/Desktop/codebase/repo/oditit_dashboard
npm run dev
```

**Expected Output:**
```
VITE v7.2.4  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/v1
- **Swagger Docs:** http://localhost:3000/api/v1/docs

---

## 🧪 Testing Checklist

### Authentication Flow

#### 1. Registration
1. Navigate to http://localhost:5173/register
2. Fill in the form:
   - Email: `test@example.com`
   - Name: `Test User`
   - Password: `Password123!`
   - Organization Name: `Test Organization`
3. Click "Register"
4. ✅ Should redirect to login page
5. ✅ Check backend logs for user creation

#### 2. Login
1. Navigate to http://localhost:5173/login
2. Enter credentials:
   - Email: `admin@acme.com`
   - Password: `Password123!`
3. Click "Login"
4. ✅ Should redirect to dashboard
5. ✅ Check localStorage for tokens:
   ```javascript
   localStorage.getItem('accessToken')
   localStorage.getItem('refreshToken')
   ```

#### 3. Token Refresh
1. Wait for token to expire (15 minutes) OR manually expire it
2. Make an API call
3. ✅ Should auto-refresh and retry the request
4. ✅ Check Network tab for `/auth/refresh` call

### Dashboard Page

#### 1. View Dashboard Stats
1. Navigate to http://localhost:5173
2. ✅ See 4 metric cards (Total Controls, Completed, In Progress, Not Started)
3. ✅ Compliance score circular progress shows
4. ✅ Active frameworks list displays
5. ✅ Recent activity feed shows

#### 2. Framework Progress
1. Check each active framework card
2. ✅ Progress bar shows correct percentage
3. ✅ Control counts display
4. ✅ Next assessment date shows

#### 3. Quick Actions
1. Click each quick action button
2. ✅ Navigate to correct pages

### Frameworks Page

#### 1. View Available Frameworks
1. Navigate to http://localhost:5173/frameworks
2. ✅ See catalog of available frameworks (ISO 27001, SOC 2, etc.)
3. ✅ Search works
4. ✅ Framework details show (name, code, control count)

#### 2. Activate Framework
1. Click "Activate Framework" on ISO 27001
2. ✅ Modal opens with framework details
3. Click "Activate"
4. ✅ Framework moves to active section
5. ✅ Dashboard updates with new framework
6. ✅ Check backend:
   ```bash
   # In ouditit directory
   npx prisma studio
   # Navigate to organization_frameworks table
   ```

#### 3. View Active Framework
1. Check active frameworks section
2. ✅ Progress bar shows
3. ✅ Stats display (controls, policies, procedures)
4. ✅ Owner and next review date show
5. Click "View Controls"
6. ✅ Redirects to controls page with filter

### Controls Page

#### 1. List Controls
1. Navigate to http://localhost:5173/controls
2. ✅ Table displays with columns: ID, Name, Framework, Status, Progress, Owner
3. ✅ Pagination works (if more than 20 controls)

#### 2. Search & Filter
1. Enter search term: `access control`
2. ✅ Results filter immediately
3. Select status: `DRAFT`
4. ✅ Only draft controls show
5. Select framework filter
6. ✅ Only controls from that framework show

#### 3. View Control Details
1. Click on any control row
2. ✅ Modal opens with tabs
3. Check "Details" tab:
   - ✅ Control ID, status, implementation %
   - ✅ Description and guidance show
4. Check "Subcontrols" tab:
   - ✅ List of subcontrols displays
   - ✅ Each shows status and progress
5. Check "Evidence" tab:
   - ✅ Placeholder message shows
6. Check "History" tab:
   - ✅ Placeholder message shows

#### 4. Update Control Status
1. Click "Update" button on a control
2. ✅ Status modal opens
3. Change status to `UPLOADED`
4. Move progress slider to 50%
5. Add context text
6. Click "Update Status"
7. ✅ Modal closes
8. ✅ Table updates with new status
9. ✅ Dashboard stats update
10. ✅ Check backend via Prisma Studio

### Evidence Page

#### 1. Upload Evidence
1. Navigate to http://localhost:5173/evidence
2. Click "Upload Evidence"
3. ✅ Modal opens
4. Fill form:
   - Name: `Test Evidence`
   - Description: `Test description`
5. Drag & drop a file OR click to browse
6. ✅ File appears in selected files list
7. Click "Upload"
8. ✅ Evidence appears in table
9. ✅ Check backend for S3 upload (if configured)

#### 2. View Evidence List
1. ✅ Table shows: Name, Description, Files count, Date, Owner
2. ✅ Search works
3. ✅ File count badge displays correctly

#### 3. Delete Evidence
1. Click trash icon on an evidence
2. ✅ Confirmation modal opens
3. Click "Delete"
4. ✅ Evidence removes from list
5. ✅ Check backend via Prisma Studio

### Vendors (TPRM) Page

#### 1. Create Vendor
1. Navigate to http://localhost:5173/vendors
2. Click "Add Vendor"
3. ✅ Modal opens
4. Fill form:
   - Vendor Name: `Test Vendor Inc`
   - Email: `contact@testvendor.com`
   - Industry: `Technology`
   - Status: `ACTIVE`
   - Start Date: Today's date
   - Expiration Date: 1 year from now
5. Click "Create Vendor"
6. ✅ Vendor appears in table

#### 2. View Vendor Details
1. Click on vendor row
2. ✅ Modal opens with tabs
3. Check "Overview" tab:
   - ✅ All details display correctly
4. Check "Questionnaire" tab:
   - ✅ Placeholder shows
5. Check "Evidence" tab:
   - ✅ Placeholder shows
6. Check "Notes" tab:
   - ✅ Placeholder shows

#### 3. Filter Vendors
1. Search for vendor name
2. ✅ Results filter
3. Change status filter
4. ✅ Only vendors with that status show

### Policies Page

#### 1. Create Policy
1. Navigate to http://localhost:5173/policies
2. Click "Create Policy"
3. ✅ Modal opens
4. Fill form:
   - Name: `Information Security Policy`
   - Description: `Defines security practices`
   - Content: (some policy text)
5. Click "Create Policy"
6. ✅ Policy appears in table

#### 2. View Policy Details
1. Click on policy row
2. ✅ Modal opens with tabs
3. Check "Details" tab:
   - ✅ Owner, reviewer, dates show
4. Check "Versions" tab:
   - ✅ Version 1 shows
5. Check "Procedures" tab:
   - ✅ Placeholder shows

#### 3. Search Policies
1. Enter search term
2. ✅ Results filter correctly

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to fetch" errors
**Solution:**
```bash
# Check backend is running
curl http://localhost:3000/api/v1/health

# Check CORS settings in backend
# Ensure FRONTEND_URL in .env matches http://localhost:5173
```

### Issue: "Unauthorized" on all requests
**Solution:**
```javascript
// Open browser console
// Check if token exists
localStorage.getItem('accessToken')

// If null, login again
// If exists, check if expired (open JWT.io and paste token)
```

### Issue: No data shows on dashboard
**Solution:**
```bash
# Check if seed data loaded
cd ouditit
npx prisma studio

# Check tables:
# - users (should have admin@acme.com)
# - organizations (should have Acme Corporation)
# - frameworks (should have ISO 27001, SOC 2, etc.)

# If empty, re-run seed
npm run prisma:seed
```

### Issue: File upload fails
**Solution:**
```bash
# Check S3 configuration in backend .env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET_NAME=your-bucket

# Or check multer temp directory exists
mkdir -p /tmp/uploads
```

### Issue: Cannot activate framework
**Solution:**
```bash
# Check backend logs for errors
# Ensure organization_frameworks table exists
# Check user has proper role (ADMIN or CISO)
```

---

## 📊 Test Data

### Seed Users (Password: `Password123!`)
```
superadmin@oditit.com    - Super Admin
admin@acme.com           - Admin (Acme Corp)
ciso@acme.com            - CISO (Acme Corp)
security@acme.com        - Security Team (Acme Corp)
admin@techstart.in       - Admin (TechStart India)
```

### Frameworks Available
- ISO 27001:2022
- SOC 2
- HIPAA
- GDPR
- NIST Cybersecurity Framework
- And more...

---

## 🎯 Performance Benchmarks

### Page Load Times (Development)
- Dashboard: < 500ms
- Controls List: < 800ms
- Framework Catalog: < 300ms
- Evidence List: < 400ms

### API Response Times
- GET /dashboard/summary: < 200ms
- GET /controls: < 300ms
- POST /evidence: < 1s (with file upload)
- PATCH /controls/:id/status: < 150ms

---

## 🔍 Debugging Tips

### Enable React Query Devtools
```tsx
// Add to src/App.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Inside QueryClientProvider
<QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <Routes>...</Routes>
  </BrowserRouter>
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Check API Calls in Network Tab
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for status codes:
   - 200: Success
   - 401: Unauthorized (token issue)
   - 403: Forbidden (permissions issue)
   - 404: Not found
   - 500: Server error

### View Backend Logs
```bash
# In ouditit directory
npm run start:dev

# Watch logs in real-time
# Errors will show in red
# Successful requests show as [GET/POST/PATCH] routes
```

### Check Database State
```bash
# Open Prisma Studio
cd ouditit
npx prisma studio

# Navigate browser to: http://localhost:5555
# Browse all tables and data
```

---

## ✅ Final Checklist

### Before Deployment
- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] Backend tests pass
- [ ] Frontend builds without errors
- [ ] All critical flows tested
- [ ] Performance benchmarks met
- [ ] Security review complete
- [ ] Documentation updated

### Production Readiness
- [ ] Remove console.logs
- [ ] Enable production mode
- [ ] Configure proper CORS
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for static assets
- [ ] Enable rate limiting
- [ ] Set up monitoring (Datadog, New Relic)
- [ ] Configure backup strategy

---

**Last Updated:** Feb 10, 2026
**Version:** 2.0.0
**Status:** ✅ Ready for Testing
