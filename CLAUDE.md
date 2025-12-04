# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: Database Policy

**NEVER USE RAILWAY FOR DATABASE**
- Always use Docker PostgreSQL running locally on the server
- DATABASE_URL should always be: `postgresql://postgres:postgres@localhost:5432/studylog_db`
- Docker containers: `studylog_postgres` (PostgreSQL) and `studylog_redis` (Redis)
- PM2 is used for process management, NOT Railway

## Project Overview

This is a gamified study logging and tracking system for students. The project uses Next.js 14 with TypeScript, PostgreSQL, and integrates gamification elements to encourage self-directed learning and consistent study habits.

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
- **Database**: PostgreSQL via Docker (⚠️ NEVER use Railway - Always use Docker PostgreSQL)
- **ORM**: Prisma
- **Auth**: NextAuth.js with Google OAuth
- **UI**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **AI**: OpenAI API integration + Google Gemini for image generation
- **Session Management**: Redis via Docker (with memory fallback)

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

1. **Authentication Flow**: NextAuth.js with Credentials provider for email/password authentication
2. **State Management**: Server Components by default, Client Components for interactivity
3. **Database Operations**: All DB queries through Prisma Client in server components/API routes
4. **API Design**: RESTful endpoints under /api with consistent error handling
5. **UI Components**: shadcn/ui for consistent design system, customized with Tailwind

### Environment Variables Required
```
DATABASE_URL          # Docker PostgreSQL (postgresql://postgres:postgres@localhost:5432/studylog_db)
NEXTAUTH_URL         # App URL (e.g., https://xn--oj4b21j.com)
NEXTAUTH_SECRET      # Random secret for NextAuth
GOOGLE_CLIENT_ID     # Google OAuth Client ID
GOOGLE_CLIENT_SECRET # Google OAuth Client Secret
OPENAI_API_KEY       # For AI features (optional)
GEMINI_API_KEY       # For level image generation (optional, falls back to placeholder)
REDIS_URL            # Redis connection (optional, falls back to memory)
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
- **Date Handling**: All dates in KST
- **Level Image Generation**: Automatic AI-generated character cards at milestone levels (10, 20, 30, etc.)

## Gemini AI Image Generation System

### Model Configuration
- **Primary Model**: `gemini-2.5-flash-image-preview`
- **Package**: `@google/generative-ai@0.24.1`
- **Fallback**: SVG placeholder generation when API key unavailable

### Key Components
1. **lib/gemini.ts**: Core image generation logic with character diversity system
2. **app/api/level-image/generate/route.ts**: REST API endpoint for image generation
3. **app/api/activities/route.ts**: Auto-triggers image generation on milestone level-ups

### Character Generation System
- **Diverse Character Types**: 21 different character types including humans (male/female/non-binary), animals, fruits, and objects
- **Stat-Based Classes**: Character class determined by highest stat (INT→Arcane Scholar, STR→Mighty Warrior, etc.)
- **Level Theming**: Bronze (10-19), Silver (20-29), Gold (30-39), Legendary (40+)

### CRITICAL Implementation Notes

#### Model Usage
```javascript
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
const result = await model.generateContent([prompt]);
const response = await result.response;
```

#### Prompt Structure Requirements
- **Must include**: Character type, class, level, stats display, visual requirements
- **Art style**: Korean webtoon/manhwa style with vibrant colors
- **Privacy**: NEVER include student names in prompts or generated content
- **Content**: Focus on inspirational, educational, gaming aesthetics

#### Auto-Generation Triggers
- Milestone levels: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
- Triggered automatically via internal API call in activities/route.ts
- Includes server token authentication for internal requests

#### Error Handling
- Graceful fallback to SVG placeholder when Gemini API fails
- Placeholder contains basic stats and level information
- Error logging for debugging API issues

#### Performance Considerations
- Image generation is async and non-blocking
- Large file sizes (1-2MB PNG typical)
- Files stored in public/level-cards/ directory
- Database stores image URLs and generation metadata

### Development Guidelines
1. **Testing**: Use `/api/level-image/test` endpoint for development
2. **Regeneration**: Add `?regenerate=true` or `forceGenerate: true` to override existing images
3. **Privacy First**: Always remove personal information from prompts
4. **Consistent Styling**: Follow established prompt templates in lib/gemini.ts