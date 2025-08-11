import { NextRequest, NextResponse } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from './amplifyServerUtils';
import type { UserContext } from './auditLogger';

/**
 * Extracts user context from Amplify auth session for server-side API routes
 * Uses the runWithAmplifyServerContext pattern for Amplify Gen2
 */
export async function getUserContext(request: NextRequest): Promise<UserContext | null> {
  try {
    const response = NextResponse.next();
    
    // Debug: Check for auth cookies
    const authCookies = request.headers.get('cookie');
    console.log('🔍 Auth cookies present:', !!authCookies?.includes('amplify'));
    
    const userContext = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const session = await fetchAuthSession(contextSpec);
          
          console.log('🔍 Session tokens:', {
            hasAccessToken: !!session.tokens?.accessToken,
            hasIdToken: !!session.tokens?.idToken,
            isSignedIn: !!session.tokens?.accessToken
          });
          
          // Check if user is authenticated
          if (!session.tokens?.accessToken) {
            console.log('❌ No access token found - user not authenticated');
            return null;
          }

          // Extract user information from the ID token
          const idToken = session.tokens.idToken;
          if (!idToken) {
            console.log('❌ No ID token found');
            return null;
          }

          // Parse the JWT payload (this is safe as it's already verified by Amplify)
          const payload = JSON.parse(atob(idToken.toString().split('.')[1]));
          
          const userContext = {
            userId: payload.sub || payload['cognito:username'] || 'unknown',
            email: payload.email,
            groups: payload['cognito:groups'] || []
          };
          
          console.log('✅ User context extracted:', userContext);
          return userContext;
        } catch (error) {
          console.warn('❌ Failed to fetch auth session:', error);
          return null;
        }
      }
    });

    return userContext as UserContext | null;
  } catch (error) {
    console.warn('❌ Failed to get user context:', error);
    return null;
  }
}

/**
 * Extracts request context information for audit logging
 */
export function getRequestContext(request: NextRequest) {
  return {
    userAgent: request.headers.get('user-agent') || undefined,
    ipAddress: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
  };
}