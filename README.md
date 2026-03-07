# Findr - CSC 308/309 Project

A full-stack web application for finding and connecting with people based on shared interests, events, and locations.

**Developed by:** Vishnu, Ryan, Aaron, and Brian

**Live App:** [https://findr.page](https://findr.page)

**API:** [https://findr-ggfjetd2gqe2gday.westus3-01.azurewebsites.net](https://findr-ggfjetd2gqe2gday.westus3-01.azurewebsites.net)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#%EF%B8%8F-deployment)
- [Contributing](#-contributing-guidelines)

---

## 🎯 Project Overview

Findr is a location-based social discovery platform that helps users find events, connect with others, and join communities based on shared interests.

### Key Features

- User registration and authentication (email/password + Google OAuth)
- JWT-based auth with HttpOnly refresh token cookies
- Event discovery, creation, and RSVP management
- Interest-based tagging and filtering
- Interactive map powered by React-Leaflet
- Event comment threads
- Image uploads via Cloudinary
- Organization management
- Profile management

### UI Design

[View Figma Design](https://www.figma.com/design/0z8JxtDEOHMynJBxNlRy3B/NULL?node-id=0-1&t=4Dz5RBx5Wi5keHSV-1)

---

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js (ESM)
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose
- **Auth:** JWT (access + refresh tokens), bcrypt, Passport.js + Google OAuth 2.0
- **Session:** express-session + connect-mongo
- **Other:** cookie-parser, cors, dotenv, multer, Cloudinary

### Frontend

- **Framework:** React 18 with Vite
- **Routing:** React Router v7
- **Maps:** React-Leaflet + Leaflet
- **UI Components:** AWS Cloudscape Design
- **Styling:** CSS
- **Utilities:** date-fns
- **Language:** JSX + TypeScript (hooks)

### Testing

- **Framework:** Jest + Supertest
- **In-memory DB:** mongodb-memory-server
- **Mocking:** mockingoose
- **Frontend:** @testing-library/react

### DevOps

- **Backend Hosting:** Azure App Service
- **Frontend Hosting:** Azure Static Web Apps
- **CI/CD:** GitHub Actions (via Azure deployment)
- **Code Quality:** ESLint + Prettier

---

## 📁 Project Structure

```
.
├── backend/
│   ├── backend.js                  # Server entry point
│   ├── Cloudinary.js               # Cloudinary upload config
│   ├── UserFiles/                  # User routes, schema, services
│   ├── EventFiles/                 # Event management
│   ├── CommentFiles/               # Event comment threads
│   ├── InterestFIles/              # Interest management
│   ├── OrganizationFiles/          # Organization management
│   └── OAuth/                      # Google OAuth routes (Passport.js)
├── frontend/
│   ├── src/
│   │   ├── Components/             # Reusable React components
│   │   │   ├── AuthProvider.jsx
│   │   │   ├── ModalContext.jsx
│   │   │   ├── ProtectedComponent.jsx
│   │   │   ├── Navbar/
│   │   │   ├── CreateEventButton/
│   │   │   ├── CreateEventModal/
│   │   │   ├── EventComponent/
│   │   │   ├── EventColumn/
│   │   │   ├── MainMapComponent/
│   │   │   ├── Modals/
│   │   │   ├── SearchBar/
│   │   │   ├── InterestTag/
│   │   │   └── TempAddressInputComponent/
│   │   ├── Pages/                  # Page-level components
│   │   │   ├── Landing/
│   │   │   ├── Home/
│   │   │   ├── Profile/
│   │   │   └── EventDetails/
│   │   ├── Hooks/
│   │   │   ├── UseAuth.ts          # Auth context + JWT logic
│   │   │   ├── UseEvents.jsx
│   │   │   └── UseInterests.jsx
│   │   └── App.jsx
│   ├── .env                        # Dev env vars
│   ├── .env.production             # Production env vars
│   └── vite.config.js
├── tests/
│   ├── Integration/                # Supertest integration tests
│   ├── Mockingoose/                # Mockingoose unit tests
│   ├── unit/frontend/              # React component tests
│   └── __mocks__/                  # Leaflet, style mocks
├── .env                            # Backend env vars (local)
├── .env.test                       # Backend env vars (test)
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd CSC_308-309_NULL
   ```

2. **Install all dependencies**

   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Set up environment variables** (see [Environment Variables](#environment-variables))

4. **Start the development servers**
   ```bash
   npm run dev
   ```

---

## 💻 Development

### Running the Application

| Command                | Description                            |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Start backend + frontend concurrently  |
| `npm run backend:dev`  | Start backend only (`localhost:3000`)  |
| `npm run frontend:dev` | Start frontend only (`localhost:5173`) |

> The frontend proxies all `/api/*` requests to the backend in dev, so cookies work correctly across ports.

### Code Quality

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run format`   | Format all files with Prettier |
| `npm run lint`     | Check for lint errors          |
| `npm run lint:fix` | Auto-fix lint errors           |

---

## 🔐 Environment Variables

### Backend — `.env` (root)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
SESSION_SECRET=your_long_random_secret
JWT_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=cloud_name
CLOUDINARY_KEY=cloudinary_key
CLOUDINARY_SECRET=cloudinary_secret
```

### Backend — `.env.test` (root)

```env
GOOGLE_CLIENT_ID=dummy
GOOGLE_CLIENT_SECRET=dummy
JWT_TOKEN_SECRET=dummy_jwt_token
REFRESH_TOKEN_SECRET=dummy_refresh_token
SESSION_SECRET=dummy_session_secret
```

### Frontend — `frontend/.env` (local dev)

```env
VITE_API_BASE_URL=/api
```

### Frontend — `frontend/.env.production`

```env
VITE_API_BASE_URL=https://findr-ggfjetd2gqe2gday.westus3-01.azurewebsites.net
```

> **Note:** `.env` files are gitignored. Never commit secrets.

---

## 🔌 API Documentation

### Base URL

- **Local:** `http://localhost:3000`
- **Production:** `https://findr-ggfjetd2gqe2gday.westus3-01.azurewebsites.net`

### Authentication

| Method | Endpoint                | Description                              |
| ------ | ----------------------- | ---------------------------------------- |
| `POST` | `/users/login`          | Login with email + password              |
| `POST` | `/users/logout`         | Logout and clear refresh token cookie    |
| `POST` | `/users/refresh-token`  | Get new access token via HttpOnly cookie |
| `GET`  | `/auth/google`          | Initiate Google OAuth                    |
| `GET`  | `/auth/google/callback` | Google OAuth callback                    |
| `GET`  | `/auth/me`              | Get current OAuth session user           |

### Users

| Method   | Endpoint     | Description       |
| -------- | ------------ | ----------------- |
| `GET`    | `/users/all` | Get all users     |
| `GET`    | `/users/:id` | Get user by ID    |
| `POST`   | `/users`     | Register new user |
| `PUT`    | `/users/:id` | Update user       |
| `DELETE` | `/users/:id` | Delete user       |

### Events

| Method   | Endpoint                               | Description        |
| -------- | -------------------------------------- | ------------------ |
| `GET`    | `/events/all`                          | Get all events     |
| `GET`    | `/events/:id`                          | Get event by ID    |
| `POST`   | `/events`                              | Create event       |
| `PUT`    | `/events/:id`                          | Update event       |
| `DELETE` | `/events/:id`                          | Delete event       |
| `PUT`    | `/events/:id/attendees/add/:userId`    | RSVP to event      |
| `PUT`    | `/events/:id/attendees/remove/:userId` | Un-RSVP from event |

### Comments

| Method | Endpoint                              | Description                     |
| ------ | ------------------------------------- | ------------------------------- |
| `GET`  | `/comments/event/:eventId`            | Get comments for an event       |
| `POST` | `/comments/event/:eventId`            | Create comments thread for event |
| `POST` | `/comments/event/:eventId/message`    | Add message to event comments   |

### Interests

| Method | Endpoint                       | Description        |
| ------ | ------------------------------ | ------------------ |
| `GET`  | `/interests/all`               | Get all interests  |
| `GET`  | `/interests/:id`               | Get interest by ID |
| `POST` | `/interests`                   | Create interest    |
| `GET`  | `/interests/search/name/:name` | Search by name     |

### Organizations

| Method | Endpoint                                    | Description            |
| ------ | ------------------------------------------- | ---------------------- |
| `GET`  | `/organizations/all`                        | Get all organizations  |
| `GET`  | `/organizations/:id`                        | Get organization by ID |
| `POST` | `/organizations`                            | Create organization    |
| `PUT`  | `/organizations/:id/members/add/:userId`    | Add member             |
| `PUT`  | `/organizations/:id/members/remove/:userId` | Remove member          |

---

## 🧪 Testing

### Run Tests

| Command                    | Description                        |
| -------------------------- | ---------------------------------- |
| `npm run test`             | Run all tests                      |
| `npm run test:unit`        | Run frontend unit tests only       |
| `npm run test:integration` | Run backend integration tests only |
| `npm run test:coverage`    | Run tests with coverage report     |
| `npm run test:watch`       | Run tests in watch mode            |

### Test Structure

```
tests/
├── Integration/        # Supertest tests against mongodb-memory-server
│   ├── Users/
│   ├── Events/
│   ├── Interests/
│   └── Organizations/
├── Mockingoose/        # Route/service tests using mockingoose
│   ├── Users/
│   ├── Events/
│   ├── Interests/
│   └── Organizations/
└── unit/frontend/      # React component tests (jsdom)
```

---

## ☁️ Deployment

The app is deployed on Azure:

- **Frontend:** Azure Static Web Apps — auto-deploys from `main` branch via GitHub Actions
- **Backend:** Azure App Service — auto-deploys from `main` branch via GitHub Actions

### Required Azure App Service Environment Variables (Backend)

| Variable               | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `NODE_ENV`             | `production`                                                  |
| `MONGODB_URI`          | MongoDB Atlas connection string                               |
| `SESSION_SECRET`       | Random secret for express-session                             |
| `JWT_TOKEN_SECRET`     | Secret for signing access tokens                              |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh tokens                             |
| `FRONTEND_URL`         | `https://findr.page`                                          |
| `BACKEND_URL`          | `https://findr-ggfjetd2gqe2gday.westus3-01.azurewebsites.net` |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                                        |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                                    |

> **Note:** Do not configure CORS in the Azure portal — Express handles CORS. Having both configured causes conflicts.

---

## 📝 Contributing Guidelines

1. Pull latest from `main` and create a feature branch:

   ```bash
   git checkout -b feature/your-feature
   ```

2. Before committing:

   ```bash
   npm run format
   npm run lint:fix
   npm run test
   ```

3. Use clear, descriptive commit messages and open a PR against `main`.

---

## 👥 Team

- **Vishnu** — Developer/Designer
- **Ryan** — Developer
- **Aaron** — Developer
- **Brian** — Developer
