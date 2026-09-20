# Changelog & Product Updates Widget

A full-stack MERN application for managing product updates, release notes, and in-app notifications (inspired by Headway and Beamer).

## Features

- **Admin Studio**: Split-screen live Markdown editor for drafting and publishing release notes with live preview and CRUD management.
- **Public Timeline**: Reverse-chronological feed with category filters (`New`, `Improved`, `Fixed`), search, deep linking, and interactive emoji reactions (❤️, 🎉, 🚀).
- **In-App Notification Widget**: Slide-over drawer displaying unread update badges with auto-clear on open and inline reactions.
- **Syndication Feed**: Public JSON feed endpoint (`/api/v1/changelog/feed`) for external syndication and automated integrations.
- **Dual-Token Authentication**: Secure JWT access & refresh tokens stored in `httpOnly` cookies with automatic refresh interceptor.

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Coss UI primitives, Lucide React
- **Backend**: Node.js (ES Modules), Express.js, MongoDB with Mongoose
- **Authentication**: JWT with cookie-parser & bcryptjs

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/Satyam-R4j/mern-Assessment-pro2.git
cd mern_comdot_assignment
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
npm run seed     # Seeds demo admin, user, and release notes
npm run dev      # Starts server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev      # Starts client on http://localhost:5173
```

## Demo Credentials

The seed script creates the following ready-to-test accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@changelog.com` | `Admin@123` | Full access to Admin Studio, CRUD releases, draft & publish |
| **User** | `user@changelog.com` | `User@123` | Public feed browsing, reactions, notification widget |

## Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/changelogs` | Public changelog feed with category & search query filters |
| `GET` | `/api/v1/changelog/feed` | Public JSON syndication feed for external integrations |
| `GET` | `/api/v1/changelogs/unread-count` | Returns unread count for user or guest timestamp |
| `POST` | `/api/v1/changelogs/:id/react` | Toggle emoji reaction (`redHeart`, `partyPopper`, `rocket`) |
| `GET` | `/api/v1/changelogs/admin/all` | Admin endpoint to list all releases including drafts |
| `POST` | `/api/v1/changelogs/admin` | Create new changelog release |
| `PUT` | `/api/v1/changelogs/admin/:id` | Update existing changelog release |
| `DELETE` | `/api/v1/changelogs/admin/:id` | Delete changelog release |
| `POST` | `/api/v1/auth/login` | Log in user and set JWT cookies |
| `POST` | `/api/v1/auth/logout` | Log out and clear cookies |
