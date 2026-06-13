# Constants Directory

Well-organized constants and configurations for the application.

## File Structure

```
constants/
├── role-definitions.ts       # Role IDs, names, and descriptions
├── dashboard-routes.ts       # Dashboard-specific routes
├── public-routes.ts          # Public routes and payment flow routes
├── types.ts                  # Type definitions for constants
├── routes.ts                 # Main routes index (combines all routes)
├── index.ts                  # Exports everything
└── README.md                 # This file
```

## Files Overview

### `role-definitions.ts`
**Purpose**: Defines all user roles in the system

**Exports**:
- `ROLE_ID` - Role ID enumeration (SUPER_ADMIN, ADMIN, TENANT)
- `ROLE_NAME` - Maps role IDs to names
- `ROLE_DESCRIPTIONS` - Human-readable role descriptions

**Usage**:
```typescript
import { ROLE_ID, ROLE_NAME } from "@/constants";

if (userRole === ROLE_ID.ADMIN) {
  // Admin-only logic
}
```

### `dashboard-routes.ts`
**Purpose**: Defines all dashboard routes and their privilege requirements

**Exports**:
- `DASHBOARD_ROUTES_CONFIG` - Object with individual route definitions
- `DASHBOARD_ROUTES_ARRAY` - Array of dashboard routes (for iteration)

**Usage**:
```typescript
import { DASHBOARD_ROUTES_CONFIG, DASHBOARD_ROUTES } from "@/constants";

// Access specific route
const paymentsRoute = DASHBOARD_ROUTES_CONFIG.PAYMENTS;

// Iterate over all dashboard routes
DASHBOARD_ROUTES.map(route => console.log(route.label));
```

### `public-routes.ts`
**Purpose**: Defines public routes that don't require authentication

**Exports**:
- `PUBLIC_ROUTES_CONFIG` - Public routes (Browse, List Item, etc.)
- `PAYMENT_ROUTES_CONFIG` - Payment flow routes
- `PUBLIC_ROUTES_ARRAY` - Array of all public routes

**Usage**:
```typescript
import { PUBLIC_ROUTES_CONFIG, PUBLIC_ROUTES } from "@/constants";

const browseRoute = PUBLIC_ROUTES_CONFIG.BROWSE;
```

### `types.ts`
**Purpose**: TypeScript type definitions used across constants

**Exports**:
- `RoutePrivilege` - Type for route privileges
- `RouteConfig` - Interface for route configuration

**Usage**:
```typescript
import type { RouteConfig, RoutePrivilege } from "@/constants";

const route: RouteConfig = {
  path: "/example",
  label: "Example",
  privileges: [ROLE_ID.ADMIN],
};
```

### `routes.ts`
**Purpose**: Main index file combining all route definitions

**Exports**:
- `ROUTES` - Organized object with all route configurations
- `DASHBOARD_ROUTES` - Array of dashboard routes
- `PUBLIC_ROUTES` - Array of public routes
- `getAllRoutes()` - Function to get all routes

**Usage**:
```typescript
import { ROUTES, DASHBOARD_ROUTES } from "@/constants";

// Access specific route
const paymentRoute = ROUTES.DASHBOARD.PAYMENTS;

// Use with ProtectedRoute
<ProtectedRoute requiredPrivileges={ROUTES.DASHBOARD.PAYMENTS.privileges}>
  <PaymentContent />
</ProtectedRoute>
```

### `index.ts`
**Purpose**: Barrel export file for the constants directory

**Exports**: Everything from all other files

**Usage**:
```typescript
import { ROLE_ID, ROUTES, DASHBOARD_ROUTES } from "@/constants";
```

## Usage Patterns

### Pattern 1: Access a Specific Route
```typescript
import { ROUTES } from "@/constants";

const route = ROUTES.DASHBOARD.PAYMENTS;
console.log(route.path);        // "/dashboard/payments"
console.log(route.privileges);  // [ROLE_ID.ADMIN]
```

