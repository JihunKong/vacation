# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a gamified summer vacation planning and tracking system for Wando High School 2nd-year students, running from July 21 to August 17, 2025. The project uses Next.js 14 with TypeScript, PostgreSQL, and integrates gamification elements to encourage self-directed vacation planning.

## Essential Commands

```bash
# Development
npm run dev        # Start development server at localhost:3000

# Build & Production
npm run build      # Build for production (includes Prisma generation)
npm run start      # Start production server

# Database
npx prisma generate     # Generate Prisma Client
npx prisma db push      # Push schema to database
npx prisma studio       # Open Prisma Studio GUI

# Linting
npm run lint       # Run Next.js linter
```

## High-Level Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Railway
- **ORM**: Prisma
- **Auth**: NextAuth.js with Google OAuth
- **UI**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **AI**: OpenAI API integration

### Project Structure
```
app/
├── (auth)/        # Authentication flow
├── (main)/        # Student dashboard & features
├── (teacher)/     # Teacher admin panel
└── api/           # API routes (auth, plans, stats, ai)

components/
├── ui/            # Reusable UI components
├── layout/        # Layout components
└── features/      # Feature-specific components

lib/
├── db/            # Database utilities & Prisma client
├── utils/         # Shared utilities
└── constants/     # App-wide constants

prisma/
└── schema.prisma  # Database schema definition
```

### Key Architectural Decisions

1. **Authentication Flow**: NextAuth.js with Google provider, restricted to @gwe.go.kr domain
2. **State Management**: Server Components by default, Client Components for interactivity
3. **Database Operations**: All DB queries through Prisma Client in server components/API routes
4. **API Design**: RESTful endpoints under /api with consistent error handling
5. **UI Components**: shadcn/ui for consistent design system, customized with Tailwind

### Environment Variables Required
```
DATABASE_URL          # Railway PostgreSQL connection
NEXTAUTH_URL         # App URL (e.g., https://yourdomain.com)
NEXTAUTH_SECRET      # Random secret for NextAuth
GOOGLE_CLIENT_ID     # Google OAuth credentials
GOOGLE_CLIENT_SECRET
OPENAI_API_KEY       # For AI features
```

### Development Workflow

1. **Adding New Features**:
   - Create route in appropriate app directory group
   - Add API endpoints in app/api/
   - Use Server Components for data fetching
   - Client Components only for interactivity

2. **Database Changes**:
   - Modify prisma/schema.prisma
   - Run `npx prisma db push` to update database
   - Run `npx prisma generate` to update client

3. **Component Development**:
   - Use shadcn/ui components as base
   - Add custom components to components/features/
   - Keep UI components in components/ui/

### Important Implementation Notes

- **Gamification System**: XP calculations based on activity duration and category weights
- **Level System**: Levels 1-100 with exponential XP requirements
- **Activity Categories**: 학습, 운동, 독서, 취미, 봉사, 기타 (each with different XP multipliers)
- **Teacher Dashboard**: Requires special role in database, uses OpenAI for activity summaries
- **Date Handling**: All dates in KST, vacation period hardcoded (2025-07-21 to 2025-08-17)