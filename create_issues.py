#!/usr/bin/env python3
"""
Create GitHub issues for Expense Tracker bugs
Requires GITHUB_TOKEN environment variable to be set
"""

import requests
import json
import os
import sys

OWNER = "Rajjoshi77"
REPO = "Expense_Tracker"
TOKEN = os.getenv("GITHUB_TOKEN")

if not TOKEN:
    print("❌ Error: GITHUB_TOKEN environment variable not set")
    print("Create a token at: https://github.com/settings/tokens")
    sys.exit(1)

API_URL = f"https://api.github.com/repos/{OWNER}/{REPO}/issues"
HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github+json"
}

ISSUES = [
    {
        "title": "[BUG] Missing Authorization Token in Save Expense from Receipt",
        "body": """## Description
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
Replace raw fetch() with `expenseApi.create()` call

```javascript
// Instead of:
const rawRes = await fetch('/api/expenses', { ... })

// Use:
const saved = await expenseApi.create({ ... })
```""",
        "labels": ["bug", "critical", "priority:high"]
    },
    {
        "title": "[BUG] CORS Configuration Only Allows Localhost - Breaks Production",
        "body": """## Description
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
Add production URL to CORS whitelist:
```javascript
cors({ 
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'https://spendor-financetracer.vercel.app'
  ], 
  credentials: true 
})
```""",
        "labels": ["bug", "critical", "priority:high", "deployment"]
    },
    {
        "title": "[BUG] AuthContext Loading State Hardcoded to False",
        "body": """## Description
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

## Solution
Add loading state management to AuthContext""",
        "labels": ["bug", "priority:medium", "ux"]
    },
    {
        "title": "[ENHANCEMENT] Add Validation for OCR-Extracted Receipt Data",
        "body": """## Description
When saving expense from OCR, there's no validation that required fields are present or valid.

## Root Cause
File: `expense-tracker/src/pages/Import.jsx` (Line 65-104)
The `handleSaveExpense` function doesn't validate:
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
```javascript
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
```""",
        "labels": ["enhancement", "priority:medium", "validation"]
    },
    {
        "title": "[BUG] Unnecessary Type Field Sent for Income Records",
        "body": """## Description
When creating income records, a 'type' field is sent even though income doesn't have a type.

## Root Cause
File: `expense-tracker/src/pages/Home.jsx` (Line 85)
```javascript
type: 'Regular', // Unnecessary for income
```

## Impact
- Database stores unused data
- May cause validation errors in backend
- Inconsistent data model

## Solution
Don't include type field for income records""",
        "labels": ["bug", "priority:low", "data-model"]
    },
    {
        "title": "[BUG] Memory Leak: URL.createObjectURL Not Revoked",
        "body": """## Description
`URL.createObjectURL()` is called for receipt preview but never revoked, causing memory leak.

## Root Cause
File: `expense-tracker/src/pages/Import.jsx` (Line 31)
```javascript
setReceiptPreview(URL.createObjectURL(file)); // Creates URL but never revokes
```

## Impact
- Memory leak in browser each time receipt is uploaded
- Performance degradation after multiple uploads
- Browser memory usage keeps increasing

## Solution
Revoke object URL when component unmounts or image is replaced:
```javascript
useEffect(() => {
  return () => {
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }
  };
}, [receiptPreview]);
```""",
        "labels": ["bug", "priority:medium", "performance"]
    },
    {
        "title": "[ENHANCEMENT] Improve Error Messages and Logging in Import Component",
        "body": """## Description
Catch blocks use generic error messages that don't help debugging.

## Root Cause
File: `expense-tracker/src/pages/Import.jsx` (Line 99-100)
```javascript
} catch {
  setError('Failed to save scanned expense.');
}
```

## Impact
- Difficult to debug issues
- Poor error tracking
- Users don't know what went wrong

## Solution
Add detailed error logging and user-friendly messages""",
        "labels": ["enhancement", "priority:low", "error-handling"]
    },
    {
        "title": "[ENHANCEMENT] Add Auto-Logout on JWT Token Expiry",
        "body": """## Description
There's no handling for expired JWT tokens. User remains logged in with an invalid token.

## Root Cause
File: `expense-tracker/src/context/AuthContext.jsx`
No response interceptor to check for 401 errors

## Impact
- Users get errors when token expires
- Confusing UX - appears logged in but requests fail
- Security risk - stale tokens in localStorage

## Solution
Add response interceptor to detect 401 errors and auto-logout""",
        "labels": ["enhancement", "priority:medium", "security", "auth"]
    },
    {
        "title": "[SECURITY] Add Rate Limiting to API Endpoints",
        "body": """## Description
No rate limiting configured on backend API, vulnerable to DoS attacks and abuse.

## Root Cause
File: `expense-tracker/server/index.js`
No express-rate-limit middleware applied

## Impact
- Vulnerable to brute force attacks
- Vulnerable to DoS attacks
- Could crash server with massive requests

## Solution
Add express-rate-limit middleware to all routes""",
        "labels": ["enhancement", "security", "priority:high"]
    },
    {
        "title": "[REFACTOR] Centralize Category Configuration",
        "body": """## Description
Categories are hardcoded in multiple places (Import.jsx, other components) instead of being centralized.

## Root Cause
File: `expense-tracker/src/pages/Import.jsx` (Line 5)
Categories hardcoded in component instead of using shared config

## Impact
- Hard to maintain and update categories
- Inconsistencies between components
- DRY principle violated

## Solution
Create centralized categories config file and import everywhere""",
        "labels": ["enhancement", "priority:low", "refactor"]
    },
    {
        "title": "[SECURITY] Review CORS Credentials Configuration",
        "body": """## Description
CORS is configured with `credentials: true` without proper security validation.

## File
`expense-tracker/server/index.js` (Line 19)

## Recommendation
Review security implications and ensure:
- Only trusted origins have credentials access
- Proper validation of origin headers
- No sensitive data exposed unnecessarily""",
        "labels": ["security", "priority:medium", "review"]
    },
    {
        "title": "[ENHANCEMENT] Improve Error Handling in AuthContext",
        "body": """## Description
Catch blocks in LoginWithGoogle and LoginWithSandbox could have better error details.

## File
`expense-tracker/src/context/AuthContext.jsx` (Lines 38-40, 53-55)

## Enhancement
Add logging and better error messages for debugging authentication issues""",
        "labels": ["enhancement", "priority:low", "error-handling"]
    }
]

def create_issue(issue_data):
    """Create a single GitHub issue"""
    try:
        response = requests.post(
            API_URL,
            headers=HEADERS,
            json=issue_data,
            timeout=10
        )
        
        if response.status_code == 201:
            issue_url = response.json()["html_url"]
            print(f"✅ Created: {issue_data['title']}")
            print(f"   URL: {issue_url}\n")
            return True
        else:
            print(f"❌ Failed: {issue_data['title']}")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}\n")
            return False
    except Exception as e:
        print(f"❌ Error creating issue: {issue_data['title']}")
        print(f"   Exception: {str(e)}\n")
        return False

def main():
    """Create all issues"""
    print(f"🚀 Creating {len(ISSUES)} GitHub issues...")
    print(f"   Repository: {OWNER}/{REPO}\n")
    
    success_count = 0
    for issue in ISSUES:
        if create_issue(issue):
            success_count += 1
    
    print(f"\n{'='*60}")
    print(f"📊 Summary: {success_count}/{len(ISSUES)} issues created successfully")
    print(f"{'='*60}")
    
    if success_count == len(ISSUES):
        print("✨ All issues created! Check your repository issues page.")
        return 0
    else:
        print(f"⚠️  {len(ISSUES) - success_count} issues failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
