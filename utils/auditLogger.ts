// Enhanced audit logging utility with structured logging capabilities
export interface AuditLogEvent {
  timestamp: string;
  action: string;
  userId: string;
  userEmail?: string;
  userGroups?: string[];
  objectId?: string;
  details?: Record<string, any>;
  service: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

export interface UserContext {
  userId: string;
  email?: string;
  groups?: string[];
}

export class AuditLogger {
  private static generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  static logEvent(
    action: string,
    userContext: UserContext | null,
    options: {
      objectId?: string;
      details?: Record<string, any>;
      requestId?: string;
      userAgent?: string;
      ipAddress?: string;
    } = {}
  ): void {
    const auditEvent: AuditLogEvent = {
      timestamp: new Date().toISOString(),
      action,
      userId: userContext?.userId || 'anonymous',
      userEmail: userContext?.email,
      userGroups: userContext?.groups,
      objectId: options.objectId,
      details: options.details,
      service: 'objects-api',
      requestId: options.requestId || this.generateRequestId(),
      userAgent: options.userAgent,
      ipAddress: options.ipAddress
    };

    // Log to console in structured format (will go to CloudWatch when deployed)
    console.log('AUDIT_LOG:', JSON.stringify(auditEvent));

    // In production, you might also want to:
    // 1. Send to CloudWatch Logs with structured fields
    // 2. Send to a dedicated audit trail service
    // 3. Store in a separate audit database
    // 4. Send to compliance monitoring systems
  }

  // Convenience methods for common audit events
  static logObjectAccess(userContext: UserContext | null, objectId: string, objectCount?: number, requestContext?: any): void {
    this.logEvent('OBJECT_ACCESSED', userContext, {
      objectId,
      details: { objectCount },
      userAgent: requestContext?.userAgent,
      ipAddress: requestContext?.ipAddress
    });
  }

  static logObjectCreated(userContext: UserContext | null, objectId: string, objectData: any, requestContext?: any): void {
    this.logEvent('OBJECT_CREATED', userContext, {
      objectId,
      details: { 
        name: objectData.name,
        originalRequest: objectData
      },
      userAgent: requestContext?.userAgent,
      ipAddress: requestContext?.ipAddress
    });
  }

  static logObjectDeleted(userContext: UserContext | null, objectId: string, deletedObject: any, requestContext?: any): void {
    this.logEvent('OBJECT_DELETED', userContext, {
      objectId,
      details: { deletedObject },
      userAgent: requestContext?.userAgent,
      ipAddress: requestContext?.ipAddress
    });
  }

  static logAccessFailure(userContext: UserContext | null, objectId: string | undefined, error: string, statusCode: number, requestContext?: any): void {
    this.logEvent('OBJECT_ACCESS_FAILED', userContext, {
      objectId,
      details: { error, status: statusCode },
      userAgent: requestContext?.userAgent,
      ipAddress: requestContext?.ipAddress
    });
  }

  static logSystemError(userContext: UserContext | null, objectId: string | undefined, error: string, requestContext?: any): void {
    this.logEvent('OBJECT_ACCESS_ERROR', userContext, {
      objectId,
      details: { error },
      userAgent: requestContext?.userAgent,
      ipAddress: requestContext?.ipAddress
    });
  }
}