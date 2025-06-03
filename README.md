# Peer Evaluation Platform

A full-stack, real-time peer evaluation platform for project reviews, built with **Next.js**, **Express**,and **MongoDB**. Easily host, join, and review projects with live updates and downloadable results.

<details>
<summary><strong>📁 Complete Project Structure (including hidden files)</strong></summary>

<pre>
peer-eval/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── coverage/
│   ├── config/
│   │   └── db.js
│   ├── controller/
│   ├── models/
│   │   ├── client.js
│   │   ├── host.js
│   │   └── review.js
│   ├── routes/
│   │   ├── client.js
│   │   ├── host.js
│   │   └── review.js
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   ├── requirements.txt
│   ├── Dockerfile
│   └── server.js
├── frontend/
│   ├── .env.local
│   ├── .env.example
│   ├── .gitignore
│   ├── app/
│   │   ├── clientlobby/
│   │   │   └── [roomId]/
│   │   │       └── page.js
│   │   ├── hostlobby/
│   │   │   └── [roomId]/
│   │   │       └── page.js
│   │   ├── components/
│   │   │   ├── footer.js
│   │   │   └── header.js
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   ├── coverage/
│   ├── node_modules/
│   ├── jsconfig.json
│   ├── package.json
│   ├── package-lock.json
│   ├── requirements.txt
│   ├── Dockerfile
│   └── postcss.config.mjs
├── .gitignore
├── docker-compose.yml
├── commands.txt
├── LICENSE
└── README.md
</pre>
</details>

---

## 🚀 Project Overview

A modern peer review platform for project evaluations:
- **Host Dashboard:** Create a room, manage sessions, and view all peer reviews in real time.
- **Client Page:** Join a room, submit your project details, and review peers.
- **Live Updates:** All data is synchronized instantly via Socket.IO.
- **Downloadable Results:** Export reviews as Excel files.
- **Containerized:** Easy deployment with Docker and Docker Compose.

---

## 🛠️ Tools & Technologies

- **Frontend:** Next.js, React, Tailwind CSS, xlsx, react-icons
- **Backend:** Express.js, Socket.IO, Mongoose (MongoDB), dotenv, cors, prom-client, serverless-http
- **Testing:** Jest, Supertest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- **DevOps:** Docker, Docker Compose
- **Code Quality:** Codacy, SonarCloud, Istanbul (code coverage)

---

## ⚙️ Environment Variables

### Backend (`backend/.env` or `backend/.env.example`)
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/peer-eval
```

### Frontend (`frontend/.env.local` or `frontend/.env.example`)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

---

## 📦 Dependencies
<details>

### Backend (`backend/package.json`)
- express
- cors
- dotenv
- mongoose
- serverless-http
- prom-client
- nodemon (dev)
- jest, supertest (dev)

### Frontend (`frontend/package.json`)
- next
- react
- react-dom
- tailwindcss
- react-icons
- xlsx
- jest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event (dev)
- babel-jest, @babel/core, @babel/preset-env, @babel/preset-react (dev)
---
</details>

## 🏗️ Installation & Setup

### 1. Clone the repository
```sh
git clone https://github.com/haksham/peer-evaluation.git
cd peer-eval
```

### 2. Backend Setup

```sh
cd backend
cp .env.example .env         # Edit .env with your MongoDB URI if needed
npm install
npm run dev                  # or: node server.js
```

#### Run backend tests:
```sh
npm test
```

### 3. Frontend Setup

```sh
cd ../frontend
cp .env.example .env.local   # Edit if backend URL is different
npm install
npm run dev
```

#### Run frontend tests:
```sh
npm test
```

### 4. Dockerized Setup (Recommended)

```sh
docker-compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:4000](http://localhost:4000)

---

## 📝 Usage

- **Host:** Go to the homepage, create a room, and share the Room ID.
- **Client:** Join with Room ID, fill in project details, and review peers.
- **Live updates** and **Excel export** available in the host dashboard.

---

## 📊 Code Quality & Coverage
- [![Codacy Badge](https://app.codacy.com/project/badge/Grade/3a36dd18ba554de1941e3d638bf58f77)](https://app.codacy.com/gh/Haksham/peer-evaluation/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
- [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- [![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- [![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)

- [Codacy Dashboard](https://app.codacy.com/gh/Haksham/peer-evaluation/dashboard)
- [Codecov Coverage](https://app.codecov.io/gh/Haksham/peer-evaluation/config)
- [SonarCloud Analusis](https://sonarcloud.io/project/overview?id=Haksham_peer-evaluation)
- Coverage reports are generated in the `coverage/` folders in both frontend and backend.

---

## 👥 Authors

- [Harsh_VM](https://github.com/haksham)
- [Mitesh_Jain](https://github.com/miteshjain8)

---

## 📄 License

This project is licensed under the [CC0 License](LICENSE).

---

*Built with ❤️ for collaborative project reviews!*