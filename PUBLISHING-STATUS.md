# Public Release Status: `@sard/*` Packages

## Current Blocker
The `@sard` organization does not exist in the npm registry. Publish commands return **404 E404** because npm cannot find the org namespace.

## Root Cause
The npm authentication token (`npm_[TOKEN_REDACTED]`) lacks the privileges to create organizations. npm's registry requires 2FA to be enabled on the account before allowing organization creation via API or CLI.

## Steps to Resolve

### Step 1: Enable 2FA on npm account (Required)
1. Navigate to https://www.npmjs.com/settings/change_two_factor
2. Enable Two-Factor Authentication
   - Method: Authenticator App (recommended) or SMS
   - Backup codes MUST be saved in a secure location
3. Once enabled, log out and log back in to ensure 2FA is active

### Step 2: Create the `@sard` Organization
Once 2FA is enabled:
```bash
# Option A: Via npm CLI (requires 2FA enabled)
npm org create sard --json

# Option B: Via REST API (requires 2FA token)
curl -X PUT "https://registry.npmjs.org/org/sard" \
  -H "Authorization: Bearer [TOKEN_REDACTED]" \
  -H "Content-Type: application/json" \
  -d '{"name":"sard"}'
```

### Step 3: Verify Organization Exists
```bash
npm org ls sard
# Should return: { sard: [ 'ahmedsturki' ] }
```

### Step 4: Re-publish Packages
After org creation, all four packages need to be republished:
```bash
cd packages/core && npm publish --access public
cd ../cli && npm publish --access public
cd ../components && npm publish --access public
cd ../portable-text && npm publish --access public
```

### Step 5: Verify Public Access
```bash
npm view @sard/core
npm view @sard/cli
npm view @sard/components
npm view @sard/portable-text
# Should all return package metadata, not 404
```

### Step 6: Cleanup
- Remove any `NPM_CONFIG_AUTHTOKEN` environment variable (legacy format)
- Verify all `.npmrc` files use the canonical format: `//registry.npmjs.org/:_authToken=TOKEN`

## Package Status

| Package | Published Version | Status |
|---------|------------------|--------|
| `@sard/core` | 0.0.1 | Ready to publish (after org creation) |
| `@sard/cli` | 0.0.1 | Ready to publish (after org creation) |
| `@sard/components` | 0.0.1 | Ready to publish (after org creation) |
| `@sard/portable-text` | 0.0.1 | Ready to publish (after org creation) |

## Troubleshooting

### Persistent 404 After Org Creation
If packages still return 404 after the org is created:
1. Check the package name in `package.json` matches the scoped name
2. Ensure `--access public` was used
3. Wait 1-2 minutes for propagation
4. Try publishing again with a patch version bump:
   ```bash
   npm version patch && npm publish --access public
   ```

### Token Permissions
The token must have the `org` scope. Verify by:
```bash
curl -H "Authorization: Bearer [TOKEN_REDACTED]" "https://registry.npmjs.org/-/whoami"
```
