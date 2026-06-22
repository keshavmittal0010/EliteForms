# Dynamic Form Builder (FormCraft)

A complete, production-ready Dynamic Form Builder web application from scratch. Built with a Node.js/Express backend, MySQL database (Sequelize ORM), and Next.js 15 frontend featuring Tailwind CSS.

---

## Folder Structure

```
d:\KESHAV\Form_Builder\
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool & database auto-create config
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile me checking
│   │   ├── formController.js     # Form CRUD, duplication, dashboard analytics aggregations
│   │   └── responseController.js # Answer posting, viewing list, searches, deletions
│   ├── middleware/
│   │   ├── auth.js               # JWT bearer verification
│   │   └── validation.js         # Payload schema checkers via express-validator
│   ├── models/
│   │   ├── User.js               # MySQL User model definition
│   │   ├── Form.js               # MySQL Form model definition (utilizing JSON data types)
│   │   └── Response.js           # MySQL Response model definition (utilizing JSON data types)
│   ├── routes/
│   │   ├── authRoutes.js         # Auth routing map (/api/auth)
│   │   ├── formRoutes.js         # Forms routing map (/api/forms)
│   │   └── responseRoutes.js     # Answers routing map (/api/responses)
│   ├── server.js                 # Entry backend express server
│   ├── package.json              # Backend dependencies manager (Sequelize + mysql2)
│   └── .env                      # Backend environment variables template
│
└── frontend/
    ├── app/
    │   ├── layout.js             # Root HTML wrapper with Google Inter font
    │   ├── globals.css           # Tailwind base & glassmorphic custom utilities
    │   ├── page.js               # SaaS landing marketing view
    │   ├── login/
    │   │   └── page.js           # Login credentials card
    │   ├── register/
    │   │   └── page.js           # Signup credentials card
    │   ├── dashboard/
    │   │   └── page.js           # Dashboard metrics & dynamic SVG analytics graphs
    │   ├── forms/
    │   │   ├── page.js           # Form list directory (CRUD controls, copies URLs)
    │   │   ├── create/
    │   │   │   └── page.js       # Dynamic builder workplace (creates inputs, live preview)
    │   │   └── edit/
    │   │       └── [id]/
    │   │           └── page.js   # Dynamic editor workplace (updates fields structure)
    │   ├── form/
    │   │   └── [id]/
    │   │       └── page.js       # Shared public page (takes answers, uploads to MySQL)
    │   └── responses/
    │       └── page.js           # Submissions inspect room (dynamic CSV export, deletion)
    ├── components/
    │   ├── Navbar.js             # Main navbar displaying user profiles
    │   └── Sidebar.js            # App drawer linking views
    ├── services/
    │   └── api.js                # Custom Axios instance with interceptors for JWT
    ├── hooks/
    │   └── useAuth.js            # Context state manager for signup/logins
    ├── jsconfig.json             # App directory import shortcuts config
    ├── tailwind.config.js        # Theme color and styling settings
    ├── postcss.config.js         # PostCSS plugins config
    └── package.json              # Next.js frontend dependencies manager
```

---

## API Endpoints List

### Authentication
* `POST /api/auth/register` - Create a new user (expects `name`, `email`, `password`)
* `POST /api/auth/login` - Authenticate user & return token (expects `email`, `password`)
* `GET /api/auth/me` - [Protected] Fetch authenticated user details

### Forms
* `POST /api/forms` - [Protected] Create a form (expects `title`, `description`, `fields`)
* `GET /api/forms` - [Protected] Get all forms of the logged-in user
* `GET /api/forms/:id` - Fetch structure of a specific form (Public)
* `PUT /api/forms/:id` - [Protected] Update form title, description, or fields
* `DELETE /api/forms/:id` - [Protected] Delete a form and its responses
* `POST /api/forms/:id/duplicate` - [Protected] Duplicate an existing form structure
* `GET /api/forms/dashboard/stats` - [Protected] Get dashboard metrics, submission trends, and form distributions

### Responses
* `POST /api/responses/:formId` - Submit answers to a form (Public)
* `GET /api/responses/:formId` - [Protected] Get all responses for a form (supports `?search=val`)
* `DELETE /api/responses/:responseId` - [Protected] Delete a specific answer record

---

## Environment Variables

### Backend (`backend/.env`)
Create a file named `.env` in the `backend/` directory:
```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mysql
DB_NAME=form_builder
JWT_SECRET=super_secret_jsonwebtoken_key_change_in_production
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (`frontend/.env.local` or defaults)
By default, the client points to `http://localhost:5001/api` (backend port). If you want to customize the API URL:
Create a file named `.env.local` in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## Installation & Startup Guide

### Prerequisites
1. **Node.js**: Ensure Node.js (version 18.x or above) is installed on your system.
2. **MySQL Service**: Have a running local MySQL instance (`localhost:3306`) with credentials matching your `.env` settings. The database `form_builder` is automatically created on boot.

### Step 1: Clone or Open Workspace
Ensure the code files are present in your workspace directory (`d:\KESHAV\Form_Builder`).

### Step 2: Configure & Start Backend
Open a terminal in the backend workspace:
```bash
cd backend

# Install dependencies (Sequelize, mysql2, express, etc.)
npm install

# Start development server
node server.js
```
The server will boot on `http://localhost:5001`. You should see `MySQL connected successfully` and `MySQL schemas synchronized` in the console log.

### Step 3: Configure & Start Frontend
Open a new terminal in the frontend workspace:
```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start Next.js development server
$env:Path = "C:\Program Files\nodejs;" + $env:Path; npm run dev
```
The client website will start running on `http://localhost:3000`.

---

## Verification Flow (E2E Walkthrough)

1. Open your browser and navigate to `http://localhost:3000`.
2. Click **Get Started** and register a new account on the Register page.
3. Upon registration, you are redirected to the **Dashboard** page.
4. Go to **Create Form** using the sidebar. Fill in the title, and click **Text Input**, **Email Input**, and **Checkboxes** on the side panel. Name the labels and options, and tick the "Required" checkbox for key fields.
5. Click **Save Form**. You will be redirected back to **My Forms** where your new form is displayed.
6. Click the **Copy Share Link** button to copy the public link.
7. Open a new browser window (or log out) and open the copied link.
8. Fill in the fields, tick checkboxes, and click **Submit Answers**. Verify that leaving required fields empty blocks submission.
9. Close the shared page. Log back in (if you logged out) and review your **Dashboard**. The "Total Responses" count, submission daily trend line chart, and form distributions bar chart are now updated.
10. Navigate to **Responses & Data** in the sidebar. Select your form from the dropdown to see the submitted answers, search within answers, inspect response details in a modal, or export everything to a CSV file.
