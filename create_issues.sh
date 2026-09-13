#!/bin/bash

# Script to create GitHub issues for Expense Tracker bugs
# Usage: chmod +x create_issues.sh && ./create_issues.sh

# Set your GitHub token and repo details
OWNER="Rajjoshi77"
REPO="Expense_Tracker"
TOKEN="${GITHUB_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable not set"
  exit 1
fi

# Function to create an issue
create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"
  
  curl -X POST \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/repos/$OWNER/$REPO/issues \
    -d "{\"title\":\"$title\",\"body\":\"$body\",\"labels\":[$labels]}"
  
  echo "✓ Created issue: $title"
}

# Issue 1: Missing Authorization Header in Save Expense
create_issue \
  "[BUG] Missing Authorization Token in Save Expense from Receipt" \
  "## Description
When saving an expense from an OCR-scanned receipt, the request fails with 'Authorization token required' error.

## Root Cause
File: \`expense-tracker/src/pages/Import.jsx\` (Line 74-86)
The \`handleSaveExpense\` function uses raw \`fetch()\` instead of the API service, so the authorization token is not included.

## Steps to Reproduce
1. Navigate to Import page
2. Upload a receipt image
3. Click 'Scan Receipt & Extract'
4. Click 'Save Expense Record'
5. Error: 'Authorization token required'

## Expected Behavior
Expense should be saved successfully with auth token

## Solution
Replace raw fetch() with \`expenseApi.create()\` call

\`\`\`javascript
// Instead of:
const rawRes = await fetch('/api/expenses', { ... })

// Use:
const saved = await expenseApi.create({ ... })
\`\`\`" \
  "\"bug\",\"critical\",\"priority:high\""

# Issue 2: CORS Blocked in Production
create_issue \
  "[BUG] CORS Configuration Only Allows Localhost - Breaks Production" \
  "## Description
CORS is configured to only allow localhost origins. This will block all requests from production Vercel domain.

## Root Cause
File: \`expense-tracker/server/index.js\` (Line 19)
\`\`\`javascript
cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true })
\`\`\`

## Impact
- Production deployment on Vercel will have all cross-origin requests blocked
- API calls from frontend will fail with CORS error
- Application won't work in production

## Solution
Add production URL to CORS whitelist:
\`\`\`javascript
cors({ 
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://spendor-financetracer.vercel.app'
  ], 
  credentials: true 
})
\`\`\`" \
  "\"bug\",\"critical\",\"priority:high\",\"deployment\""

# Issue 3: Loading State Not Tracked
create_issue \
  "[BUG] AuthContext Loading State Hardcoded to False" \
  "## Description
The AuthContext has \`loading: false\` hardcoded, so UI never shows loading indicators during authentication.

## Root Cause
File: \`expense-tracker/src/context/AuthContext.jsx\` (Line 65)
\`\`\`javascript
value={{ user, loading: false, loginWithGoogle, ... }}
\`\`\`

## Impact
- No loading spinner during Google login
- No loading spinner during sandbox login
- Poor UX - users don't know request is processing

## Solution
Add loading state management to AuthContext" \
  "\"bug\",\"priority:medium\",\"ux\""

# Issue 4: Missing Validation for OCR Data
create_issue \
  "[ENHANCEMENT] Add Validation for OCR-Extracted Receipt Data" \
  "## Description
When saving expense from OCR, there's no validation that required fields are present or valid.

## Root Cause
File: \`expense-tracker/src/pages/Import.jsx\` (Line 65-104)
The \`handleSaveExpense\` function doesn't validate:
- merchant name is not empty
- amount is valid positive number
- date is valid
- category is selected

## Impact
- Users can save incomplete/invalid receipt data
- Database gets corrupted data
- Analytics based on bad data

## Solution
Add validation before saving:
\`\`\`javascript
const handleSaveExpense = async () => {
  if (!extractedData.merchant?.trim()) {
    setError('Merchant name is required');
    return;
  }
  if (!extractedData.amount || extractedData.amount <= 0) {
    setError('Valid amount is required');
    return;
  }
  // ... more validations
}
\`\`\`" \
  "\"enhancement\",\"priority:medium\",\"validation\""

# Issue 5: Type Field Mismatch for Income
create_issue \
  "[BUG] Unnecessary Type Field Sent for Income Records" \
  "## Description
When creating income records, a 'type' field is sent even though income doesn't have a type.

## Root Cause
File: \`expense-tracker/src/pages/Home.jsx\` (Line 85)
\`\`\`javascript
type: 'Regular', // Unnecessary for income
\`\`\`

## Impact
- Database stores unused data
- May cause validation errors in backend
- Inconsistent data model

## Solution
Don't include type field for income records" \
  "\"bug\",\"priority:low\",\"data-model\""

# Issue 6: Memory Leak - URL.createObjectURL Not Revoked
create_issue \
  "[BUG] Memory Leak: URL.createObjectURL Not Revoked" \
  "## Description
\`URL.createObjectURL()\` is called for receipt preview but never revoked, causing memory leak.

## Root Cause
File: \`expense-tracker/src/pages/Import.jsx\` (Line 31)
\`\`\`javascript
setReceiptPreview(URL.createObjectURL(file)); // Creates URL but never revokes
\`\`\`

## Impact
- Memory leak in browser each time receipt is uploaded
- Performance degradation after multiple uploads
- Browser memory usage keeps increasing

## Solution
Revoke object URL when component unmounts or image is replaced:
\`\`\`javascript
useEffect(() => {
  return () => {
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }
  };
}, [receiptPreview]);
\`\`\`" \
  "\"bug\",\"priority:medium\",\"performance\""

# Issue 7: Generic Error Messages
create_issue \
  "[ENHANCEMENT] Improve Error Messages and Logging in Import Component" \
  "## Description
Catch blocks use generic error messages that don't help debugging.

## Root Cause
File: \`expense-tracker/src/pages/Import.jsx\` (Line 99-100)
\`\`\`javascript
} catch {
  setError('Failed to save scanned expense.');
}
\`\`\`

## Impact
- Difficult to debug issues
- Poor error tracking
- Users don't know what went wrong

## Solution
Add detailed error logging and user-friendly messages" \
  "\"enhancement\",\"priority:low\",\"error-handling\""

# Issue 8: No Token Expiry Handling
create_issue \
  "[ENHANCEMENT] Add Auto-Logout on JWT Token Expiry" \
  "## Description
There's no handling for expired JWT tokens. User remains logged in with an invalid token.

## Root Cause
File: \`expense-tracker/src/context/AuthContext.jsx\`
No response interceptor to check for 401 errors

## Impact
- Users get errors when token expires
- Confusing UX - appears logged in but requests fail
- Security risk - stale tokens in localStorage

## Solution
Add response interceptor to detect 401 errors and auto-logout" \
  "\"enhancement\",\"priority:medium\",\"security\",\"auth\""

# Issue 9: No Rate Limiting
create_issue \
  "[SECURITY] Add Rate Limiting to API Endpoints" \
  "## Description
No rate limiting configured on backend API, vulnerable to DoS attacks and abuse.

## Root Cause
File: \`expense-tracker/server/index.js\`
No express-rate-limit middleware applied

## Impact
- Vulnerable to brute force attacks
- Vulnerable to DoS attacks
- Could crash server with massive requests

## Solution
Add express-rate-limit middleware to all routes" \
  "\"enhancement\",\"security\",\"priority:high\""

# Issue 10: Hardcoded Categories Duplication
create_issue \
  "[REFACTOR] Centralize Category Configuration" \
  "## Description
Categories are hardcoded in multiple places (Import.jsx, other components) instead of being centralized.

## Root Cause
File: \`expense-tracker/src/pages/Import.jsx\` (Line 5)
Categories hardcoded in component instead of using shared config

## Impact
- Hard to maintain and update categories
- Inconsistencies between components
- DRY principle violated

## Solution
Create centralized categories config file and import everywhere" \
  "\"enhancement\",\"priority:low\",\"refactor\""

# Issue 11: CORS Credentials Security Review
create_issue \
  "[SECURITY] Review CORS Credentials Configuration" \
  "## Description
CORS is configured with \`credentials: true\` without proper security validation.

## File
\`expense-tracker/server/index.js\` (Line 19)

## Recommendation
Review security implications and ensure:
- Only trusted origins have credentials access
- Proper validation of origin headers
- No sensitive data exposed unnecessarily" \
  "\"security\",\"priority:medium\",\"review\""

# Issue 12: Error Message in AuthContext
create_issue \
  "[ENHANCEMENT] Improve Error Handling in AuthContext" \
  "## Description
Catch blocks in LoginWithGoogle and LoginWithSandbox could have better error details.

## File
\`expense-tracker/src/context/AuthContext.jsx\` (Lines 38-40, 53-55)

## Enhancement
Add logging and better error messages for debugging authentication issues" \
  "\"enhancement\",\"priority:low\",\"error-handling\""

echo ""
echo "✅ All 12 issues created successfully!"
