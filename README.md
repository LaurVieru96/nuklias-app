# Nuklias Dashboard - Backend API

Backend API for Nuklias Dashboard built with Express.js, PostgreSQL (Neon), and Drizzle ORM.

## 🚀 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Passport.js (session-based)
- **Validation**: Zod
- **Language**: TypeScript

## 📦 Installation

```bash
npm install
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=your-neon-connection-string
SESSION_SECRET=your-random-secret-key
NODE_ENV=development
CLIENT_URL=http://localhost:5000
PORT=3000
```

## 🏃 Running Locally

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

## 🗄️ Database

```bash
# Push schema to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Seed database with initial data
npm run db:seed
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Leads
- `GET /api/leads` - List leads (with filters)
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🔐 Test Credentials

```
Admin: admin@nuklias.com / Admin123!
Member: member@nuklias.com / Member123!
```

**⚠️ Change these in production!**

## 🚀 Deployment (Render)

1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `npm start`
3. **Environment Variables**: Add all from `.env.example`

## 📝 License

MIT
