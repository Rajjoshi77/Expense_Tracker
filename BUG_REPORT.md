# Issue 1: Missing Authorization Token in Save Expense
**Title:** [BUG] Missing Authorization Token in Save Expense from Receipt

**Labels:** bug, critical, priority:high

**Description:**
When saving an expense from an OCR-scanned receipt, the request fails with 'Authorization token required' error.

## Root Cause
File: `expense-tracker/src/pages/Import.jsx` (Line 74-86)
The `handleSaveExpense` function uses raw `fetch()` instead of the API service, so the authorization token is not included.

## Steps to Reproduce
1. Navigate to Import page
2. Upload a receipt image
3. Click 'Scan Receipt & Extract'
4. Click 'Save Expense Record'
5. Error: 'Authorization token required'

## Expected Behavior
Expense should be saved successfully with auth token

## Solution
✅ FIXED - Use `expenseApi.create()` instead of raw fetch()

---

# Issue 2: CORS Configuration Only Allows Localhost - Breaks Production
**Title:** [BUG] CORS Configuration Only Allows Localhost - Breaks Production

**Labels:** bug, critical, priority:high, deployment

**Description:**
CORS is configured to only allow localhost origins. This will block all requests from production Vercel domain.

## Root Cause
File: `expense-tracker/server/index.js` (Line 19)
```javascript
cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true })
```

## Impact
- Production deployment on Vercel will have all cross-origin requests blocked
- API calls from frontend will fail with CORS error
- Application won't work in production

## Solution
Add production URL to CORS whitelist

---

# Issue 3: AuthContext Loading State Hardcoded to False
**Title:** [BUG] AuthContext Loading State Hardcoded to False

**Labels:** bug, priority:medium, ux

**Description:**
The AuthContext has `loading: false` hardcoded, so UI never shows loading indicators during authentication.

## Root Cause
File: `expense-tracker/src/context/AuthContext.jsx` (Line 65)
```javascript
value={{ user, loading: false, loginWithGoogle, ... }}
```

## Impact
- No loading spinner during Google login
- No loading spinner during sandbox login
- Poor UX - users don't know request is processing

---

# Issue 4: Add Validation for OCR-Extracted Receipt Data
**Title:** [ENHANCEMENT] Add Validation for OCR-Extracted Receipt Data

**Labels:** enhancement, priority:medium, validation

**Description:**
When saving expense from OCR, there's no validation that required fields are present or valid.

## Root Cause
File: `expense-tracker/src/pages/Import.jsx`
The `handleSaveExpense` function doesn't validate merchant, amount, date, category fields

## Impact
- Users can save incomplete/invalid receipt data
- Database gets corrupted data

---

# Issue 5: Unnecessary Type Field Sent for Income Records
**Title:** [BUG] Unnecessary Type Field Sent for Income Records

**Labels:** bug, priority:low, data-model

**Description:**
When creating income records, a 'type' field is sent even though income doesn't have a type.

## Root Cause
File: `expense-tracker/src/pages/Home.jsx` (Line 85)

## Impact
- Database stores unused data
- Inconsistent data model

---

# Issue 6: Memory Leak - URL.createObjectURL Not Revoked
**Title:** [BUG] Memory Leak: URL.createObjectURL Not Revoked

**Labels:** bug, priority:medium, performance

**Description:**
`URL.createObjectURL()` is called for receipt preview but never revoked, causing memory leak.

## Root Cause
File: `expense-tracker/src/pages/Import.jsx` (Line 31)

## Impact
- Memory leak in browser each time receipt is uploaded
- Performance degradation after multiple uploads

---

# Issue 7: Improve Error Messages in Import Component
**Title:** [ENHANCEMENT] Improve Error Messages and Logging in Import Component

**Labels:** enhancement, priority:low, error-handling

## Description
Catch blocks use generic error messages that don't help debugging.

---

# Issue 8: Add Auto-Logout on JWT Token Expiry
**Title:** [ENHANCEMENT] Add Auto-Logout on JWT Token Expiry

**Labels:** enhancement, priority:medium, security, auth

## Description
There's no handling for expired JWT tokens. User remains logged in with an invalid token.

---

# Issue 9: Add Rate Limiting to API Endpoints
**Title:** [SECURITY] Add Rate Limiting to API Endpoints

**Labels:** enhancement, security, priority:high

## Description
No rate limiting configured on backend API, vulnerable to DoS attacks and abuse.

---

# Issue 10: Centralize Category Configuration
**Title:** [REFACTOR] Centralize Category Configuration

**Labels:** enhancement, priority:low, refactor

## Description
Categories are hardcoded in multiple places instead of being centralized.

---

# Issue 11: Review CORS Credentials Configuration
**Title:** [SECURITY] Review CORS Credentials Configuration

**Labels:** security, priority:medium, review

## Description
CORS is configured with `credentials: true` without proper security validation.

---

# Issue 12: Improve Error Handling in AuthContext
**Title:** [ENHANCEMENT] Improve Error Handling in AuthContext

**Labels:** enhancement, priority:low, error-handling

## Description
Catch blocks in LoginWithGoogle and LoginWithSandbox could have better error details.
