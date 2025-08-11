# Enhanced Audit Logging System

This documentation explains the comprehensive audit logging system implemented for your Amplify Gen2 Next.js application.

## Overview

The enhanced logging system provides:
- **Real user authentication context** - Full user information including userId, email, and groups
- **Structured audit logs** - Consistent, searchable log format with rich metadata
- **CloudWatch integration** - Automatic log forwarding for production monitoring
- **Request tracing** - IP addresses, user agents, and request IDs for forensic analysis

## Architecture

### Components

1. **`utils/amplifyServerUtils.ts`** - Amplify server context configuration
2. **`utils/authUtils.ts`** - User authentication and request context extraction
3. **`utils/auditLogger.ts`** - Structured audit logging with security best practices
4. **`app/api/objects/route.ts`** - Enhanced API routes with comprehensive logging

### Logging Features

#### Before (Old System)
```javascript
// Basic console.log with minimal context
function logAuditEvent(action: string, objectId?: string, userId?: string, details?: any) {
  const auditLog = {
    timestamp: new Date().toISOString(),
    action,
    userId: userId || 'anonymous',
    objectId,
    details,
    service: 'objects-api'
  };
  console.log('AUDIT_LOG:', JSON.stringify(auditLog));
}
```

#### After (Enhanced System)
```javascript
// Rich, structured logging with full user context
AuditLogger.logObjectAccessed(
  userContext,          // Full user info: {userId, email, groups}
  objectId,
  objectCount,
  requestContext        // IP, user agent, request ID
);
```

## User Authentication Integration

### Server-Side User Context

The system uses Amplify Gen2's `fetchAuthSession` API to extract real user information:

```typescript
const userContext = await getUserContext(request);
// Returns: {
//   userId: "user-123",
//   email: "user@example.com", 
//   groups: ["admin", "users"]
// }
```

### How It Works

1. **Request Processing**: Each API request extracts user context from Amplify auth cookies
2. **JWT Token Parsing**: Safely extracts user information from verified ID tokens
3. **Fallback Handling**: Gracefully handles unauthenticated users as "anonymous"
4. **Error Resilience**: Continues operation even if auth extraction fails

## Log Structure

### Enhanced Log Format

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "action": "OBJECT_CREATED",
  "userId": "user-abc123",
  "userEmail": "john.doe@company.com",
  "userGroups": ["admin", "power-users"],
  "objectId": "obj-456",
  "details": {
    "name": "Important Document",
    "originalRequest": {...}
  },
  "service": "objects-api",
  "requestId": "req-789xyz",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.100",
  "sessionId": "sess-def456"
}
```

### Audit Events Logged

| Event | Trigger | Information Captured |
|-------|---------|---------------------|
| `OBJECT_ACCESSED` | GET requests | User, object ID, count, request details |
| `OBJECT_CREATED` | POST success | User, new object data, original request |
| `OBJECT_UPDATED` | PUT success | User, object changes, update details |
| `OBJECT_DELETED` | DELETE success | User, deleted object, deletion context |
| `OBJECT_ACCESS_FAILED` | API errors | User, failure reason, error codes |
| `OBJECT_*_ERROR` | System errors | User, error details, stack traces |

## CloudWatch Integration

### GraphQL API Logging

Enabled comprehensive logging in `amplify/data/resource.ts`:

```typescript
export const data = defineData({
  schema,
  logging: {
    excludeVerboseContent: false, // Include full request/response details
    fieldLogLevel: 'all',         // Log all GraphQL field operations
    retention: '1 month'          // Compliance-friendly retention
  }
});
```

### Log Destinations

1. **Development**: Console output with structured JSON
2. **Production**: Automatic CloudWatch Logs forwarding
3. **Compliance**: Long-term log retention and archival

## Security Features

### Authentication Context
- ✅ Real user identification (no more "anonymous" logs for authenticated users)
- ✅ User email and group membership tracking
- ✅ Session correlation for user activity analysis

### Request Tracing
- ✅ IP address logging (with proxy support)
- ✅ User agent tracking for device identification
- ✅ Unique request IDs for correlation
- ✅ Request/response timing information

### Data Protection
- ✅ Sensitive data redaction in logs
- ✅ No password or token logging
- ✅ Structured format for automated analysis
- ✅ Compliance-ready audit trail

## Usage Examples

### Basic Logging
```typescript
// Simple event logging
AuditLogger.logEvent('CUSTOM_ACTION', userContext, {
  objectId: 'resource-123',
  details: { customField: 'value' }
});
```

### Specialized Methods
```typescript
// Object-specific logging
AuditLogger.logObjectCreated(userContext, objectId, objectData, requestContext);
AuditLogger.logObjectDeleted(userContext, objectId, deletedData, requestContext);
AuditLogger.logAccessFailure(userContext, objectId, errorMessage, statusCode, requestContext);
```

### Error Handling
```typescript
try {
  // API operation
} catch (error) {
  AuditLogger.logSystemError(userContext, objectId, error.message, requestContext);
}
```

## Benefits

### For Security Teams
- Complete audit trail with user attribution
- Failed access attempt tracking
- Anomaly detection through structured logs
- Compliance reporting capabilities

### For Development Teams  
- Rich debugging information
- Request correlation and tracing
- Performance monitoring data
- Error analysis and troubleshooting

### For Operations Teams
- CloudWatch integration for alerting
- Automated log analysis and dashboards
- Long-term retention for compliance
- Searchable, structured log format

## Migration Notes

### Upgrading from Basic Logging

1. **Install Dependencies**: `npm install @aws-amplify/adapter-nextjs`
2. **Update Imports**: Replace basic logging with AuditLogger
3. **Add User Context**: Use `getUserContext()` in API routes
4. **Enable CloudWatch**: Update Amplify data resource configuration
5. **Test Authentication**: Verify user context extraction works

### Breaking Changes

- Log format has changed (now structured JSON)
- User ID extraction now uses real authentication data
- Additional metadata fields added to all log entries

## Troubleshooting

### Common Issues

1. **"Failed to get user context"**: Check Amplify configuration and auth setup
2. **Missing user information**: Verify authentication is working in your app
3. **Empty logs**: Ensure CloudWatch logging is enabled in Amplify console

### Debug Mode

Enable verbose logging by setting environment variable:
```bash
export DEBUG_AUDIT_LOGGING=true
```

This enhanced logging system provides enterprise-grade audit capabilities while maintaining ease of use and development flexibility.