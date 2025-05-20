# Chat App

A full-stack real-time chat application built with NestJS (backend) and Next.js (frontend).

## Features

- User authentication (register/login)
- Create and join chat rooms
- Real-time messaging with WebSockets
- Responsive, modern UI
- Prisma ORM for database management

## Tech Stack

- **Backend:** NestJS, Prisma, PostgreSQL
- **Frontend:** Next.js, React, TypeScript
- **WebSockets** for real-time communication

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL (or update Prisma config for your DB)

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/yourusername/ChatApp.git
   cd ChatApp
   ```

2. **Install dependencies for both frontend and backend:**

   ```sh
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. **Set up environment variables:**

   - Copy `.env.example` to `.env` in both `backend` and `frontend` folders and fill in the required values (e.g., `DATABASE_URL` for backend).

4. **Run database migrations:**
   ```sh
   cd ../backend
   npx prisma migrate dev
   ```
   to view the backend in your browser run:
   ```
   npx prisma studio
   ```

### Running the App

- **Start the backend:**

  ```sh
  cd backend
  npm run start:dev
  ```

- **Start the frontend:**

  ```sh
  cd ../frontend
  npm run dev
  ```

- Visit [http://localhost:3000](http://localhost:3000) to use the app.

## Project Structure

- `backend/` - NestJS API, authentication, chat/message logic, Prisma ORM
- `frontend/` - Next.js app, UI components, authentication, chat interface

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
