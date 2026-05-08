# Project Blueprint: High-End Enterprise Membership & Awards Portal

This document serves as a master map for recreating the architectural, visual, and logical framework of this project. It is designed to be framework-agnostic but optimized for modern full-stack environments (e.g., SvelteKit, Next.js).

---

## 🏗️ 1. Architecture Overview

### Core Stack
- **Framework**: Modern Meta-Framework (SvelteKit/Next.js)
- **Database**: SQL-based with Type-Safe ORM (Drizzle/Prisma)
- **Styling**: Utility-first CSS (Tailwind CSS v4+)
- **Components**: Standardized Design System (Shadcn UI base)
- **Storage**: Object Storage System (MinIO/S3)
- **Auth**: Role-Based Access Control (RBAC) with Session Management

### Logical Structure
- `(app)`: Public-facing routes (Marketing, Public Content)
- `(auth)`: Authentication flows (Login, Register, Reset)
- `(protected)`: Authenticated user dashboard and community features
- `(protected)/admin`: Administrative management system
- `api/`: Modularized API endpoints mirroring feature groups

---

## 🎨 2. Visual Identity & Design System

### Typography
- **Primary Font**: `Outfit` (Headings & Brand)
- **Secondary Font**: `Figtree` (UI & Body)
- **Constraints**:
  - **MAX Weight**: `font-bold` (700). Never use extrabold/black.
  - **Feel**: Tracking-tight headings for a premium, compact look.

### Semantic Color System (oklch)
Use a semantic variable-based system for theme-agnostic compliance:
- `primary`: The brand highlight color.
- `background` / `foreground`: Base page colors.
- `card` / `popover`: Elevated surface colors.
- `muted` / `accent`: Secondary and interaction highlights.
- `border` / `input` / `ring`: Structural UI colors.

### The "Premium" Signature
- **Glassmorphism**: `backdrop-blur-3xl` combined with `bg-card/80` and subtle borders.
- **Micro-Animations**:
  - `fade-in`: Standard entrance animation.
  - `float`: Gentle Y-axis oscillation for icons.
  - `pulse-glow`: Subtle box-shadow pulsing for "Featured" cards.
  - `shimmer`: Linear gradient text/background movement for loading/highlights.
- **Constraints**:
  - **Max Radius**: `rounded-xl` (0.75rem).
  - **Max Shadow**: `shadow-lg`.

---

## 📊 3. Database Schema Map (Generic)

### Core System
- `user`: Identity, roles (user, admin), subscription status.
- `session` / `account`: Auth persistence and OAuth providers.
- `file`: Centralized file registry (MinIO remote IDs, URLs, metadata).

### Content & Events
- `news`: Categorized articles with featured status.
- `event`: Scheduled occurrences with cover images and status tracking.
- `partner` / `trustee`: Stakeholder management with display ordering.
- `resource`: Downloadable content (reports, whitepapers) with view counts.
- `page_content`: JSON-driven CMS for dynamic path-based content.

### Feature Systems
- **Awards System**:
  - `award_entry`: Detailed project submissions with status workflow.
  - `nomination`: Third-party nominee tracking.
  - `awards_jury` / `award_winner`: Historical data for past awards.
- **Community System**:
  - `community_post` / `reply`: Threaded discussion system.
  - `community_like`: Multi-entity like registry (posts and replies).
- **Membership & Payments**:
  - `organization`: B2B entity management.
  - `organization_member`: Team/Staff roles within an organization.
  - `membership_payment`: Transaction ledger with reference tracking.

---

## 🔗 4. Endpoint & Route Architecture

### Public Routes `(app)`
- `/about`, `/team`, `/partnerships`: Brand storytelling.
- `/events`, `/gallery`, `/news`: Dynamic content feeds.
- `/awards`, `/membership`: Conversion-focused landing pages.
- `/legal`: Terms, Privacy, Cookie management.

### Protected User Routes `(protected)`
- `/dashboard`: User-specific overview and activity.
- `/community`: Social interaction hub.
- `/profile`: Identity and preference management.
- `/membership/register`: Onboarding and payment flow.

### Admin Management Routes `(protected)/admin`
- `/users`, `/organizations`: Identity management.
- `/news`, `/events`, `/gallery`: Content management (CRUD).
- `/awards`: Submission review and jury management.
- `/logs`: System-wide activity auditing.

---

## 🧩 5. Component Standards

### Standardized UI (Atomic)
- Use a central UI library for Buttons, Inputs, Dialogs, etc.
- **RULE**: Zero custom class overrides on base components. Props-only configuration.

### Composite Components
- **Editor Suite**:
  - `AlbumEditor`: Multi-file upload, display ordering, visibility toggles.
  - `ContentEditor`: Rich text and metadata management.
- **Layout Suite**:
  - `MainSidebar`: Navigation with active state logic.
  - `GlobalSearch`: Command-palette style search (K-bar).
  - `CookieConsent`: Theme-aware legal compliance banner.

---

## 🛠️ 6. Reusable Logic Patterns

### File Handling Logic
- **Upload Flow**: Client → API Proxy → MinIO/S3 → DB Registry.
- **Optimization**: Automatic size and type metadata extraction.

### Payment Integration
- **Webhook Pattern**: Secure callback handling for payment status updates.
- **Currency Handling**: Smallest unit storage (cents/kobo) with metadata-driven conversion.

### SEO & Metadata
- Hierarchical metadata injection: Global Defaults → Page Server Data → Content JSON.
- OG Image generation support for dynamic routes (Gallery/Events).

### RBAC Middleware
- Server-side session validation.
- Path-based role enforcement (e.g., `/admin/*` requires `role == 'admin'`).

---

**End of Blueprint**
