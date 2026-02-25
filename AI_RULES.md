# AI Rules & Guidelines

## Tech Stack

- **Framework**: React 19 + Vite 6
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (using `@theme` and `@apply` in `index.css`)
- **Routing**: React Router DOM v7
- **Animation**: Framer Motion v12
- **Icons**: Lucide React (available in dependencies) & Custom SVG components (`src/components/Icons.tsx`)
- **Data Persistence**: LocalStorage Mock (`src/lib/storageService.ts`)
- **State Management**: React Context (`AuthContext`) + Local State

## Development Rules

### 1. Styling & UI
- **Tailwind CSS**: Use Tailwind utility classes for all styling. Avoid inline styles.
- **Responsive Design**: Ensure layouts work on mobile first, using breakpoints (`md:`, `lg:`) for larger screens.
- **Components**: Keep components small and focused. Reusable UI components go in `src/components/`.
- **Admin UI**: Admin-specific components should reside in `src/components/admin/` and pages in `src/pages/admin/`.

### 2. Data Management
- **Storage Service**: All data reading and writing (Products, Users, Partners, Content) MUST use `src/lib/storageService.ts`.
- **No Backend**: This is a client-side app. Do not write backend API calls. Treat `storageService` as your database layer.
- **Events**: Listen for `ENT_STORAGE_UPDATED` window event to react to data changes if needed.

### 3. Navigation & Routing
- **Routes**: Define all application routes in `src/App.tsx`.
- **Links**: Use `<Link>` component for internal navigation.
- **Hooks**: Use `useNavigate` for programmatic navigation.

### 4. TypeScript
- **Types**: Define shared data models in `src/types/` (e.g., `admin.ts`, `content.ts`).
- **Props**: Always define interface/types for component props.
- **Strictness**: Avoid `any` types.

### 5. Icons
- Prefer using `lucide-react` for any new icons required.
- Existing custom icons are located in `src/components/Icons.tsx`.

### 6. File Structure
- `src/pages`: Top-level route components.
- `src/components`: Shared/reusable UI parts.
- `src/lib`: Utilities, helpers, and services.
- `src/context`: React Context providers.
- `src/types`: TypeScript type definitions.