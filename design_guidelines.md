# Design Guidelines: GoatBot v2 Instagram Dashboard

## Design Approach

**System:** Combination of Linear's minimalist developer aesthetic + Vercel's clean dashboard patterns + Railway's technical monitoring UI

**Rationale:** This is a data-heavy developer tool requiring clarity, performance monitoring, and configuration management. The design prioritizes information density and operational efficiency.

---

## Core Design Principles

1. **Information Hierarchy** - Critical bot status always visible, secondary configs organized in clear sections
2. **Real-time Focus** - Live updates for messages, connection status, and metrics without page refresh
3. **Developer-First** - Technical accuracy over visual flourishes, monospace fonts for data, clear status indicators

---

## Typography

**Families:**
- **Primary:** Inter (UI text, labels, body)
- **Monospace:** JetBrains Mono (logs, IDs, technical data, code snippets)

**Scale:**
- Headings: text-2xl, text-xl, text-lg (font-semibold)
- Body: text-base (font-normal)
- Small: text-sm (metadata, timestamps)
- Technical: text-sm (font-mono for IDs, tokens, logs)

---

## Layout System

**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: space-y-6, space-y-8
- Card margins: gap-4, gap-6

**Grid Structure:**
- Sidebar navigation: 16rem fixed width (hidden on mobile)
- Main content: Fluid with max-w-7xl container
- Stats cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Tables: Full-width responsive with horizontal scroll

---

## Component Library

### Navigation
- **Sidebar:** Fixed left navigation with bot logo, status indicator, main sections (Dashboard, Logs, Commands, Config, Users, Threads)
- **Top Bar:** Mobile hamburger menu, bot status badge, user account dropdown

### Dashboard Cards
- **Stats Cards:** Bot uptime, active threads, total users, messages sent/received today
- **Connection Status:** Live indicator (green dot = connected, amber = reconnecting, red = offline) with timestamp
- **Quick Actions:** Restart bot, refresh session, export logs buttons
- **Activity Feed:** Real-time message log with sender, thread, timestamp in scrollable container

### Data Display
- **Tables:** User list, thread list with columns (ID, Name, Messages, Last Active, Actions)
- **Logs Viewer:** Monospace terminal-style output with auto-scroll, filterable by level (info/warn/error)
- **Metrics Graphs:** Simple line charts for message volume, uptime trends (use recharts or chart.js)

### Forms & Configuration
- **Login Form:** Username/password fields with "Use AppState" toggle, proxy configuration
- **Bot Config:** Toggle switches for autoReconnect, randomUserAgent, autoMarkRead
- **Command Management:** List of loaded commands with enable/disable toggles

### Status Indicators
- **Badges:** Pill-shaped status badges (connected/offline, enabled/disabled)
- **Progress Bars:** Session health, rate limit usage
- **Icons:** Heroicons for navigation, status, actions

### Overlays
- **Modals:** Thread details, user profile, command editor
- **Toast Notifications:** Top-right corner for bot events (new message, reconnect, errors)

---

## Page Layouts

### Dashboard (Main)
- Top stats grid (4 columns: uptime, threads, users, messages)
- Connection status card with health metrics
- Two-column layout: Recent activity feed (left 2/3) + Quick actions sidebar (right 1/3)

### Logs Page
- Full-width terminal view with filter controls at top
- Auto-scroll toggle, export button, clear logs action

### Configuration Page
- Tabbed interface: Authentication, Bot Settings, Advanced Options
- Form sections with clear labels, help text for technical settings

### Commands Page
- Grid view of loaded command scripts with metadata
- Search/filter bar, add custom command button

### Users/Threads Pages
- Data table with search, sort, pagination
- Row actions: view details, mute/unmute, block/unblock

---

## Visual Treatment

**Contrast:** High contrast text on backgrounds for readability
**Borders:** Subtle borders on cards/tables (border-neutral-200/800)
**Shadows:** Minimal elevation (shadow-sm on cards)
**Rounded Corners:** Consistent border-radius (rounded-lg for cards, rounded-md for inputs)

---

## Responsive Behavior

- **Mobile:** Stack cards vertically, hide sidebar (use hamburger), horizontal scroll tables
- **Tablet:** 2-column stats grid, collapsible sidebar
- **Desktop:** Full multi-column layouts with fixed sidebar

---

## Animations

**Minimal and Purposeful:**
- Fade-in for new log entries
- Smooth transitions on navigation (transition-colors duration-200)
- Loading spinners for async operations
- NO scroll animations, parallax, or decorative effects

---

## Accessibility

- High contrast text ratios
- Keyboard navigation for all controls
- ARIA labels on icon-only buttons
- Focus visible states on interactive elements
- Status changes announced to screen readers

---

## Images

**No decorative images.** This is a technical dashboard - use:
- Bot logo/icon in sidebar header
- User avatars (from Instagram) in message feeds and user lists
- Placeholder avatars for threads without images