### Pattern 2: Iterate Over Routes
```typescript
import { DASHBOARD_ROUTES } from "@/constants";

DASHBOARD_ROUTES.forEach(route => {
  console.log(route.label);  // "Payments", "Profile", etc.
});
```

### Pattern 3: Access Role Information
```typescript
import { ROLE_ID, ROLE_NAME, ROLE_DESCRIPTIONS } from "@/constants";

console.log(ROLE_NAME[ROLE_ID.ADMIN]);          // "ADMIN"
console.log(ROLE_DESCRIPTIONS[ROLE_ID.ADMIN]);  // "Dashboard and management access"
```

### Pattern 4: Protect Routes
```typescript
import { ROUTES } from "@/constants";
import { ProtectedRoute } from "@/components/ProtectedRoute";

<ProtectedRoute requiredPrivileges={ROUTES.DASHBOARD.PAYMENTS.privileges}>
  <PaymentContent />
</ProtectedRoute>
```

### Pattern 5: Filter Routes by Role
```typescript
import { DASHBOARD_ROUTES } from "@/constants";
import { RouteFilter } from "@/lib/permissions";

const accessibleRoutes = RouteFilter.filterAccessibleRoutes(
  DASHBOARD_ROUTES,
  userRole
);
```

## Adding New Constants

### To Add a New Dashboard Route:

1. **Edit `dashboard-routes.ts`**:
```typescript
export const DASHBOARD_ROUTES_CONFIG = {
  // ... existing routes
  NEW_FEATURE: {
    path: "/dashboard/new-feature",
    label: "New Feature",
    privileges: [ROLE_ID.ADMIN],
    description: "New feature description",
  },
};
```

2. **That's it!** The route will be automatically included in:
   - `DASHBOARD_ROUTES_ARRAY`
   - `ROUTES.DASHBOARD.NEW_FEATURE`
   - Sidebar navigation (auto-filtered by permissions)

### To Add a New Role:

1. **Edit `role-definitions.ts`**:
```typescript
export const ROLE_ID = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  TENANT: 3,
  MODERATOR: 4,  // New role
} as const;

export const ROLE_NAME = {
  1: "SUPER_ADMIN",
  2: "ADMIN",
  3: "TENANT",
  4: "MODERATOR",  // New role
} as const;

export const ROLE_DESCRIPTIONS = {
  // ... existing descriptions
  [ROLE_ID.MODERATOR]: "Content moderation access",
};
```

2. **Update route privileges** where the new role should have access:
```typescript
PAYMENTS: {
  // ... existing config
  privileges: [ROLE_ID.ADMIN, ROLE_ID.MODERATOR],  // Add new role
},
```

## Best Practices

1. **Keep constants organized** - Use separate files for different categories
2. **Use descriptive names** - Route labels should be clear
3. **Document purposes** - Add descriptions to routes
4. **Reference constants** - Never hardcode route paths or role IDs
5. **Update in one place** - Changes cascade automatically through the system
6. **Export from index** - Always export from `/constants` in imports

## Import Examples

```typescript
// ✅ Correct - Import from constants barrel
import { ROLE_ID, ROUTES, DASHBOARD_ROUTES } from "@/constants";

// ❌ Avoid - Direct imports from individual files
import { ROLE_ID } from "@/constants/role-definitions";
```

## Type Safety

All constants are fully typed:

```typescript
import type { RouteConfig, RoutePrivilege } from "@/constants";

// RoutePrivilege: 1 | 2 | 3 (SUPER_ADMIN, ADMIN, TENANT)
// RouteConfig: Typed interface with path, label, privileges, etc.
```

## Updating for New Features

1. **New dashboard section?** → Add to `dashboard-routes.ts`
2. **New public page?** → Add to `public-routes.ts`
3. **New role?** → Add to `role-definitions.ts`
4. **New types?** → Add to `types.ts`

Everything else updates automatically through the permission system!
