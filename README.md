# Student Management System

A simple Node/Express app for managing students with admin and student views.

## Prerequisites
- Node.js (v16+ recommended) and npm installed
- MongoDB running (local instance) or a MongoDB Atlas connection string

## Setup
1. Clone or open the project folder.
2. Copy `.env.example` to `.env` and set your values:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/student_management
SESSION_SECRET=your_long_secret
```

3. Install dependencies:

```powershell
npm install
```

4. Ensure MongoDB is running. For local MongoDB, on Windows you can run the MongoDB service or use the MongoDB Compass or run `mongod`.

## Run the app
- Production start:

```powershell
npm start
```

- Development (auto-reloading):

```powershell
npm run dev
```

The server will start on the `PORT` specified in `.env` (defaults to 3000). Open `http://localhost:3000` in your browser.

## Notes
- The server serves static pages from `public/`.
- API routes are under `/api/auth` and `/api/students`.
- If you're using a remote MongoDB (Atlas), make sure your IP is permitted in Atlas and your connection string is correct.

### Seed an admin user
You can create an admin account quickly with the included script. Set the following environment variables in your `.env` or use defaults:

```env
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_PASSWORD=adminpass
```

Then run:

```powershell
npm run seed
```

This will create an `admin` user (if one doesn't exist) using the values above. Change the password immediately and don't commit credentials to source control.

### Debugging and common issues
- If you see an error about MongoDB connection, verify `MONGO_URI` is correct and the database is reachable.
- Duplicate student `roll` values will throw a Mongoose unique constraint error; use distinct `roll` values.
- If your API returns `500` errors, check logs in the terminal; the app includes a global error handler to capture unhandled exceptions.
- If a route returns `401 Not authenticated`, ensure you successfully logged in; cookies are used for session management, so your browser must allow site cookies for `localhost`.

### Useful curl examples
Create an admin (API):

```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"adminpass"}' http://localhost:3000/api/auth/register-admin
```

Login and save cookie for subsequent requests:

```bash
curl -c cookiestore -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"adminpass"}' http://localhost:3000/api/auth/login

# then use cookie to list students
curl -b cookiestore http://localhost:3000/api/students
```

### Run tests

Install dev dependencies (Jest uses mongodb-memory-server so you don't need a running MongoDB instance for tests):

```powershell
npm install
npm test
```

The tests run against an in-memory MongoDB to avoid affecting local data.


