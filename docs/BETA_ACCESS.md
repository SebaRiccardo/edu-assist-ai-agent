# Beta Access Feature

This document describes the beta access code protection system implemented in the application.

## Overview

The beta access feature protects the entire application behind a 6-digit access code verification system. Users must enter a valid beta code to access any part of the application.

## How It Works

1. **Beta Access Page**: All users are redirected to `/beta-access` if they don't have a valid beta access token
2. **Code Verification**: Users enter a 6-digit code which is validated against a predefined list
3. **JWT Token**: Upon successful verification, a JWT token is created and stored in an HTTP-only cookie
4. **Middleware Protection**: The middleware checks for a valid token on every request

## Valid Beta Codes

The following codes are currently valid (defined in `src/lib/beta-access.ts`):

- `789012`
- `345678`
- `901234`
- `567890`
- `246813`
- `135792`
- `864209`
- `975310`
- `108642`

**Note**: Update these codes in production to your actual beta access codes.

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```env
BETA_ACCESS_SECRET='your-super-secret-key-change-in-production-min-32-chars'
```

**Important**: Change this to a strong, random secret in production (minimum 32 characters recommended).

### Token Expiration

Beta access tokens expire after 30 days. After expiration, users will need to re-enter their beta code.

## File Structure

```
src/
├── lib/
│   └── beta-access.ts          # Core beta access logic and JWT handling
├── actions/
│   └── beta-access.ts          # Server action for code verification
├── app/
│   └── beta-access/
│       └── page.tsx            # Beta access page UI
└── middleware.ts               # Protected by updateSession in lib/supabase/middleware.ts
```

## Usage

### Adding New Beta Codes

Edit `src/lib/beta-access.ts` and add codes to the `VALID_BETA_CODES` array:

```typescript
export const VALID_BETA_CODES = [
  '123456',
  '789012',
  // Add your new codes here
  '111111',
];
```

### Customizing Token Expiration

Edit the `createBetaAccessToken` function in `src/lib/beta-access.ts`:

```typescript
.setExpirationTime('30d') // Change to '7d', '90d', etc.
```

### Disabling Beta Access

To temporarily disable beta access protection, comment out the beta access check in `src/lib/supabase/middleware.ts`:

```typescript
// Check beta access first (before any other authentication)
// const betaAccessToken = request.cookies.get(getBetaAccessCookieName())?.value;
// ... rest of beta access code
```

## Security Considerations

1. **Secret Key**: Always use a strong, random secret for `BETA_ACCESS_SECRET` in production
2. **HTTPS Only**: In production, cookies are set with `secure: true`, requiring HTTPS
3. **HTTP-Only Cookies**: The JWT token is stored in an HTTP-only cookie to prevent XSS attacks
4. **Code Rotation**: Regularly rotate beta codes and remove old ones
5. **Token Validation**: Tokens are cryptographically signed and verified on each request

## Internationalization

The beta access page supports multiple languages. Add translations in:

- `messages/en.json` - English translations
- `messages/es.json` - Spanish translations

Example structure:

```json
{
  "BetaAccess": {
    "title": "Beta Access Required",
    "description": "Enter your 6-digit beta access code to continue",
    "submit": "Verify Code",
    "verifying": "Verifying...",
    "errorInvalidLength": "Code must be 6 digits",
    "errorInvalidCode": "Invalid beta access code",
    "errorGeneric": "An error occurred. Please try again."
  }
}
```

## Testing

1. Navigate to the application root
2. You should be redirected to `/beta-access`
3. Enter one of the valid codes (e.g., `123456`)
4. Upon success, you'll be redirected to `/dashboard`
5. The beta access cookie will be set for 30 days

## Troubleshooting

### Token Not Being Set

- Check that `BETA_ACCESS_SECRET` is defined in your environment variables
- Ensure cookies are enabled in your browser
- Verify HTTPS is being used in production

### Always Redirected to Beta Access

- Clear your browser cookies
- Check that the beta access token cookie (`beta_access_token`) is present
- Verify the JWT secret hasn't changed (which would invalidate old tokens)

### Code Not Working

- Verify the code is in the `VALID_BETA_CODES` array
- Ensure the code is exactly 6 digits
- Check server logs for any verification errors
