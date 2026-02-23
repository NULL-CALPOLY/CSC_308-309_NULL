# Findr - CSC 308/309 Project

A full-stack web application for finding and connecting with people based on shared interests, events, and locations.

**Developed by:** Vishnu, Ryan, Aaron, and Brian

**Live App:** [https://delightful-dune-0c8056b0f.6.azurestaticapps.net](https://delightful-dune-0c8056b0f.6.azurestaticapps.net)
**API:** [https://findr-ggfjetd2gqe2gday.westus3-01.azurewebsites.net](https://findr-ggfjetd2gqe2gday.westus3-01.azurewebsites.net)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
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
- Group chat functionality
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
- **Other:** cookie-parser, cors, dotenv

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v7
- **Maps:** React-Leaflet + Leaflet
- **UI Components:** AWS Cloudscape Design
- **Styling:** CSS
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
│   ├── UserFiles/                  # User routes, schema, services
│   ├── EventFiles/                 # Event management
│   ├── ChatFiles/                  # Group chat functionality
│   ├── InterestFIles/              # Interest management
│   ├── OrganizationFiles/          # Organization management
│   └── OAuth/                      # Google OAuth routes (Passport.js)
├── frontend/
│   ├── src/
│   │   ├── Components/             # Reusable React components
│   │   │   ├── AuthProvider.jsx
│   │   │   ├── Navbar/
│   │   │   ├── CreateEventModal/
│   │   │   ├── EventComponent/
│   │   │   ├── EventColumn/
│   │   │   ├── MainMapComponent/
│   │   │   ├── SearchBar/
│   │   │   └── InterestTag/
│   │   ├── Pages/                  # Page-level components
│   │   │   ├── Landing/
│   │   │   ├── Home/
│   │   │   ├── SignIn/
│   │   │   ├── Registration/
│   │   │   ├── Profile/
│   │   │   └── EventDetails/
│   │   ├── Hooks/
│   │   │   ├── useAuth.ts          # Auth context + JWT logic
│   │   │   └── UseEvents.jsx
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

| Command | Description |
|---|---|
| `npm run dev` | Start backend + frontend concurrently |
| `npm run backend:dev` | Start backend only (`localhost:3000`) |
| `npm run frontend:dev` | Start frontend only (`localhost:5173`) |

> The frontend proxies all `/api/*` requests to the backend in dev, so cookies work correctly across ports.

### Code Quality

| Command | Description |
|---|---|
| `npm run format` | Format all files with Prettier |
| `npm run lint` | Check for lint errors |
| `npm run lint:fix` | Auto-fix lint errors |

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

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/users/login` | Login with email + password |
| `POST` | `/users/logout` | Logout and clear refresh token cookie |
| `POST` | `/users/refresh-token` | Get new access token via HttpOnly cookie |
| `GET` | `/auth/google` | Initiate Google OAuth |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `GET` | `/auth/me` | Get current OAuth session user |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users/all` | Get all users |
| `GET` | `/users/:id` | Get user by ID |
| `POST` | `/users` | Register new user |
| `PUT` | `/users/:id` | Update user |
| `DELETE` | `/users/:id` | Delete user |

### Events

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/events/all` | Get all events |
| `GET` | `/events/:id` | Get event by ID |
| `POST` | `/events` | Create event |
| `PUT` | `/events/:id` | Update event |
| `DELETE` | `/events/:id` | Delete event |
| `PUT` | `/events/:id/attendees/add/:userId` | RSVP to event |
| `PUT` | `/events/:id/attendees/remove/:userId` | Un-RSVP from event |

### Chats

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/chats/all` | Get all chats |
| `GET` | `/chats/:id` | Get chat by ID |
| `POST` | `/chats` | Create chat |
| `PUT` | `/chats/:id/users/add/:userId` | Add member |
| `PUT` | `/chats/:id/users/remove/:userId` | Remove member |

### Interests

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/interests/all` | Get all interests |
| `GET` | `/interests/:id` | Get interest by ID |
| `POST` | `/interests` | Create interest |
| `GET` | `/interests/search/name/:name` | Search by name |

### Organizations

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/organizations/all` | Get all organizations |
| `GET` | `/organizations/:id` | Get organization by ID |
| `POST` | `/organizations` | Create organization |
| `PUT` | `/organizations/:id/members/add/:userId` | Add member |
| `PUT` | `/organizations/:id/members/remove/:userId` | Remove member |

---

## 🧪 Testing

### Run Tests

| Command | Description |
|---|---|
| `npm run test` | Run all tests |
| `npm run test:unit` | Run frontend unit tests only |
| `npm run test:integration` | Run backend integration tests only |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:watch` | Run tests in watch mode |

### Test Structure

```
tests/
├── Integration/        # Supertest tests against mongodb-memory-server
│   ├── Users/
│   ├── Events/
│   ├── Chats/
│   ├── Interests/
│   └── Organizations/
├── Mockingoose/        # Route/service tests using mockingoose
└── unit/frontend/      # React component tests (jsdom)
```

---

## ☁️ Deployment

The app is deployed on Azure:

- **Frontend:** Azure Static Web Apps — auto-deploys from `main` branch via GitHub Actions
- **Backend:** Azure App Service — auto-deploys from `main` branch via GitHub Actions

### Required Azure App Service Environment Variables (Backend)

| Variable | Description |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `SESSION_SECRET` | Random secret for express-session |
| `JWT_TOKEN_SECRET` | Secret for signing access tokens |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh tokens |
| `FRONTEND_URL` | `https://delightful-dune-0c8056b0f.6.azurestaticapps.net` |
| `BACKEND_URL` | `https://findr-ggfjetd2gqe2gday.westus3-01.azurewebsites.net` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

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


---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Code Quality](#code-quality)
- [Testing](#-testing)
- [Contributing](#-contributing-guidelines)

---

## 🎯 Project Overview

Findr is a location-based social discovery platform that helps users find events, connect with others, and join communities based on shared interests.

### Key Features

- User registration and authentication
- Event discovery and management
- Interest-based community matching
- Group chat functionality
- Organization management
- Location-based search with radius filtering

### UI Design

[View Figma Design](https://www.figma.com/design/0z8JxtDEOHMynJBxNlRy3B/NULL?node-id=0-1&t=4Dz5RBx5Wi5keHSV-1)

---

## 🛠️ Tech Stack

### Backend

- **Framework:** Express.js (Node.js)
- **Database:** MongoDB with Mongoose
- **Authentication:** bcrypt for password hashing
- **Testing:** Jest with Supertest

### Frontend

- **Framework:** React with Vite
- **Styling:** CSS
- **Maps:** React-Leaflet
- **State Management:** React hooks

### Development Tools

- **Code Quality:** ESLint + Prettier
- **Task Runner:** npm scripts

---

## 📁 Project Structure

```
.
├── backend/                    # Express server & API
│   ├── UserFiles/             # User routes, schema, services
│   ├── EventFiles/            # Event management
│   ├── ChatFiles/             # Group chat functionality
│   ├── InterestFIles/         # Interest management
│   ├── OrganizationFiles/     # Organization management
│   ├── CredentialFiles/       # Authentication & login
│   └── backend.js             # Server entry point
├── frontend/                   # React application
│   └── src/
│       ├── Components/        # Reusable React components
│       ├── Pages/            # Page components
│       └── main.jsx          # Frontend entry point
├── tests/                      # Test files for all modules
├── package.json               # Dependencies & scripts
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or remote)
- npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd CSC_308-309_NULL
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your MongoDB connection string:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
     ```
   - **Important:** Add `.env` to `.gitignore` before committing

4. **Verify setup**
   ```bash
   npm run lint
   npm run format
   ```

---

## 💻 Development

### Running the Application

- **Full Stack (Backend + Frontend):**

  ```bash
  npm run dev
  ```

- **Backend Only:**

  ```bash
  npm run backend:dev
  ```

- **Frontend Only:**
  ```bash
  cd frontend
  npm run dev
  ```

### Code Quality

- **Format Code:**

  ```bash
  npm run format
  ```

- **Lint Check:**

  ```bash
  npm run lint
  ```

- **Auto-fix Issues:**
  ```bash
  npm run lint:fix
  ```

### Code Style Guidelines

- Prettier automatically formats code on save (ensure VS Code extension is installed)
- Run `npm run format` before committing
- Use ESLint configuration for code quality standards
- Enable "Format on Save" in VS Code settings

---

## 🔌 API Documentation

### Base URL

```
http://localhost:3000
```

### Available Endpoints

#### Users

- `GET /users/all` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users/` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/search/{category}/{value}` - Search users

#### Events

- `GET /events/all` - Get all events
- `GET /events/:id` - Get event by ID
- `POST /events/` - Create new event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `PUT /events/:id/attendees/add/:userId` - Add attendee
- `PUT /events/:id/attendees/remove/:userId` - Remove attendee
- `PUT /events/:id/blocked/add/:userId` - Block user
- `GET /events/search/{category}/{value}` - Search events

#### Chats

- `GET /chats/all` - Get all chats
- `GET /chats/:id` - Get chat by ID
- `POST /chats/` - Create new chat
- `PUT /chats/:id/users/add/:userId` - Add member
- `PUT /chats/:id/users/remove/:userId` - Remove member
- `GET /chats/search/{category}/{value}` - Search chats

#### Interests

- `GET /interests/all` - Get all interests
- `GET /interests/:id` - Get interest by ID
- `POST /interests/` - Create new interest
- `GET /interests/:id/similar` - Get similar interests
- `POST /interests/:id/similar/add/:similarId` - Add similar interest
- `GET /interests/search/name/:name` - Search by name

#### Organizations

- `GET /organizations/all` - Get all organizations
- `GET /organizations/:id` - Get organization by ID
- `POST /organizations/` - Create new organization
- `PUT /organizations/:id/members/add/:userId` - Add member
- `PUT /organizations/:id/members/remove/:userId` - Remove member
- `GET /organizations/search/{category}/{value}` - Search organizations

#### Authentication

- `POST /login/login` - Authenticate user (email + password)
- `GET /login/:id` - Get login by ID
- `POST /login/` - Create new login
- `PUT /login/:id` - Update login
- `DELETE /login/:id` - Delete login

### Search Parameters

- **Multiple values:** Separate by comma (e.g., `/users/search/interests/coding,gaming`)
- **Spaces in values:** Use `%20` (e.g., `/users/search/name/LEBRON%20JAMES`)
- **Case Sensitivity:** Most searches are case-insensitive via regex
- **Date Format:** ISO 8601 format for date fields

### Important Notes

- All user IDs in events must correspond to valid users in the database
- Use ISO date format for date-based searches (e.g., `/users/search/dob/2000-01-15`)
- Age can be used for DOB searches: `/users/search/dob/25` searches for users age 25

---

## 🧪 Testing

### Run Tests

```bash
npm run test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test Organization

- Unit tests located in `tests/` directory
- Organized by module (Users, Events, Chats, etc.)
- Mocks in `tests/__mocks__/`
- Setup files for Jest configuration

---

## 📝 Contributing Guidelines

1. **Before making changes:**
   - Pull latest code from main branch
   - Create a feature branch: `git checkout -b feature/your-feature`

2. **While developing:**
   - Keep functions focused and well-commented
   - Follow existing code patterns
   - Add tests for new features
   - Run `npm run format` and `npm run lint:fix` before committing

3. **Before committing:**
   - Ensure `.env` is in `.gitignore`
   - Run full test suite: `npm run test`
   - Run linter: `npm run lint`
   - Format code: `npm run format`

4. **Commit messages:**
   - Use clear, descriptive commit messages
   - Reference issues when applicable

---

## 🐛 Known Issues & Support

- If you encounter bugs, try to fix them or contact Brian
- For code questions, refer to inline comments or ask Brian for clarification
- Feel free to suggest and implement additional features

---

## 📄 License

This project is developed as part of CSC 308/309 coursework.

---

## 👥 Team

- **Vishnu** - Developer/Designer
- **Ryan** - Developer
- **Aaron** - Developer
- **Brian** - Developer