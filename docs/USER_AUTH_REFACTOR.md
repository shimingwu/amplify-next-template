# User Authentication State Management Refactor

## Overview

This refactor implements Amplify Gen2 best practices for authentication state management using React Context API. The solution eliminates redundant user attribute fetching on every page load and provides a centralized, efficient way to manage user authentication state throughout the application.

## Key Benefits

✅ **Performance**: User data is fetched only once after authentication  
✅ **Consistency**: Single source of truth for user state across the app  
✅ **Developer Experience**: Easy-to-use hooks and higher-order components  
✅ **Best Practices**: Follows Amplify Gen2 and React optimization patterns  
✅ **Type Safety**: Full TypeScript support with proper typing  

## Architecture

### 1. UserAuthContext (`contexts/UserAuthContext.tsx`)

**Core Features:**
- Centralized authentication state management
- Automatic user attribute extraction after authentication
- Optimized re-rendering using `useAuthenticator` with selector function
- Built-in loading states and error handling
- Manual refresh capability

**State Structure:**
```typescript
interface UserAuthState {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  username?: string;
  userGroups: string[];
  isAdmin: boolean;
  isLoading: boolean;
  error?: string;
}
```

**Key Features:**
- **Auto-parsing of user groups** from `family_name` attribute
- **Admin role detection** using your specific group ID
- **Performance optimization** - only re-renders when user/authStatus changes
- **Error handling** with retry functionality

### 2. Updated AuthenticatorWrapper (`app/AuthenticatorWrapper.tsx`)

**Changes:**
- Wraps children with `UserAuthProvider` 
- Maintains existing SAML authentication setup
- Ensures context is available throughout the authenticated app

### 3. Refactored Posts Page (`app/posts/page.tsx`)

**Before:**
```typescript
// ❌ Old approach - fetched user data on every page load
useEffect(() => {
  const fetchUserInfo = async () => {
    const attributes = await fetchUserAttributes();
    // Complex parsing logic...
  };
  fetchUserInfo();
}, []);
```

**After:**
```typescript
// ✅ New approach - get user data from context
const { isAuthenticated, userGroups, isAdmin, isLoading, username, email } = useUserAuth();
```

## Usage Examples

### Basic User State Access

```typescript
import { useUserAuth } from '@/contexts/UserAuthContext';

function MyComponent() {
  const { isAuthenticated, username, isAdmin, isLoading } = useUserAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;
  
  return <div>Welcome, {username}! {isAdmin && '(Admin)'}</div>;
}
```

### Protected Pages with HOCs

```typescript
import { withAuth, withAdminAuth } from '@/contexts/UserAuthContext';

// Regular authenticated page
const ProfilePage = withAuth(() => <div>Profile content</div>);

// Admin-only page  
const AdminPage = withAdminAuth(() => <div>Admin panel</div>);
```

### Manual User Data Refresh

```typescript
function RefreshButton() {
  const { refreshUserData, isLoading } = useUserAuth();
  
  return (
    <button 
      onClick={refreshUserData} 
      disabled={isLoading}
    >
      {isLoading ? 'Refreshing...' : 'Refresh User Data'}
    </button>
  );
}
```

## Migration Guide

### For Existing Components

1. **Remove manual user attribute fetching:**
   ```typescript
   // ❌ Remove this
   const [userGroups, setUserGroups] = useState([]);
   const [isAdmin, setIsAdmin] = useState(false);
   
   useEffect(() => {
     const fetchUserInfo = async () => {
       const attributes = await fetchUserAttributes();
       // parsing logic...
     };
     fetchUserInfo();
   }, []);
   ```

2. **Use the context hook:**
   ```typescript
   // ✅ Add this
   import { useUserAuth } from '@/contexts/UserAuthContext';
   
   const { userGroups, isAdmin, isLoading } = useUserAuth();
   ```

### For New Components

1. Import the hook: `import { useUserAuth } from '@/contexts/UserAuthContext';`
2. Use the returned state directly - no setup required!

## Performance Optimizations

### 1. Optimized Re-rendering
- Uses `useAuthenticator` with selector function to prevent unnecessary re-renders
- Only updates when actual authentication state changes

### 2. Efficient User Attribute Parsing
- Parses user groups only once after authentication
- Caches results until next authentication event

### 3. Loading State Management
- Provides granular loading states for better UX
- Prevents layout shifts during authentication state changes

## Error Handling

### Built-in Error Recovery
- Automatic error detection for failed user attribute fetches
- Manual retry functionality via `refreshUserData()`
- Graceful degradation when user details can't be loaded

### Error Display Example
```typescript
const { error, refreshUserData } = useUserAuth();

if (error) {
  return (
    <div>
      Error: {error}
      <button onClick={refreshUserData}>Retry</button>
    </div>
  );
}
```

## Authentication Flow

1. **User signs in** via Authenticator component
2. **Context detects authentication** via `useAuthenticator` hook
3. **User attributes are fetched** automatically from Cognito
4. **Groups are parsed** from `family_name` attribute
5. **Admin status is determined** based on group membership
6. **State is cached** and made available app-wide
7. **Components re-render** with user data immediately available

## Security Considerations

- ✅ User groups are validated server-side (in your API routes)
- ✅ Client-side role checks are for UX only, not security
- ✅ All sensitive operations should verify permissions server-side
- ✅ Context only stores non-sensitive user information

## Next Steps

### Recommended Enhancements

1. **Add role-based routing protection**
2. **Implement user preference caching**
3. **Add audit logging for authentication events**
4. **Create admin-specific context for admin features**

### Migration Checklist

- [x] Create UserAuthContext
- [x] Update AuthenticatorWrapper 
- [x] Refactor posts page
- [x] Test authentication flow
- [ ] Migrate other components using user attributes
- [ ] Add role-based route protection
- [ ] Update server-side auth utilities

## Testing

Test the following scenarios:
1. **Sign in flow** - verify user data loads correctly
2. **Sign out flow** - verify state clears properly  
3. **Admin vs regular user** - verify role detection
4. **Page refresh** - verify state persistence
5. **Network errors** - verify error handling
6. **Multiple tabs** - verify state synchronization

## Troubleshooting

### Common Issues

**Issue**: "useUserAuth must be used within a UserAuthProvider"
- **Solution**: Ensure component is wrapped with AuthenticatorWrapper

**Issue**: User data not loading
- **Solution**: Check console for authentication errors, verify Amplify configuration

**Issue**: Groups not detected
- **Solution**: Verify groups are stored in `family_name` attribute in Cognito