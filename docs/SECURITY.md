# Security Guidelines

This document outlines security best practices for the Expo project.

## 🔐 Storage Encryption Key Management

### Critical Security Implementation

The application uses MMKV for encrypted local storage. The encryption key is managed through environment variables to prevent exposure in source code.

### Generate a Secure Encryption Key

#### Method 1: Using OpenSSL (Recommended)

```bash
# Generate 256-bit (32 bytes) random key
openssl rand -base64 32

# Example output: xJ9K2mN5pQ8rT3vW6yZ1bC4dE7fG0hIjLkMnOpQrStU=
```

#### Method 2: Using Node.js

```bash
# Generate random key using Node crypto
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Method 3: Using Python

```bash
# Generate random key using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Environment Configuration

1. **Add to your `.env` file:**

   ```env
   EXPO_PUBLIC_STORAGE_KEY=your-generated-256-bit-key-here
   ```

2. **For different environments:**
   - **Development**: Use a development-specific key
   - **Staging**: Use a staging-specific key
   - **Production**: Use a unique, securely generated key

### Key Rotation Strategy

1. **When to Rotate:**
   - Every 6-12 months (regular maintenance)
   - Immediately if key exposure is suspected
   - When a team member with access leaves

2. **Rotation Process:**

   ```bash
   # 1. Generate new key
   openssl rand -base64 32

   # 2. Update environment variables
   # 3. Deploy with new key
   # 4. Existing encrypted data will be unreadable
   # 5. Implement migration logic if needed
   ```

### Security Best Practices

#### ✅ DO:

- Store encryption keys only in environment variables
- Use different keys for different environments
- Generate cryptographically secure random keys (256-bit minimum)
- Rotate keys regularly
- Limit access to production keys to essential personnel only
- Use secret management services (AWS Secrets Manager, Azure Key Vault) for production

#### ❌ DON'T:

- Never commit encryption keys to version control
- Never share keys via email, chat, or plain text
- Never use predictable or weak keys (passwords, birthdays)
- Never use the same key across multiple environments
- Never hardcode keys in source code

### Environment Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` contains placeholder values only
- [ ] Production keys are stored securely (secret manager)
- [ ] Access to production keys is logged and audited
- [ ] Key rotation schedule is documented
- [ ] Team is trained on secret management

### Additional Security Considerations

1. **Device Security:**
   - Enable device encryption
   - Implement biometric authentication
   - Use jailbreak/root detection

2. **Network Security:**
   - Use certificate pinning for API calls
   - Implement proper SSL/TLS validation
   - Use VPN for corporate environments

3. **Code Security:**
   - Enable ProGuard/R8 minification for Android
   - Use code signing certificates
   - Implement anti-tampering checks

### Incident Response

If encryption key exposure is suspected:

1. **Immediate Actions:**
   - Rotate the compromised key immediately
   - Force logout of all users
   - Clear local storage on next app launch
   - Investigate the breach scope

2. **Post-Incident:**
   - Review access logs
   - Update security policies
   - Conduct security training
   - Implement additional monitoring

### Security Tools & Services

- **Sentry**: Error tracking and performance monitoring
- **Expo Application Services (EAS)**: Build and deployment security
- **Secret Scanning**: GitHub secret scanning or similar tools
- **Dependency Scanning**: npm audit or Snyk for vulnerability detection

---

**Remember: Security is an ongoing process, not a one-time setup. Regular audits and updates are essential.**
