# Security Enhancement Framework

## Overview
This document outlines the comprehensive security measures implemented in the Mentor AI application.

## 🔐 Implemented Security Features

### 1. Sensitive Data Protection

#### Automated Pattern Detection
- **Credit Card Detection**: Blocks 13-19 digit sequences matching card patterns
- **SSN Detection**: Prevents storage of Social Security Numbers (XXX-XX-XXXX)
- **Bank Account Detection**: Identifies routing + account number patterns
- **CVV Detection**: Blocks security codes with common keywords
- **Real-time Prevention**: Triggers block data entry before storage
- **User Feedback**: Clear error messages explaining blocked content

#### Protected Fields
- Consultation messages (content field)
- Consultation notes
- Big purchase plan notes
- Mood entry notes
- Any user-generated text fields

#### Security Audit Logging
- **Financial Transactions**: All INSERT, UPDATE, DELETE operations logged
- **Consultation Payments**: Payment status changes and creation tracked
- **Profile Changes**: Phone, date of birth, and full name updates audited
- **Admin Access**: Admins can view full audit logs
- **User Transparency**: Users can view their own security events via `get_my_security_events()` function
- **Indexed Storage**: Fast audit log queries with optimized indexes

### 2. Authentication Security

#### Strong Password Requirements
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character
- Real-time validation with user feedback

#### Session Management
- Automatic session timeout after 30 minutes of inactivity
- Activity tracking (mouse, keyboard, scroll, touch events)
- Secure session cleanup on timeout
- Automatic redirect to login page

#### Error Handling
- Generic error messages to prevent information disclosure
- No exposure of specific authentication failure reasons
- Comprehensive security event logging (server-side only)

### 2. Input Validation & Sanitization

#### Client-Side Validation
- Email format validation
- Password strength requirements
- Message length limits (max 2000 characters)
- Professional registration validation (display name, bio, certifications)
- Real-time field validation with error feedback

#### Input Sanitization
All user inputs are sanitized to prevent injection attacks:
- HTML tag removal
- JavaScript pattern removal
- SQL keyword filtering
- URL/script injection prevention
- Whitespace normalization

### 3. AI Input Protection

#### Prompt Injection Detection
The system detects and blocks common prompt injection patterns:
- Instruction override attempts
- System prompt access attempts  
- Role manipulation attempts
- Context manipulation patterns

#### Content Filtering
- Message length validation
- Character encoding checks
- Suspicious pattern detection
- Automatic blocking with user feedback

### 4. API Security

#### Edge Function Protection
- **JWT Verification**: All edge functions require valid authentication tokens
- **Input Validation**: Type checking and boundary validation on all parameters
- **Rate Limiting**: Prevents abuse and DDoS attacks
  - AI chat: 20 requests/minute per user
  - General chat: 10 messages/minute per user
  - Consultation messages: 10 messages/minute per consultation
- **Error Handling**: Generic error responses, detailed logging server-side only

#### Rate Limiting Strategy
```typescript
// Client-side rate limiting
checkRateLimit(userId, maxRequests, windowMs)

// Server-side rate limiting (in edge functions)
checkRateLimit(userId, 20, 60000) // 20 req/min
```

### 5. Data Protection

#### Encryption
- **In Transit**: HTTPS/TLS enforced by default (deployment-level)
- **At Rest**: 
  - Passwords: Hashed with bcrypt (Supabase Auth)
  - Database: Encrypted at rest (Supabase infrastructure)
  - API Keys: Stored in environment variables, never in code

#### Row-Level Security (RLS)
- All database tables have RLS enabled
- Users can only access their own data
- Professional profiles publicly viewable but PII protected
- Consultation data restricted to participants only
- Admin-only access to verification audit logs

### 6. Professional Verification System

#### Verification Workflow
- **Registration Validation**: 
  - Display name validation (letters, spaces, hyphens, apostrophes only)
  - Bio minimum 50 characters
  - Specialties: 1-5 selections required
  - Hourly rate: $10-$1000 range
  - Years of experience: 0-70 years
  - Certifications: Maximum 10, sanitized input

- **Admin Verification**: 
  - Dedicated admin dashboard at `/admin`
  - Role-based access control using `has_role()` security definer function
  - Manual review of all professional credentials
  - Audit trail for all verification actions

- **Consultation Authorization**:
  - **CRITICAL**: Only verified professionals can accept consultations
  - Edge function checks `is_verified` and `is_active` status
  - Returns 403 Forbidden for unverified professionals
  - Prevents payment processing for unverified accounts

### 7. Security Event Logging & Audit System

