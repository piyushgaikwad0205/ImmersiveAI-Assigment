# Smart Task Manager (Taskly)

A full-stack collaborative task management application featuring dependency graph resolution, cycle detection, multi-user assignment, and real-time status synchronization.

## Architecture and Tech Stack

### Frontend
- Framework: Next.js (App Router)
- Language: JavaScript (ES Modules, React 19)
- Styling: Custom Vanilla CSS (Design system with light/dark neutral tones and responsive layouts)
- Icons: Lucide React

### Backend
- Framework: Express.js (Node.js)
- Architecture: Modular Controller-Service-DTO pattern
- In-Memory Data Store: Seeded mock database with persistent state lifecycle in runtime
- Features: Depth-First Search (DFS) cycle detection for task dependencies, automatic blocked status propagation

---

## Default User Credentials

The system comes preloaded with four default user accounts. Use any of these credentials to log in:

| Name | Email | Role | Default Password |
|---|---|---|---|
| Ava Chen | ava@taskly.app | Admin | password123 |
| Liam Patel | liam@taskly.app | Developer | password123 |
| Mia Rossi | mia@taskly.app | Designer | password123 |
| Noah Kim | noah@taskly.app | Developer | password123 |

---

## Key Features

1. Task Management
   - Full CRUD operations for tasks (Create, Read, Update, Delete).
   - Priority levels: Low, Medium, High, Urgent.
   - Status tracking: To Do, In Progress, Blocked, Completed.
   - Due date assignment, assignee mapping, and category tagging.

2. Dependency Graph and Circular Dependency Prevention
   - Tasks can depend on one or more prerequisite tasks.
   - Automatic cycle detection using Depth-First Search (DFS) ensures no circular dependencies (e.g., A -> B -> C -> A) can be created.
   - If a prerequisite task is not completed, dependent tasks are automatically classified and flagged as Blocked.
   - Completing all prerequisite tasks automatically unblocks dependent tasks.

3. Multi-User Assignment and Filtering
   - Reassign tasks between team members.
   - Filter tasks by status (All, To Do, In Progress, Blocked, Completed), priority, assignee, or custom search query.
   - Dedicated views for "My Tasks" and "Blocked Tasks" accessible directly from the dashboard.

---

## Project Structure

```
SmartTaskmanager/
|-- Backend/
|   |-- src/
|   |   |-- common/              # Common utilities and constants
|   |   |-- db/                  # In-memory database and seed data
|   |   |-- modules/
|   |   |   |-- auth/            # Authentication controllers, routes, and services
|   |   |   |-- tasks/           # Task logic, cycle detection, and dependency graph
|   |   |   |-- users/           # User controllers and services
|   |   |-- utils/               # Helper utilities
|   |   |-- app.js               # Express application initialization
|   |-- server.js                # Backend entry point (Port 5000)
|   |-- package.json
|-- Client/
|   |-- src/
|   |   |-- app/                 # Next.js App Router pages
|   |   |   |-- dashboard/       # Main workspace dashboard
|   |   |   |-- blocked/         # Blocked tasks view
|   |   |   |-- my-tasks/        # User-assigned tasks view
|   |   |   |-- login/           # Authentication page
|   |   |-- components/          # Reusable UI components (Modals, Task Cards, Navigation)
|   |   |-- context/             # AuthContext and state management
|   |   |-- services/            # API client services
|   |   |-- styles/              # Global CSS stylesheets
|   |-- package.json
|-- .gitignore
`-- README.md
```

---

## Setup and Installation

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### 1. Backend Setup

Open a terminal and navigate to the `Backend` directory:

```bash
cd Backend
npm install
npm start
```

The backend API server will start at `http://localhost:5000`.

### 2. Frontend Setup

Open a second terminal and navigate to the `Client` directory:

```bash
cd Client
npm install
npm run dev
```

The frontend application will start at `http://localhost:3000`.

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate user with email and password.
- `GET /api/auth/me`: Get current authenticated user profile.
- `POST /api/auth/logout`: Log out the current session.

### Users (`/api/users`)
- `GET /api/users`: List all team members.
- `GET /api/users/:id`: Get user details by ID.

### Tasks (`/api/tasks`)
- `GET /api/tasks`: List all tasks (supports query filters for `status`, `priority`, `assigneeId`, and `search`).
- `GET /api/tasks/my-tasks`: List tasks assigned to the authenticated user.
- `GET /api/tasks/blocked`: List all currently blocked tasks with blocker details.
- `GET /api/tasks/:id`: Get a specific task by ID.
- `POST /api/tasks`: Create a new task.
- `PUT /api/tasks/:id`: Update task properties (title, description, priority, due date, tags).
- `PATCH /api/tasks/:id/status`: Update task status.
- `PATCH /api/tasks/:id/assign`: Reassign task to a user.
- `POST /api/tasks/:id/dependencies`: Add a dependency requirement (validates against circular dependencies).
- `DELETE /api/tasks/:id/dependencies/:dependencyId`: Remove a dependency requirement.
- `DELETE /api/tasks/:id`: Delete a task and remove all associated dependency links.

