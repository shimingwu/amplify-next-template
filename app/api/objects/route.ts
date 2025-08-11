import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger } from '@/utils/auditLogger';
import { getUserContext, getRequestContext } from '@/utils/authUtils';

const API_BASE_URL = "https://api.restful-api.dev/objects";

// GET /api/objects or GET /api/objects?id=123
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // Get user context for audit logging
  const userContext = await getUserContext(request);
  const requestContext = getRequestContext(request);
  
  try {
    const url = id ? `${API_BASE_URL}/${id}` : API_BASE_URL;
    const response = await fetch(url);
    
    // Forward the exact status code from the external API
    if (!response.ok) {
      const errorText = await response.text();
      
      // Log failed access attempt
      AuditLogger.logAccessFailure(
        userContext,
        id || 'list',
        errorText,
        response.status,
        requestContext
      );
      
      return NextResponse.json(
        { error: errorText || `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Log successful access
    AuditLogger.logObjectAccess(
      userContext,
      id || 'list',
      Array.isArray(data) ? data.length : 1,
      requestContext
    );
    
    return NextResponse.json(data);
  } catch (error) {
    // Log system error
    AuditLogger.logSystemError(
      userContext,
      id || 'list',
      (error as Error).message,
      requestContext
    );
    
    return NextResponse.json(
      { error: 'Failed to fetch objects' }, 
      { status: 500 }
    );
  }
}

// POST /api/objects
export async function POST(request: NextRequest) {
  // Get user context for audit logging
  const userContext = await getUserContext(request);
  const requestContext = getRequestContext(request);
  
  try {
    const body = await request.json();
    
    // 🔒 SERVER-SIDE SECRET: Append mocked secret to demonstrate server-side processing
    const MOCKED_SECRET = "here is the mocked secret (simulated, just try to confirm that the secret is not sent to the client, by we can use backend to send this api with whatever 2lO token)";
    
    // Modify the payload to include the secret in the description
    const modifiedBody = {
      ...body,
      data: {
        ...body.data,
        description: body.data?.description 
          ? `${body.data.description} - ${MOCKED_SECRET}`
          : MOCKED_SECRET
      }
    };
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modifiedBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Log failed creation
      AuditLogger.logEvent('OBJECT_CREATE_FAILED', userContext, {
        details: {
          status: response.status,
          error: errorText,
          requestedName: body.name
        },
        userAgent: requestContext.userAgent,
        ipAddress: requestContext.ipAddress
      });
      
      return NextResponse.json(
        { error: errorText || `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Log successful creation
    AuditLogger.logObjectCreated(
      userContext,
      data.id,
      {
        name: data.name,
        originalRequest: body
      },
      requestContext
    );
    
    return NextResponse.json(data);
  } catch (error) {
    // Log system error
    AuditLogger.logEvent('OBJECT_CREATE_ERROR', userContext, {
      details: { error: (error as Error).message },
      userAgent: requestContext.userAgent,
      ipAddress: requestContext.ipAddress
    });
    
    return NextResponse.json(
      { error: 'Failed to create object' }, 
      { status: 500 }
    );
  }
}

// PUT /api/objects?id=123
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // Get user context for audit logging
  const userContext = await getUserContext(request);
  const requestContext = getRequestContext(request);
  
  if (!id) {
    AuditLogger.logEvent('OBJECT_UPDATE_FAILED', userContext, {
      details: { error: 'ID is required for update', status: 400 },
      userAgent: requestContext.userAgent,
      ipAddress: requestContext.ipAddress
    });
    
    return NextResponse.json(
      { error: 'ID is required for update' }, 
      { status: 400 }
    );
  }
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Forward the exact status code from the external API
    if (!response.ok) {
      const errorText = await response.text();
      
      AuditLogger.logEvent('OBJECT_UPDATE_FAILED', userContext, {
        objectId: id,
        details: { status: response.status, error: errorText },
        userAgent: requestContext.userAgent,
        ipAddress: requestContext.ipAddress
      });
      
      return NextResponse.json(
        { error: errorText || `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Log successful update
    AuditLogger.logEvent('OBJECT_UPDATED', userContext, {
      objectId: id,
      details: { updatedObject: data },
      userAgent: requestContext.userAgent,
      ipAddress: requestContext.ipAddress
    });
    
    return NextResponse.json(data);
  } catch (error) {
    AuditLogger.logEvent('OBJECT_UPDATE_ERROR', userContext, {
      objectId: id,
      details: { error: (error as Error).message },
      userAgent: requestContext.userAgent,
      ipAddress: requestContext.ipAddress
    });
    
    return NextResponse.json(
      { error: 'Failed to update object' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/objects?id=123
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // Get user context for audit logging
  const userContext = await getUserContext(request);
  const requestContext = getRequestContext(request);
  
  if (!id) {
    AuditLogger.logEvent('OBJECT_DELETE_FAILED', userContext, {
      details: {
        error: 'ID is required for delete',
        status: 400
      },
      userAgent: requestContext.userAgent,
      ipAddress: requestContext.ipAddress
    });
    
    return NextResponse.json(
      { error: 'ID is required for delete' }, 
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    // Forward the exact status code from the external API
    if (!response.ok) {
      const errorText = await response.text();
      
      // Log failed deletion
      AuditLogger.logAccessFailure(
        userContext,
        id,
        errorText,
        response.status,
        requestContext
      );
      
      return NextResponse.json(
        { error: errorText || `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Log successful deletion - THIS IS CRITICAL FOR AUDIT
    AuditLogger.logObjectDeleted(
      userContext,
      id,
      data,
      requestContext
    );
    
    return NextResponse.json(data);
  } catch (error) {
    // Log system error
    AuditLogger.logSystemError(
      userContext,
      id,
      (error as Error).message,
      requestContext
    );
    
    return NextResponse.json(
      { error: 'Failed to delete object' }, 
      { status: 500 }
    );
  }
}