#### Database Audit Trail
All sensitive operations are automatically logged to the `security_audit_log` table:

**Logged Events:**
- Financial transactions (INSERT, UPDATE, DELETE)
- Consultation payments and status changes
- Profile updates (phone, DOB, name changes)
- Login attempts (success/failure)
- User registrations
- Professional registrations
- Consultation bookings
- Rate limit violations
- Validation failures
- Verification actions (approve/reject)

**Audit Log Features:**
- RLS-protected: Only admins can view full audit logs
- Users can view their own security events via `get_my_security_events()` function
- Tracks user_id, action, table_name, record_id, and detailed metadata
- Indexed for efficient querying by user, table, and timestamp

#### Client-Side Logging
- Development: Console logging for debugging
- Session storage: Last 50 events for analysis
- Production recommendation: Backend logging service integration

### 8. Database Security Triggers

#### Audit Triggers
- `audit_financial_transaction_trigger`: Logs all financial transaction changes
- `audit_consultation_payment_trigger`: Tracks payment and status updates
- `audit_profile_changes_trigger`: Monitors sensitive profile field changes

#### Prevention Triggers
- `prevent_sensitive_data_messages_trigger`: Blocks sensitive data in messages
- `prevent_sensitive_data_consultation_notes_trigger`: Protects consultation notes
- `prevent_sensitive_data_purchase_notes_trigger`: Secures purchase plan notes
- `prevent_sensitive_data_mood_notes_trigger`: Guards mood entry notes

#### Database Functions
- `detect_sensitive_data(text)`: Pattern matching for sensitive information
- `get_my_security_events(limit)`: User access to their security audit trail
- `audit_financial_transaction()`: Financial operation logging
- `audit_consultation_payment()`: Payment event tracking
- `audit_profile_changes()`: Profile modification monitoring
- `prevent_sensitive_data_in_messages()`: Message content validation
- `prevent_sensitive_data_in_notes()`: Notes field validation

### 9. Secure Coding Practices

#### Environment Variables
- All secrets stored in environment variables
- No hardcoded credentials
- Proper secret rotation support

#### Error Messages
- Generic messages to users
- Detailed logging server-side only
- No stack traces exposed to clients

#### CORS Configuration
- Specific allowed origins
- Proper headers configuration
- OPTIONS preflight handling

## 🔧 Configuration Required

### Backend Configuration (Manual Steps)

#### 1. Enable Leaked Password Protection
Navigate to: **Backend → Authentication → Settings → Security**
- Enable "Leaked Password Protection"
- This checks passwords against known breach databases

#### 2. Configure Two-Factor Authentication (Recommended)
Navigate to: **Backend → Authentication → Settings → MFA**
- Enable Multi-Factor Authentication
- Select allowed methods (TOTP recommended)
- Configure backup codes

