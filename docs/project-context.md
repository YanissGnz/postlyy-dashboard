# Project Context — Postlyy-Front-End

> AI Agent Implementation Rules & Project Standards
> Last Updated: 2026-06-18

---

## Technology Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| Runtime | Node.js | 24.x | Required |
| Package Manager | Yarn | 1.22.19 | Use `yarn` not `npm` |
| Framework | Next.js | 14.0.3 | Using `experimental-compile` |
| React | React | 18.2.0 | Server Components + Client Components |
| Language | TypeScript | 5.1.6+ | Strict mode enabled |
| Styling | Tailwind CSS | 3.4.3 | With `tailwindcss-animate` + `@tailwindcss/typography` |
| State Management | Redux Toolkit | 1.9.7 | RTK Query for API slices |
| Auth | NextAuth.js | 4.24.5 | Twitter, LinkedIn, Google OAuth |
| Form Handling | react-hook-form | 7.48.2 + @hookform/resolvers | Zod validation |
| Env Validation | @t3-oss/env-nextjs | 0.7.1 | Typed environment variables |
| Icons | lucide-react | 0.293.0 + @iconify/react | Primary icon library |
| UI Components | Radix UI | latest | Headless accessible primitives |
| Animations | framer-motion | 11.0.5 | Primary animation library |
| Toast | sonner | 1.2.3 | Notifications |
| PWA | @ducanh2912/next-pwa | 10.2.5 | PWA support |
| Calendar | @fullcalendar/* | 6.1.10 | Multiple calendar views |
| Charts | apexcharts + react-apexcharts | 3.45.2 / 1.4.1 | Data visualization |
| Editor | Editor.js | 2.28.2 + plugins | Rich text editor |
| Date | date-fns | 3.3.1 + date-fns-tz | Date manipulation |

---

## Project Structure Rules

### File & Folder Naming

- **Pages/Routes** (under `src/app/`): kebab-case with parentheses for route groups → `(dashboard)/(layout)/`
- **Components**: PascalCase file names → `Button.tsx`, `UserProfile.tsx`
- **Hooks**: camelCase with `use` prefix → `useAuth.ts`, `useDashboard.ts`
- **Redux Slices**: camelCase with `Slice` suffix → `authSlice.ts`, `dashboardSlice.ts`
- **Redux API Slices**: placed in `api/<feature>/apiSlice.ts`
- **UI Components**: PascalCase, placed under `src/components/ui/`
- **Types**: PascalCase with prefix → `TPostForm.ts`, `TAccount.ts`, `TResponse.ts`
- **Providers**: kebab-case with `-provider.tsx` suffix → `auth-provider.tsx`, `redux-provider.tsx`

### Directory Organization

```
src/
├── app/                    # Next.js App Router (pages, layouts, routes)
│   ├── (dashboard)/        # Route group for dashboard pages
│   │   ├── layout.tsx
│   │   ├── middleware.ts
│   │   ├── home/
│   │   ├── post/
│   │   ├── settings/
│   │   └── ...
│   ├── api/                # API routes
│   │   ├── auth/
│   │   └── connect/
│   ├── auth/               # Auth pages (login, register, etc.)
│   └── layout.tsx          # Root layout
├── components/             # React components
│   └── ui/                 # Reusable UI primitives (Radix-based)
├── guard/                  # Route guards / auth guards
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── providers/              # Context providers (auth, theme, redux, token)
├── redux/                  # Redux store & slices
│   ├── api/                # RTK Query API slices
│   │   └── <feature>/apiSlice.ts
│   └── slices/             # Redux reducers
│       └── <name>Slice.ts
├── server/                 # Server-side utilities
├── styles/                 # Global styles
│   └── globals.css
├── types/                  # TypeScript type definitions
│   └── T<Name>.ts
├── env.js                  # Environment variable schema
└── env.js                  # Environment variable validation
```

---

## Critical Implementation Rules

### 1. Environment Variables

- **Always** use `@/env` to access typed environment variables: `import { env } from "@/env";`
- Server-only vars: `env.API_BASE_URL`, `env.NEXTAUTH_SECRET`
- Client-facing vars (prefixed `NEXT_PUBLIC_`): `env.NEXT_PUBLIC_API_BASE_URL`
- **Never** access `process.env` directly in components — always go through `@/env`
- Prices are typed as `number` (converted via `Number()` in env.js)

### 2. Redux Patterns

- **API Slices**: Use RTK Query pattern → `src/redux/api/<feature>/apiSlice.ts`
- **Reducer Slices**: Use `createSlice` → `src/redux/slices/<name>Slice.ts`
- **Store**: All API middleware and reducers registered in `src/redux/store.ts`
- **Dispatch/State types**: Import from store → `import type { RootState, AppDispatch } from "@/redux/store"`
- **Provider**: Wrap app in `<ReduxProvider>` in layout.tsx
- New API endpoints must be added to both `reducer` object and `middleware` array in store.ts

### 3. Component Patterns

- **"use client"** directive required for all client components
- Server components are the default — only add `"use client"` when needed
- UI components use Radix UI primitives wrapped in custom components
- Always use `cn()` (from `clsx` + `tailwind-merge`) for conditional class names
- Tailwind classes: use `className` with `cn()` for dynamic styling

### 4. Path Aliases

- Use `@/` prefix for internal imports (maps to `src/`)
- Example: `import { store } from "@/redux/store";`
- Example: `import "@/styles/globals.css";`
- **Never** use relative paths for cross-directory imports

### 5. Type Definitions

- All types go in `src/types/` as individual files named `T<Name>.ts`
- Use explicit export for each type/interface
- Common types: `TResponse<T>`, `TErrorResponse`, `TPaginatedRequest`, `TPaginatedResponse<T>`
- Enums use `E` prefix: `EPostSpotType`, `EUserType`, `ETiers`, etc.
- TypeScript `strict: true` enabled — no `any`, proper null checking required

### 6. Authentication

- NextAuth.js v4 with Twitter, LinkedIn, Google providers
- Auth provider wrapped in root layout
- Token provider for JWT management
- API base URL for auth: `env.NEXT_PUBLIC_AUTH_BASEURL`
- Route-level auth handled via `(dashboard)/middleware.ts`

### 7. Styling Rules

- Dark mode via `class` strategy with `next-themes`
- CSS variables for all theme colors (defined in globals.css)
- Border radius: `var(--radius)`, `calc(var(--radius) - 2px)`, `calc(var(--radius) - 4px)`
- Font: `Outfit` from Google Fonts, applied via `next/font/google`
- `font-sans` class applies the font family
- Tailwind `darkMode: ["class"]` in tailwind.config.ts

### 8. API Configuration

- External API base: `env.NEXT_PUBLIC_API_BASE_URL` (client), `env.API_BASE_URL` (server)
- Image remote patterns: only `https://api.postlyy.com` allowed
- React Strict Mode: **disabled** (`reactStrictMode: false`)

### 9. Development Commands

```bash
yarn dev          # Start dev server on port 3010
yarn build        # Build with experimental-compile
yarn lint         # Run ESLint
yarn start        # Start production server
```

### 10. Linting & Formatting

- ESLint with `@typescript-eslint` and `@next/eslint-plugin-next`
- Prettier with `prettier-plugin-tailwindcss` for class sorting
- Husky for git hooks
- `.eslintrc.cjs` — disable checks only when absolutely necessary (use `@typescript-eslint/no-unsafe-call`)

---

## Code Style Guidelines

### Imports Order

1. Node/built-in modules
2. External dependencies (alphabetically)
3. Internal `@/` imports (alphabetically)
4. Relative imports for same-folder files
5. CSS imports (last)

### Component Structure

```tsx
// Client component example
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  const [state, setState] = useState(false);

  return <Button onClick={onClick}>{title}</Button>;
}
```

### Redux API Slice Pattern

```typescript
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const <feature>Api = createApi({
  reducerPath: "<feature>Api",
  baseQuery,
  tagTypes: ["<Feature>"],
  endpoints: (build) => ({
    get<Feature>: build.query<TResponse<T<Feature>>, string>({
      query: (id) => `<endpoint>/${id}`,
      providesTags: ["<Feature>"],
    }),
  }),
});

export const { useGet<Feature>Query, useUpdate<Feature>Mutation } = <feature>Api;
```

### Type Export Pattern

```typescript
export interface T<Name> {
  id: string;
  name: string;
  // ...other fields
}

export type E<EnumName> = "option1" | "option2" | "option3";
```

---

## Anti-Patterns to Avoid

- ❌ Direct `process.env` access — always use `@/env`
- ❌ Relative imports across directories — use `@/` aliases
- ❌ `any` types — use proper TypeScript types
- ❌ Inline styles — use Tailwind classes
- ❌ Creating new UI components without checking `src/components/ui/` first
- ❌ Adding API endpoints without registering in store.ts
- ❌ Using `npm` or `npx` — always use `yarn`
- ❌ Modifying `reactStrictMode` — it's disabled for a reason
- ❌ Forgetting `"use client"` on client components that use hooks/state

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/env.js` | Environment variable validation schema |
| `src/app/layout.tsx` | Root layout with providers |
| `src/redux/store.ts` | Redux store with all API slices |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `next.config.js` | Next.js + PWA configuration |
| `tsconfig.json` | TypeScript compiler options |
| `src/styles/globals.css` | Global styles with CSS variables |
| `src/providers/` | All context providers |
| `src/components/ui/` | Reusable UI component library |
| `src/types/` | TypeScript type definitions |