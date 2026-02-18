# bookmatcha

**bookmatcha** is a full-stack library application built with **React** and **Node.js/Express.js**, backed by a **MySQL** database. It integrates with the **Google Books API** to let users search for books, manage their personal library, write reviews, and discover new reads through personalized recommendations.

**Live App**: [https://bookmatcha.com/](https://bookmatcha.com/)

---

## Features

- **Book Search** — Search for books by title or author using the Google Books API
- **Personal Library** — Books are automatically added to your library when you rate or review them
- **Ratings & Reviews** — Submit, edit, and browse ratings and reviews from other users
- **Live Average Ratings** — Average ratings update in real time as users add or change their scores
- **Recommendations** — Get book suggestions based on the highest-rated books in your library
- **Responsive Design** — Optimized for both desktop and mobile

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JSX, CSS |
| Backend | Node.js, Express.js |
| Database | MySQL |
| External API | Google Books API |
| Auth | JWT |

---

## Getting Started

### Prerequisites

- Node.js and npm installed
- MySQL database set up
- A [Google Books API key](https://developers.google.com/books/docs/v1/using#APIKey)

### 1. Clone the repository

```bash
git clone https://github.com/simran-nijjar/bookmatcha.git
cd bookmatcha
```

### 2. Install dependencies

Run this in both the `client` and `server` directories:

```bash
cd client && npm install
cd ../server && npm install
```

### 3. Configure environment variables

**`bookmatcha/client/.env`**
```env
REACT_APP_API_URL=http://localhost:8080/api/
```

**`bookmatcha/server/.env`**
```env
MYSQLHOST=
MYSQLUSER=
MYSQLPASSWORD=
MYSQLDATABASE=
MYSQLPORT=
PORT=
API_URL=http://localhost:8080/api/
FRONT_END_URL=http://localhost:3000
EMAIL_USER=
EMAIL_API_KEY=
GOOGLE_BOOKS_API_KEY=
ACCESS_SECRET=
REFRESH_SECRET=
```

### 4. Set up the database

Run the provided SQL script to initialize your database schema:

```bash
mysql -u <your_user> -p <your_database> < server/SQL\ Scripts/CreateDB.sql
```

### 5. Start the application

In one terminal, start the backend:

```bash
cd server
node server.js
```

In another terminal, start the frontend:

```bash
cd client
npm start
```

The app will be available at `http://localhost:3000`.
    └── SQL Scripts/
        └── CreateDB.sql
```
