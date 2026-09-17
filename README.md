# Changelog & Product Updates Widget

A full-stack MERN application for managing product updates, release notes, and in-app notifications.

## Features
- **Admin Studio**: Split-screen live Markdown editor for drafting and publishing release notes.
- **Public Timeline**: Reverse-chronological timeline feed with category filters and emoji reactions.
- **In-App Notification Widget**: Slide-over drawer showing unread update count with auto-clear on open.
- **Syndication Feed**: Public JSON feed endpoint (`/api/v1/changelog/feed`) for external integrations.

## Tech Stack
- **Frontend**: React, Vite, CSS (Coss UI styling principles)
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Authentication**: JWT access & refresh tokens stored in `httpOnly` cookies

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or MongoDB Atlas URI

### Setup Instructions
1. Clone the repository
```bash
git clone https://github.com/Satyam-R4j/mern-Assessment-pro2.git
cd mern-Assessment-pro2
```

2. Backend setup
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

3. Frontend setup
```bash
cd client
npm install
npm run dev
```
