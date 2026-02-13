# Findr - CSC 308/309 Project

A full-stack web application for finding and connecting with people based on shared interests, events, and locations.

**Developed by:** Vishnu, Ryan, Aaron, and Brian

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
├── backend/                             # Express server & API
│   ├── backend.js                       # Server entry point
│   ├── UserFiles/                       # User routes, schema, services including auth
│   ├── EventFiles/                      # Event routes, schema, services
│   ├── ChatFiles/                       # Group chat routes, schema, services
│   ├── InterestFiles/                   # Interest routes, schema, services
│   └── OrganizationFiles/               # Organization routes, schema, services
├── frontend/                             # React application (Vite)
│   ├── public/                          # Static assets
│   ├── src/
│   │   ├── Components/                  # Reusable React components
│   │   ├── Pages/                       # Page-level components
│   │   ├── Hooks/                       # Custom hooks
│   │   ├── assets/                      # Images and media
│   │   ├── App.jsx                      # App shell
│   │   └── main.jsx                     # Frontend entry point
│   ├── .env                             # Local frontend env vars
│   └── .env.production                  # Production frontend env vars
├── tests/                                # Test files
│   ├── unit/                            # Unit tests (frontend)
│   ├── Integration/                     # Integration tests (backend)
│   └── __mocks__/                        # Test mocks
├── .env                                  # env vars for mongo connection and tokens
├── .env.test                             # mock tokens for testing
├── .github/workflows/                    # CI/CD workflows
├── package.json                          # Root scripts & dependencies
└── README.md                             # This file
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
   - Add env variables:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
     GOOGLE_CLIENT_ID=
     GOOGLE_CLIENT_SECRET=
     SESSION_SECRET=
     JWT_TOKEN_SECRET=
     REFRESH_TOKEN_SECRET=
     ```
   - **Important:** Add `.env` to `.gitignore` before committing

   - Create a `.env.test` file in the root directory
   - file should include:
     ```
     GOOGLE_CLIENT_ID=dummy
     GOOGLE_CLIENT_SECRET=dummy
     JWT_TOKEN_SECRET=dummy_jwt_token
     REFRESH_TOKEN_SECRET=dummy_refresh_token
     ```

4. **Configure frontend API base URL**
   - Local development (frontend/.env):
     ```
     VITE_API_BASE_URL=http://localhost:3000/
     ```
   - Production build (frontend/.env.production):
     ```
     VITE_API_BASE_URL=https://<your-azure-backend-url>/
     ```
   - The frontend reads `VITE_API_BASE_URL` at build time.

5. **Verify setup**
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

- Local: `http://localhost:3000`
- Production: your Azure backend URL
- Frontend uses `VITE_API_BASE_URL` to select the correct base URL.

---

## ✅ Testing

- Run all tests: `npm run test`
- Frontend unit tests use Jest + Babel transforms to support Vite `import.meta.env`.
- If you add new Vite env variables, update `frontend/jest.setup.js` accordingly.

### Available Endpoints

#### Users

- `POST /users/` - Create new User
- `GET /users/all` - Get all users
- `POST /users/login` - Authenticate user (email + password)
- `GET /users/:id` - Get user by ID
- `POST /users/refresh-token` - Refreshes User's token
- `POST /users/logout` - Logout User
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
- **Brian** - Developer
- **Aaron** - Developer
- **Ryan** - Developer
