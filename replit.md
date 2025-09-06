# Overview

This is a Spanish travel itinerary application built as a full-stack web app featuring a React frontend with a Node.js/Express backend. The application provides a comprehensive travel planning interface for a 13-day Spain autumn journey, including daily itineraries, key attractions, travel reminders, weather information, and countdown timers. The app uses modern web technologies with TypeScript throughout the stack and features a warm, autumn-themed design system with golden/amber color schemes.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Typography**: Custom fonts including Playfair Display (serif) and Open Sans (sans-serif)

## Component Structure
- **Layout Components**: Navigation with responsive mobile menu, reusable card components
- **Feature Components**: Countdown timers, itinerary cards, attraction cards, reminder cards, weather display
- **Pages**: Home, Daily Itinerary, Key Attractions, Travel Reminders, and 404 page
- **Hooks**: Custom hooks for countdown logic, weather data fetching, and mobile detection

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: Hot reload with Vite integration for development mode
- **API Structure**: RESTful endpoints under `/api` prefix
- **Error Handling**: Centralized error middleware with structured error responses

## Data Storage Solutions
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Definition**: Centralized schema in `shared/schema.ts` with Zod validation
- **In-Memory Storage**: MemStorage class for development/fallback user management
- **Migration Management**: Drizzle Kit for database migrations

## Database Schema Design
- **Users**: Basic user authentication with username/password
- **Itinerary Days**: Daily travel plans with activities, meals, and accommodation
- **Attractions**: Tourist destinations with categorization and details
- **Travel Reminders**: Categorized checklist items with priority levels
- **Weather Data**: Weather information storage for trip planning

## Development Workflow
- **Build Process**: Vite for frontend bundling, esbuild for server bundling
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Path Aliases**: Configured aliases for clean imports (`@/`, `@shared/`)
- **Code Quality**: TypeScript strict mode enabled across the entire codebase

## Design System
- **Theme**: Warm autumn color palette with golden/amber primary colors
- **Components**: shadcn/ui component library with Radix UI primitives
- **Responsive Design**: Mobile-first approach with responsive navigation
- **Animation**: CSS transitions and hover effects for enhanced UX
- **Accessibility**: ARIA labels and semantic HTML structure

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form with resolvers
- **Build Tools**: Vite with React plugin, esbuild for production builds
- **TypeScript**: Full TypeScript support with strict configuration

## UI and Styling
- **Component Library**: Radix UI primitives (30+ components)
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React icon library
- **Utility Libraries**: clsx, tailwind-merge, class-variance-authority

## Backend and Database
- **Server Framework**: Express.js with TypeScript support
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Validation**: Zod for schema validation and type safety
- **Session Management**: connect-pg-simple for PostgreSQL session store

## Data Fetching and State
- **HTTP Client**: Native fetch API with TanStack Query wrapper
- **State Management**: TanStack React Query for server state
- **Query Configuration**: Custom query client with error handling

## Development and Quality Tools
- **Development Server**: Vite dev server with HMR
- **Code Quality**: TypeScript compiler with strict mode
- **Path Resolution**: Custom path mapping for clean imports
- **Error Handling**: Runtime error overlay for development

## Third-Party Services
- **Weather API**: OpenWeatherMap API integration with fallback mock data
- **Maps and Location**: Weather data by city name
- **Image Hosting**: Unsplash and Pixabay for travel imagery
- **Fonts**: Google Fonts integration (Playfair Display, Open Sans, etc.)

## Deployment and Production
- **Build Output**: Static frontend assets and bundled server
- **Environment**: Production-ready with environment variable configuration
- **Asset Management**: Vite asset optimization and bundling
- **Server Deployment**: Node.js production server with Express