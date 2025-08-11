"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';

// Types for our user context
export interface UserAuthState {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  username?: string;
  userGroups: string[];
  isAdmin: boolean;
  isLoading: boolean;
  error?: string;
}

export interface UserAuthContextType extends UserAuthState {
  refreshUserData: () => Promise<void>;
}

// Create the context with default values
const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

// Provider component
export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<UserAuthState>({
    isAuthenticated: false,
    userGroups: [],
    isAdmin: false,
    isLoading: true,
  });

  // Use Amplify's useAuthenticator hook with optimization
  const { user, authStatus } = useAuthenticator((context) => [
    context.user,
    context.authStatus,
  ]);

  // Function to fetch and parse user data
  const fetchUserData = async (): Promise<UserAuthState> => {
    if (!user || authStatus !== 'authenticated') {
      return {
        isAuthenticated: false,
        userGroups: [],
        isAdmin: false,
        isLoading: false,
      };
    }

    try {
      console.log('🔄 Fetching user attributes after authentication...');
      const attributes = await fetchUserAttributes();
      console.log('📋 User attributes:', attributes);

      // Extract user information
      const userId = user.userId;
      const email = attributes.email;
      const username = user.username;

      // Parse groups from family_name attribute (your current setup)
      const groupsValue = attributes['family_name'];
      console.log('👥 Groups value (in family_name):', groupsValue, typeof groupsValue);

      let userGroups: string[] = [];
      if (groupsValue) {
        if (typeof groupsValue === 'string') {
          try {
            // Parse groups from format: "[group1, group2, group3]"
            const cleaned = groupsValue.replace(/^\[|\]$/g, ''); // Remove [ and ]
            userGroups = cleaned.split(',').map(g => g.trim());
          } catch {
            // Fallback: treat as single group
            userGroups = [groupsValue];
          }
        } else if (Array.isArray(groupsValue)) {
          userGroups = groupsValue;
        } else {
          userGroups = [String(groupsValue)];
        }
      }

      // Check if user is admin (using your specific admin group ID)
      const isAdmin = userGroups.includes('f9cf5862-b96d-4e4b-a4c8-dbfabe70cd30');

      console.log('✅ User state resolved:', {
        userId,
        email,
        username,
        userGroups,
        isAdmin,
      });

      return {
        isAuthenticated: true,
        userId,
        email,
        username,
        userGroups,
        isAdmin,
        isLoading: false,
      };
    } catch (error) {
      console.error('❌ Error fetching user attributes:', error);
      return {
        isAuthenticated: true, // Still authenticated, but couldn't get details
        userGroups: [],
        isAdmin: false,
        isLoading: false,
        error: `Failed to fetch user details: ${error}`,
      };
    }
  };

  // Function to refresh user data manually if needed
  const refreshUserData = async () => {
    setUserState((prev) => ({ ...prev, isLoading: true }));
    const newUserState = await fetchUserData();
    setUserState(newUserState);
  };

  // Effect to handle authentication state changes
  useEffect(() => {
    const updateUserState = async () => {
      console.log('🔄 Auth status changed:', authStatus);
      
      if (authStatus === 'configuring') {
        setUserState((prev) => ({ ...prev, isLoading: true }));
        return;
      }

      if (authStatus === 'authenticated' && user) {
        console.log('🔐 User authenticated, fetching user data...');
        const newUserState = await fetchUserData();
        setUserState(newUserState);
      } else {
        console.log('🚪 User not authenticated, clearing state...');
        setUserState({
          isAuthenticated: false,
          userGroups: [],
          isAdmin: false,
          isLoading: false,
        });
      }
    };

    updateUserState();
  }, [user, authStatus]); // Only re-run when user or authStatus changes

  const contextValue: UserAuthContextType = {
    ...userState,
    refreshUserData,
  };

  return (
    <UserAuthContext.Provider value={contextValue}>
      {children}
    </UserAuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useUserAuth(): UserAuthContextType {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}

// Higher-order component for pages that require authentication
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useUserAuth();

    if (isLoading) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Please sign in to access this page.</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Higher-order component for admin-only pages
export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return function AdminOnlyComponent(props: P) {
    const { isAuthenticated, isAdmin, isLoading } = useUserAuth();

    if (isLoading) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Please sign in to access this page.</p>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Access denied. Admin privileges required.</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}