# Identified Bugs & Issues in Expense Tracker

## Critical Issues

### 1. Missing Authorization Token in Receipt Upload (FIXED ✅)
- **File**: `expense-tracker/src/services/api.js`
- **Issue**: Authorization token was not being properly sent with multipart/form-data requests for receipt uploads
- **Status**: FIXED in commit c7ce5cf

### 2. Missing Authorization Header in Save Expense (Line 74-86)
- **File**: `expense-tracker/src/pages/Import.jsx`
- **Issue**: The `handleSaveExpense` function uses raw `fetch()` instead of the API service, so it doesn't include the authorization token
- **Impact**: When saving a scanned receipt, the backend returns "Authorization token required" error
- **Solution**: Use `expenseApi.create()` instead of raw fetch

### 3. Disabled CORS Origins (Production Issue)
- **File**: `expense-tracker/server/index.js` (Line 19)
- **Issue**: CORS is only allowing localhost URLs - won't work in production on Vercel
- ```javascript
  cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true })
  ```
- **Impact**: Cross-origin requests from production domain will be blocked
- **Solution**: Add production URL to CORS whitelist

## Medium Priority Issues

### 4. Missing Error Handling in AuthContext
- **File**: `expense-tracker/src/context/AuthContext.jsx`
- **Issue**: `loading` state is hardcoded to `false` - doesn't reflect actual loading state during authentication
- **Impact**: UI won't show loading indicators during login
- **Solution**: Add proper loading state management

### 5. Incomplete Error Messages in Import Component
- **File**: `expense-tracker/src/pages/Import.jsx` (Line 99-100)
- **Issue**: Generic catch block doesn't provide detailed error info
- **Code**: `setError('Failed to save scanned expense.');`
- **Solution**: Add error logging and more descriptive messages

### 6. No Validation for Extracted Receipt Data
- **File**: `expense-tracker/src/pages/Import.jsx`
- **Issue**: When saving expense from OCR, there's no validation that required fields are present
- **Impact**: User can save incomplete receipt data
- **Solution**: Validate merchant, amount, and date before saving

### 7. Type Mismatch in Income Creation
- **File**: `expense-tracker/src/pages/Home.jsx` (Line 85)
- **Issue**: Expense form passes `type: 'Regular'` for income, but income doesn't have a 'type' field
- **Impact**: May cause database issues or unused data
- **Solution**: Don't include type field for income records

## Low Priority / Improvements

### 8. Memory Leak: URL.createObjectURL Not Revoked
- **File**: `expense-tracker/src/pages/Import.jsx` (Line 31)
- **Issue**: `URL.createObjectURL()` creates object URL but never revokes it
- **Solution**: Call `URL.revokeObjectURL()` when image is removed

### 9. Hardcoded Categories
- **Files**: Multiple files
- **Issue**: Categories are hardcoded in Import.jsx but also in data/categories.js
- **Solution**: Fetch categories from a config or API

### 10. Missing Logout on Token Expiry
- **File**: `expense-tracker/src/context/AuthContext.jsx`
- **Issue**: No handling for expired JWT tokens - user remains logged in with invalid token
- **Solution**: Add response interceptor to check for 401 errors and auto-logout

### 11. No Rate Limiting on API
- **File**: `expense-tracker/server/index.js`
- **Issue**: No rate limiting configured - vulnerable to abuse
- **Solution**: Add express-rate-limit middleware

### 12. Sensitive Data in CORS Config
- **Issue**: CORS credentials true without proper validation
- **Solution**: Review security implications of credential mode
