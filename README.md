# TaskFlow — Task Management Application

> Full-stack task management web app built for the Thiranex Internship Program (Task 2 — Due Sep 28, 2026)

---

## Features

### Authentication
- Register and login with JWT-based auth
- Protected routes — dashboard only accessible when signed in
- Change name, email, and password from Settings
- Delete account (cascades all tasks and categories)

### Dashboard
- Live stats bar — Total, To Do, In Progress, Completed
- Overall progress bar with completion percentage
- **Today's Focus** — highlights tasks due today with one-click complete
- Greeting message changes based on time of day

### Task Management (Full CRUD)
- Create, edit, delete tasks
- Fields: title, description, status, priority, due date, tags, category
- Click status icon on any card to cycle: To Do → In Progress → Completed
- Overdue and due-today indicators with color coding

### Views
- **Grid view** — card layout
- **List view** — compact single-column
- **Kanban board** — 3 columns with drag-and-drop between columns
- `+` button on each Kanban column creates a task pre-set to that status

### Task Detail Panel
- Click any task card to open a slide-in detail panel
- Full title, description, tags, category, dates, priority
- Edit and delete from inside the panel
- Cycle status inline from the panel header

### Task Timer
- Play / Pause timer on every task card
- Timer persists across page refreshes via localStorage
- Saves elapsed time to the database on pause
- Also accessible from the Task Detail Panel

### Search & Filters
- Global search modal — press `/` or `Ctrl+K` anywhere
- Search by title or description, live results
- Filter by status, priority, category, sort field and order
- Category quick-filter pills on the dashboard

### Categories / Projects
- Create color-coded categories inside the task form
- 10 preset colors + custom color picker
- Filter all tasks by category from the dashboard
- Category badge shown on every task card

### Analytics Page
- Completion rate banner with animated progress bar
- Dual bar chart — tasks created vs completed over 14 days (hover tooltips)
- Status donut chart with legend
- Priority donut chart with progress bars
- KPI cards: Total, Completed, Due Today, Overdue

### Notifications
- Bell icon in topbar shows real badge count
- Dropdown panel groups tasks into: Overdue, Due Today, Due Tomorrow
- "All caught up" empty state when nothing is urgent

### Profile Page
- 24 emoji avatar options
- Edit name and email
- Task stats: Total, Completed, In Progress, To Do
- Overall progress bar
- Member since date

### Settings Page
- Update name and email
- Change password (requires current password verification)
- Delete account — type `DELETE` to confirm, permanently removes all data

### UI / UX
- Light and dark mode — toggle in sidebar or topbar, persists to localStorage
- Collapsible sidebar (72px icon-only ↔ 256px full)
- Responsive design — works on mobile, tablet, and desktop
- Skeleton loading states on all pages
- Toast notifications for every action
- Help & Docs modal with accordion sections
- Inter font, custom scrollbar, smooth transitions

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS v4         |
| Backend    | Node.js, Express.js                     |
| Database   | SQLite (via Prisma ORM)                 |
| Auth       | JWT (jsonwebtoken) + bcrypt             |
| HTTP       | Axios with request/response interceptors|
| Icons      | lucide-react                            |
| Dates      | date-fns                                |
| Toasts     | react-hot-toast                         |

---

## Project Structure

```
Task Management App/
├── client/                        # React frontend (Vite)
│   └── src/
│       ├── api/                   # Axios instance + API calls
│       │   ├── axios.js           # Base instance with JWT interceptor
│       │   ├── auth.js            # register, login, updateMe, deleteMe
│       │   ├── tasks.js           # CRUD + stats + analytics
│       │   └── categories.js      # Category CRUD
│       ├── context/
│       │   ├── AuthContext.jsx    # login, register, logout, updateUser, deleteAccount
│       │   └── ThemeContext.jsx   # dark/light toggle with localStorage
│       ├── hooks/
│       │   └── useTimer.js        # Task timer with localStorage + DB sync
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.jsx    # Collapsible nav, theme toggle, help modal
│       │   │   ├── Topbar.jsx     # Search modal, notifications panel, theme button
│       │   │   └── ProtectedRoute.jsx
│       │   ├── tasks/
│       │   │   ├── TaskCard.jsx   # Card with timer, status toggle, detail open
│       │   │   ├── TaskForm.jsx   # Create/edit form with category picker
│       │   │   ├── TaskDetailPanel.jsx  # Slide-in detail + timer widget
│       │   │   ├── KanbanBoard.jsx      # 3-column drag-and-drop board
│       │   │   └── StatsBar.jsx   # Stats cards + overall progress bar
│       │   └── ui/
│       │       ├── Modal.jsx
│       │       ├── ConfirmDialog.jsx
│       │       └── Badge.jsx
│       └── pages/
│           ├── DashboardPage.jsx  # Main page — grid/list/kanban, filters, panels
│           ├── AnalyticsPage.jsx  # Charts and KPI cards
│           ├── ProfilePage.jsx    # Avatar picker, stats, edit form
│           ├── SettingsPage.jsx   # Name/password/delete account
│           ├── LoginPage.jsx
│           └── RegisterPage.jsx
│
└── server/                        # Express backend
    ├── config/
    │   └── prisma.js              # Shared Prisma client singleton
    ├── middleware/
    │   └── auth.js                # JWT protect middleware
    ├── routes/
    │   ├── auth.js                # register, login, GET/PUT/DELETE /me
    │   ├── tasks.js               # Full CRUD + stats + analytics + filters
    │   └── categories.js          # Category CRUD
    ├── utils/
    │   └── tags.js                # JSON tag serialization for SQLite
    ├── prisma/
    │   ├── schema.prisma          # User, Task, Category models
    │   └── dev.db                 # SQLite database file
    └── server.js
```

