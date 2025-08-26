# Overview

This is a Turkish item exchange/trading platform called "Takas" built with a modern full-stack architecture. The application allows users to register, list items they want to trade, browse available items, and make trade offers. It's designed as a sustainable marketplace where people can exchange goods instead of buying new ones.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

## Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for API routes
- **Development**: TSX for TypeScript execution in development
- **Build Process**: ESBuild for production bundling
- **Middleware**: Custom logging and error handling middleware

## Data Storage Solutions
- **Primary Database**: Firebase Firestore for real-time document storage
- **File Storage**: Firebase Storage for image uploads
- **Local Development**: In-memory storage implementation for development/testing
- **Schema Validation**: Zod schemas shared between client and server
- **ORM Alternative**: Drizzle ORM configured for PostgreSQL (currently unused but configured)

## Authentication and Authorization
- **Provider**: Firebase Authentication
- **Features**: Email/password authentication, email verification
- **Session Management**: Firebase Auth state management with React context
- **User Profiles**: Custom user documents stored in Firestore

## External Service Integrations
- **Firebase Services**:
  - Authentication for user management
  - Firestore for real-time data storage
  - Storage for image uploads
- **Neon Database**: PostgreSQL database service (configured but not actively used)
- **Development Tools**: Replit-specific plugins for development environment

## Key Design Decisions

### Hybrid Database Approach
The application is configured with both Firebase (actively used) and PostgreSQL with Drizzle (configured but unused). This provides flexibility to migrate to a traditional SQL database if needed while leveraging Firebase's real-time capabilities for the current implementation.

### Shared Schema Architecture
Zod schemas are defined in a shared directory accessible to both frontend and backend, ensuring type safety and validation consistency across the entire application.

### Component-Based UI
The UI is built using a comprehensive component library (Shadcn/ui) that provides consistent styling and behavior while maintaining accessibility through Radix UI primitives.

### Image Handling Strategy
Images are uploaded to Firebase Storage with automatic URL generation, providing CDN benefits and reliable image serving without additional infrastructure.

### Development vs Production Storage
The application uses in-memory storage for development/testing scenarios while Firebase handles production data, allowing for rapid development iteration.