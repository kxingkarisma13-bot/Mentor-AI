import { z } from "zod";

// Password validation schema with strong requirements
export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// Email validation
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters");

// Auth form validation
export const authFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Chat message validation
export const chatMessageSchema = z.object({
  content: z.string()
    .min(1, { message: "Message cannot be empty" })
    .max(2000, { message: "Message must be less than 2000 characters" })
    .refine(
      (val) => val.trim().length > 0,
      { message: "Message cannot be empty" }
    ),
});

// Profile validation
export const profileSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username must be less than 50 characters" })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, underscores, and hyphens" }),
  full_name: z.string()
    .max(100, { message: "Name must be less than 100 characters" })
    .optional(),
  bio: z.string()
    .max(500, { message: "Bio must be less than 500 characters" })
    .optional(),
  age: z.number()
    .int()
    .min(13, { message: "You must be at least 13 years old" })
    .max(120, { message: "Please enter a valid age" })
    .optional(),
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, { message: "Please enter a valid phone number" })
    .max(20, { message: "Phone number is too long" })
    .optional(),
  location: z.string()
    .max(100, { message: "Location must be less than 100 characters" })
    .optional(),
  occupation: z.string()
    .max(100, { message: "Occupation must be less than 100 characters" })
    .optional(),
});

// Professional registration validation schema
export const professionalRegistrationSchema = z.object({
  display_name: z.string()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Display name can only contain letters, spaces, hyphens, and apostrophes"),
  bio: z.string()
    .min(50, "Bio must be at least 50 characters to properly describe your expertise")
    .max(1000, "Bio must be less than 1000 characters"),
  specialties: z.array(z.string())
    .min(1, "Please select at least one specialty")
    .max(5, "Please select no more than 5 specialties"),
  hourly_rate: z.number()
    .min(10, "Hourly rate must be at least $10")
    .max(1000, "Hourly rate must be less than $1000"),
  years_experience: z.number()
    .min(0, "Years of experience cannot be negative")
    .max(70, "Years of experience must be less than 70"),
  certifications: z.array(z.string())
    .max(10, "Maximum 10 certifications allowed")
    .optional(),
});

// Review validation schema
export const reviewSchema = z.object({
  rating: z.number()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  review_text: z.string()
    .min(10, "Review must be at least 10 characters")
    .max(500, "Review must be less than 500 characters")
    .optional(),
});

// Sanitize user input to prevent injection attacks
export function sanitizeInput(input: string): string {
  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script-like patterns
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove potential SQL injection patterns (though we use parameterized queries)
  sanitized = sanitized.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi, '');
  
  // Limit consecutive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized.trim();
}

// Detect potential prompt injection attempts
export function detectPromptInjection(text: string): boolean {
  const injectionPatterns = [
    /ignore (previous|all|above) (instructions|prompts?)/gi,
    /forget (everything|all|previous)/gi,
    /you are (now|a) .*(assistant|bot|ai)/gi,
    /system (prompt|message|instruction)/gi,
    /override (previous|system) (instructions|rules)/gi,
    /reveal (your|the) (system|prompt|instructions)/gi,
    /\[system\]/gi,
    /\[assistant\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
  ];

  return injectionPatterns.some(pattern => pattern.test(text));
}

// Rate limiting helper (client-side)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count++;
  return { allowed: true };
}

// Session timeout management
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let lastActivityTime = Date.now();
let sessionTimeoutId: NodeJS.Timeout | null = null;

export function initializeSessionTimeout(onTimeout: () => void) {
  updateLastActivity();
  
  const checkSession = () => {
    const now = Date.now();
    if (now - lastActivityTime > SESSION_TIMEOUT_MS) {
      onTimeout();
    }
  };

  // Check every minute
  sessionTimeoutId = setInterval(checkSession, 60000);

  // Track user activity
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  activityEvents.forEach(event => {
    document.addEventListener(event, updateLastActivity);
  });

  return () => {
    if (sessionTimeoutId) clearInterval(sessionTimeoutId);
    activityEvents.forEach(event => {
      document.removeEventListener(event, updateLastActivity);
    });
  };
}

export function updateLastActivity() {
  lastActivityTime = Date.now();
}

export function clearSessionTimeout() {
  if (sessionTimeoutId) {
    clearInterval(sessionTimeoutId);
    sessionTimeoutId = null;
  }
}

// Security event logging
export interface SecurityEvent {
  event_type: 'login_attempt' | 'login_success' | 'login_failure' | 'registration' | 'verification_request' | 'professional_registration' | 'consultation_booking' | 'rate_limit_exceeded' | 'validation_failure';
  user_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log security events (client-side logging for development, should be enhanced with backend logging)
 */
export const logSecurityEvent = (event: SecurityEvent) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    ...event,
    timestamp,
    environment: import.meta.env.MODE,
  };
  
  // Console logging for development
  if (import.meta.env.MODE === 'development') {
    console.log('[SECURITY EVENT]', logEntry);
  }
  
  // In production, this should send to a backend logging service
  // For now, we'll store recent events in sessionStorage for debugging
  if (typeof window !== 'undefined') {
    try {
      const recentEvents = JSON.parse(sessionStorage.getItem('security_events') || '[]');
      recentEvents.push(logEntry);
      // Keep only last 50 events
      if (recentEvents.length > 50) {
        recentEvents.shift();
      }
      sessionStorage.setItem('security_events', JSON.stringify(recentEvents));
    } catch (e) {
      console.error('Failed to log security event:', e);
    }
  }
};
