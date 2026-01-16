# Task Manager

## Overview

A Trello/Linear-style task management application built with Next.js 16. The app provides workspace-based organization with boards, columns, and tasks, plus project management with team collaboration features. Users can create boards, organize tasks in columns, drag-and-drop tasks between statuses, and collaborate on projects with team members.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with custom dark theme and glassmorphism effects
- **State Management**: React Server Components with Server Actions for mutations
- **Drag & Drop**: @dnd-kit library for kanban board interactions

### Backend Architecture
- **API Pattern**: Server Actions (Next.js "use server" functions) instead of traditional API routes
- **Authentication**: NextAuth v5 (beta) with JWT strategy and credentials provider
- **Password Hashing**: bcrypt for secure password storage
- **Validation**: Zod schemas for form and API input validation

### Data Model
The application uses a hierarchical structure:
- **Users** own Workspaces and Projects
- **Workspaces** contain Boards (personal task management)
- **Projects** contain Boards and Members (team collaboration)
- **Boards** contain Columns
- **Columns** contain Tasks
- **Tasks** have status, priority, due dates, and assignees

### Route Structure
- `/(dashboard)` - Protected routes for authenticated users (main app, tasks, projects)
- `/(public)` - Public routes for authentication (signin, signup)
- `/api` - API routes for registration and NextAuth handlers

### Key Design Decisions

1. **Server Actions over API Routes**: Chose Server Actions for all data mutations because they provide simpler code, automatic revalidation, and type safety. Traditional API routes only used for NextAuth and user registration.

2. **JWT Strategy for Auth**: Using JWT instead of database sessions to avoid Edge Runtime issues with Prisma on Vercel. This means no PrismaAdapter is needed.

3. **Runtime Configuration**: Explicitly set `runtime = "nodejs"` on auth and API routes because Prisma requires Node.js runtime, not Edge.

4. **Component Organization**: UI components in `/components/ui`, feature components (kanban, analytics) in dedicated folders. Kanban has separate implementations for general tasks and project boards.

## External Dependencies

### Database
- **Prisma ORM** with PostgreSQL (configured for Vercel Postgres via `POSTGRES_PRISMA_URL` or standard `DATABASE_URL`)
- Schema includes: User, Account, Session, Workspace, Project, ProjectMember, Board, Column, Task

### Authentication
- **NextAuth v5** (next-auth@5.0.0-beta.30)
- Credentials provider with email/password
- Requires `NEXTAUTH_SECRET` environment variable

### Key NPM Packages
- `@dnd-kit/core`, `@dnd-kit/sortable` - Drag and drop functionality
- `date-fns` - Date formatting
- `zod` - Runtime type validation
- `bcrypt` - Password hashing

### Environment Variables Required
- `DATABASE_URL` or `POSTGRES_PRISMA_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for JWT signing
- `NEXTAUTH_URL` - Base URL for auth callbacks (production)