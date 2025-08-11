"use client";

import { useUserAuth } from '@/contexts/UserAuthContext';
import { signOut } from 'aws-amplify/auth';

/**
 * Example component showing how to use the UserAuth context
 * This component can be used anywhere in the app without needing to fetch user data
 */
export default function UserProfile() {
  const { 
    isAuthenticated, 
    username, 
    email, 
    userGroups, 
    isAdmin, 
    isLoading,
    error,
    refreshUserData 
  } = useUserAuth();

  if (isLoading) {
    return <div>Loading user information...</div>;
  }

  if (!isAuthenticated) {
    return <div>Not signed in</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red' }}>
        <p>Error: {error}</p>
        <button onClick={refreshUserData}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>User Profile</h3>
      <p><strong>Username:</strong> {username}</p>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Role:</strong> {isAdmin ? 'Admin' : 'User'}</p>
      <p><strong>Groups:</strong> {userGroups.length > 0 ? userGroups.join(', ') : 'None'}</p>
      
      <div style={{ marginTop: '16px' }}>
        <button 
          onClick={refreshUserData}
          style={{ marginRight: '8px', padding: '8px 16px' }}
        >
          Refresh Data
        </button>
        <button 
          onClick={() => signOut()}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}