#### 3. Set Stripe Publishable Key (If Using Payments)
Add to environment variables:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
```

## 📋 Security Checklist

### Sensitive Data Protection ✅
- [x] Credit card pattern detection enabled
- [x] SSN pattern detection enabled
- [x] Bank account pattern detection enabled
- [x] CVV pattern detection enabled
- [x] Triggers active on all text fields
- [x] User-friendly error messages
- [x] No sensitive data stored in database

### Audit Logging ✅
- [x] Financial transaction logging active
- [x] Payment event tracking enabled
- [x] Profile change monitoring implemented
- [x] Indexed audit logs for performance
- [x] User access to own audit trail
- [x] Admin-only access to full audit logs
- [x] Automated audit trail generation

### Authentication ✅
- [x] Strong password policies enforced
- [x] Session timeout implemented (30 min)
- [x] Secure error messages
- [x] Security event logging
- [ ] 2FA enabled (manual configuration required)
- [ ] Leaked password protection enabled (manual configuration required)

### Input Validation ✅
- [x] Client-side validation on all forms
- [x] Server-side validation on all APIs
- [x] Input sanitization implemented
- [x] Length limits enforced
- [x] Professional registration validation

### API Security ✅
- [x] JWT verification enabled
- [x] Rate limiting implemented
- [x] CORS configured properly
- [x] Error handling standardized

### AI Safety ✅
- [x] Prompt injection detection
- [x] Content sanitization
- [x] Message length limits
- [x] Rate limiting per user
- [x] Secure system prompts

### Data Protection ✅
- [x] HTTPS enforced
- [x] Password hashing (Supabase)
- [x] RLS policies configured
- [x] No plaintext secrets
- [x] Environment variables used
- [x] Sensitive data patterns blocked
- [x] Real-time data validation
- [x] Comprehensive audit logging

### Professional Verification ✅
- [x] Admin dashboard implemented
- [x] Role-based access control
- [x] Verification workflow with audit trail
- [x] Consultation authorization checks
- [x] Input validation on registration
- [x] Verified professional badges

## 🚨 Security Incidents

### Reporting
If you discover a security vulnerability:
1. **Do not** disclose it publicly
2. Contact the development team immediately
3. Provide detailed information about the vulnerability
4. Allow time for patching before disclosure

### Response Plan
1. Acknowledge receipt within 24 hours
2. Assess severity and impact
3. Develop and test fix
4. Deploy patch
5. Notify affected users if necessary

## 🔄 Regular Security Maintenance

### Daily
- Review security audit logs for anomalies
- Monitor blocked sensitive data attempts
- Check for unusual transaction patterns

### Weekly
- Review authentication logs
- Monitor rate limiting effectiveness
- Check for suspicious activity patterns
- Review verification requests
- Analyze audit log trends

### Monthly
- Update dependencies for security patches
- Review and update security policies
- Test incident response procedures
- Audit admin actions
- Review sensitive data detection patterns
- Export and backup audit logs

### Quarterly
- Comprehensive security audit
- Penetration testing
- Update security documentation
- Review access controls
- Review and rotate API keys
- Test sensitive data detection accuracy
- Review audit log retention policies

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/managing-user-data)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [React Security Best Practices](https://react.dev/learn/security)

## 🔐 Security Principles

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Minimal access rights
3. **Secure by Default**: Security enabled automatically
4. **Fail Securely**: Graceful error handling
5. **Open Design**: Security through implementation, not obscurity
6. **Complete Mediation**: Check every access
7. **Psychological Acceptability**: User-friendly security

## 🎯 Security Architecture

### Role-Based Access Control (RBAC)
```sql
-- Admin role check using security definer function
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### Sensitive Data Detection System
```sql
-- Automated sensitive data pattern detection
CREATE FUNCTION detect_sensitive_data(input_text text)
RETURNS boolean
AS $$
  -- Detects: Credit cards, SSNs, bank accounts, CVV codes
  -- Prevents storage of sensitive financial/personal data
$$;

-- Applied via triggers to:
-- - consultation_messages.content
-- - consultations.notes
-- - big_purchase_plans.notes
-- - mood_entries.note
```

### Audit Trail System
```sql
-- Security audit log for all sensitive operations
CREATE TABLE security_audit_log (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Triggers automatically log:
-- - Financial transactions (INSERT, UPDATE, DELETE)
-- - Consultation payments and status changes
-- - Profile updates (phone, DOB, name)
```

### Verification Workflow
1. **Registration**: Professional submits credentials
2. **Validation**: Input validated and sanitized
3. **Pending Status**: Profile created as unverified
4. **Admin Review**: Admin reviews credentials in dashboard
5. **Verification**: Admin approves or rejects
6. **Audit Log**: Action recorded in verification_audit table
7. **Authorization**: Only verified professionals can accept consultations

### Password Security Best Practices
- Use unique passwords for each account
- Consider using a password manager
- Avoid personal information (name, birthdate)
- Enable 2FA for enhanced security
- Change passwords regularly
- Never share passwords

## 🛡️ Sensitive Data Protection Details

### What Data is Protected?
The system actively prevents storage of:
- **Credit Cards**: 13-19 digit sequences, formatted card numbers (XXXX-XXXX-XXXX-XXXX)
- **Social Security Numbers**: XXX-XX-XXXX format
- **Bank Accounts**: Routing number + account number combinations
- **CVV Codes**: 3-4 digit security codes with keywords

### How It Works
1. **Real-time Detection**: Before data is saved, triggers validate content
2. **Pattern Matching**: Regex patterns identify sensitive data formats
3. **Immediate Blocking**: Database rejects transactions containing sensitive data
4. **User Notification**: Clear error message explains what was blocked and why
5. **No Storage**: Sensitive data never reaches the database

### Protected Tables and Fields
- `consultation_messages.content` - Chat messages
- `consultations.notes` - Consultation notes
- `big_purchase_plans.notes` - Financial planning notes
- `mood_entries.note` - Wellness journal entries

### Audit Trail
All operations on sensitive data are logged:
- User ID and timestamp
- Operation type (INSERT, UPDATE, DELETE)
- Table and record affected
- Summary of changes (amounts, status changes, etc.)
- Accessible to users via `get_my_security_events()` function

---

Last Updated: 2025-10-18
Security Framework Version: 3.0.0