---

## Prerequisites

- Node.js v18+
- No database setup needed — SQLite creates `server/prisma/dev.db` automatically

---

## Setup & Run

### 1. Install backend dependencies

```bash
cd server
npm install
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Start the backend

```bash
cd server
node server.js
```

Output:
```
Server running on port 5000
Database: SQLite (prisma/dev.db)
```

### 4. Start the frontend (new terminal)

```bash
cd client
npm run dev
```

Output:
```
VITE ready
➜  Local: http://localhost:3000/
```

### 5. Open in browser

```
http://localhost:3000
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint    | Auth     | Description                        |
|--------|-------------|----------|------------------------------------|
| POST   | `/register` | Public   | Create account, returns JWT        |
| POST   | `/login`    | Public   | Login, returns JWT                 |
| GET    | `/me`       | Required | Get logged-in user                 |
| PUT    | `/me`       | Required | Update name / email / password / avatar |
| DELETE | `/me`       | Required | Delete account and all data        |

### Tasks — `/api/tasks`

All routes require `Authorization: Bearer <token>`

| Method | Endpoint          | Description                              |
|--------|-------------------|------------------------------------------|
| GET    | `/`               | List tasks (supports filters below)      |
| GET    | `/stats`          | Task counts by status                    |
| GET    | `/analytics`      | Charts data — trends, distribution       |
| GET    | `/:id`            | Single task                              |
| POST   | `/`               | Create task                              |
| PUT    | `/:id`            | Update task                              |
| PATCH  | `/:id/status`     | Quick status update                      |
| DELETE | `/:id`            | Delete task                              |

#### GET `/api/tasks` query params

| Param        | Description                                    |
|--------------|------------------------------------------------|
| `status`     | `todo` / `in-progress` / `completed`           |
| `priority`   | `low` / `medium` / `high`                      |
| `categoryId` | Filter by category ID                          |
| `search`     | Search title and description                   |
| `dueToday`   | `true` — returns only tasks due today          |
| `sortBy`     | `createdAt` / `dueDate` / `priority` / `title` |
| `order`      | `asc` / `desc`                                 |

### Categories — `/api/categories`

| Method | Endpoint | Description       |
|--------|----------|-------------------|
| GET    | `/`      | List categories   |
| POST   | `/`      | Create category   |
| PUT    | `/:id`   | Update category   |
| DELETE | `/:id`   | Delete category   |

---

## Database Schema

```prisma
model User {
  id          String     @id @default(cuid())
  name        String
  email       String     @unique
  password    String
  avatarEmoji String     @default("👤")
  tasks       Task[]
  categories  Category[]
}

model Category {
  id    String @id @default(cuid())
  name  String
  color String @default("#6366f1")
  icon  String @default("folder")
  tasks Task[]
}

model Task {
  id           String    @id @default(cuid())
  title        String
  description  String    @default("")
  status       String    @default("todo")
  priority     String    @default("medium")
  dueDate      DateTime?
  tags         String    @default("[]")
  timerSeconds Int       @default(0)
  categoryId   String?
  category     Category? @relation(...)
}
```

---

## Environment Variables

Located at `server/.env`:

| Variable       | Default                              | Description                |
|----------------|--------------------------------------|----------------------------|
| `PORT`         | `5000`                               | Express server port        |
| `DATABASE_URL` | `file:./prisma/dev.db`               | SQLite file path           |
| `JWT_SECRET`   | *(change in production)*             | Secret key for JWT signing |
| `JWT_EXPIRE`   | `7d`                                 | Token expiry duration      |

---

## Scripts

### Backend
```bash
node server.js        # Start server
nodemon server.js     # Start with auto-restart (dev)
```

### Frontend
```bash
npm run dev           # Start Vite dev server (port 3000)
npm run build         # Production build → client/dist/
npm run preview       # Preview production build
```

---

Built by Mohammad Sharique — Thiranex Internship Task 2
