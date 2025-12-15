# GoatBot v2 - Instagram Dashboard

## Overview

GoatBot v2 is an Instagram automation bot with a full-featured web dashboard for control and monitoring. The application provides real-time bot management, command configuration, user tracking, thread management, and activity logging. Built as a developer tool with a focus on information density, real-time updates, and operational efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (supports light/dark mode)
- **Real-time Updates**: WebSocket connection for live data synchronization
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **HTTP Server**: Express with custom middleware for logging and JSON parsing
- **WebSocket**: Native `ws` library for real-time client communication
- **Static Serving**: Production builds served from `dist/public`

### Data Storage
- **Primary Database**: PostgreSQL (configured via Drizzle ORM)
- **Schema Location**: `shared/schema.ts` defines all database tables
- **Fallback Storage**: JSON file-based storage in `data/database.json` for development/offline use
- **ORM**: Drizzle ORM with drizzle-zod for schema validation

### Key Data Models
- **Users**: Instagram users tracked by the bot (admin status, block status, message counts)
- **Threads**: DMs and group chats with message history
- **Commands**: Bot commands with enable/disable, cooldown, usage tracking
- **BotConfig**: Global bot settings (prefix, auto-reconnect, rate limits)
- **Session**: Instagram authentication state
- **ActivityLogs**: System logs for debugging and monitoring

### Bot Core System
- **Location**: `server/bot/core.ts` and `server/bot/commandLoader.ts`
- **Command Loading**: Built-in commands plus custom scripts from `scripts/` directory
- **Command Pattern**: Each command exports name, description, category, usage, cooldown, and execute function
- **Cooldown System**: Per-user command cooldowns to prevent spam

### API Structure
All API endpoints are prefixed with `/api/`:
- `GET/PATCH /api/config` - Bot configuration
- `GET /api/session` - Authentication session status
- `GET /api/stats` - Bot statistics (uptime, message counts)
- `GET/POST /api/commands` - Command management
- `GET /api/users` - User listing
- `GET /api/threads` - Thread listing
- `GET /api/logs` - Activity logs
- `POST /api/bot/start`, `/api/bot/stop` - Bot control

### Real-time Communication
- WebSocket server at `/ws` path
- Broadcasts: stats, session, log, command, user, thread updates
- Client hook `use-websocket.ts` handles connection, reconnection, and query invalidation

## External Dependencies

### Database
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migrations via `npm run db:push`

### UI Libraries
- **Radix UI**: Complete set of accessible UI primitives (dialogs, dropdowns, forms, etc.)
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component
- **React Day Picker**: Calendar component
- **CMDK**: Command palette component
- **Vaul**: Drawer component

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation (shared between frontend and backend)
- **drizzle-zod**: Auto-generates Zod schemas from Drizzle tables

### Development Tools
- **Vite**: Frontend build and dev server with HMR
- **esbuild**: Server bundling for production
- **TypeScript**: Type checking across the entire codebase

### Replit-specific
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Development tooling
- `@replit/vite-plugin-dev-banner`: Development banner