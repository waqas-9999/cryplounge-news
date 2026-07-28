# Security Packages Installation Guide

## Required Dependencies

Install these packages to enable all security features:

```bash
npm install crypto-js zod isomorphic-dompurify
npm install -D @types/crypto-js
```

OR with yarn:

```bash
yarn add crypto-js zod isomorphic-dompurify
yarn add -D @types/crypto-js
```

## Package Descriptions

### crypto-js
- **Purpose:** Encrypt/decrypt localStorage data
- **Usage:** Protect sensitive user data from XSS attacks
- **Size:** ~117KB

### zod
- **Purpose:** Schema validation and type-safe form validation
- **Usage:** Validate all user inputs before processing
- **Size:** ~57KB

### isomorphic-dompurify
- **Purpose:** HTML sanitization (XSS prevention)
- **Usage:** Clean user-generated HTML content
- **Size:** ~45KB

## Environment Variables

Create a `.env` or `.env.local` file with:

```env
# Encryption key for localStorage (32+ characters recommended)
VITE_ENCRYPTION_KEY=your-super-secret-encryption-key-change-this-in-production-min-32-chars

# JWT secret for admin auth (when backend is ready)
VITE_JWT_SECRET=your-jwt-secret-key-min-32-characters-change-in-production

# CSRF secret (optional, auto-generated if not provided)
VITE_CSRF_SECRET=your-csrf-secret-key
```

⚠️ **IMPORTANT:** 
- Never commit `.env` files to git
- Use different keys for development and production
- Generate strong random keys (use: `openssl rand -base64 32`)

## Verification

After installation, verify packages are loaded:

```typescript
import CryptoJS from 'crypto-js';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

console.log('Security packages loaded:', { CryptoJS, z, DOMPurify });
```

## Next Steps

1. ✅ Install packages
2. ✅ Set environment variables
3. ✅ Security utilities are ready to use
4. ✅ Update AuthContext (see below)
5. ✅ Update admin routes
6. ✅ Test all security features

## Troubleshooting

### Issue: Module not found
**Solution:** Clear node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
**Solution:** Install type definitions
```bash
npm install -D @types/crypto-js
```

### Issue: Build errors in production
**Solution:** Ensure environment variables are set in your hosting platform

## Security Checklist

After installation:
- [ ] Packages installed successfully
- [ ] Environment variables configured
- [ ] No build errors
- [ ] localStorage is encrypted
- [ ] Forms have validation
- [ ] Admin routes are protected
- [ ] Rate limiting is active
- [ ] CSRF tokens are generated
- [ ] Error boundary is working

## Support

If you encounter issues, check:
1. Node version (v16+ recommended)
2. Package versions compatibility
3. Environment variables loaded correctly
4. Build configuration (Vite/Webpack)
