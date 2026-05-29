

# **MkulimaHub**  
### _Empowering Farmers, Experts, and Administrators with Smart Agricultural Solutions_

<img src="frontend/public/mh-trans.png" width="150" alt="MkulimaHub Logo"/>

---

## **Project Overview**

**MkulimaHub** is a modern web platform designed to connect **farmers**, **agricultural experts**, and **administrators** in one digital ecosystem.  
The platform simplifies communication, knowledge sharing, and data management in agriculture.

---

## 📂 **Project Structure**

```bash
mkulimahub/
├── backend/          # Node.js + Express API
│   ├── config/       # DB & passport configuration
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Auth, admin, logger, error handlers
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   └── server.js     # Express app entry point
│
├── frontend/         # React + Tailwind Frontend
│   ├── public/       # Static assets (logos, favicons)
│   ├── src/          # App source code
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Global state (Auth, Theme)
│   │   ├── pages/       # Page-level views
│   │   ├── services/    # API & logging services
│   │   └── api.js       # Axios API instance
│   └── vite.config.js
│
├── package.json       # Root configuration
└── README.md          
```

 Quick Start
### 🧩 1. Clone the Repository

```bash
git clone https://github.com/aizocraft/mkulimahub.git
cd mkulimahub
```

⚙️ 2. Setup Backend

```bash
cd backend
npm install
npm run dev
```

Make sure to create a .env file with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

💻 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```
Now open 👉 http://localhost:5173


## Core Features
**Farmer Dashboard**  
- Manage crops and get expert consultations


**Expert Dashboard**    
- Answer farmers’ questions

- Manage consultation schedules

- Track engagement analytics

**Admin Dashboard**
- View & Manage Users Account

- Monitor system activity


### **MERN Tech Stack**

| 🧩 **Layer** | ⚙️ **Technology** | 💬 **Description** |
|:-------------|:------------------|:-------------------|
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) | Builds dynamic and interactive user interfaces |
| **Backend** | ![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white) | Handles API routes and server-side logic |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white) | NoSQL database for flexible data storage |
| **Runtime** | ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) | JavaScript runtime environment for the backend |


## ☁️ **Deployment**

### 🖥️ Frontend  
**Platform:** [![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)  
🌐 **Live URL:** [https://mkulimahub.vercel.app](https://your-frontend.vercel.app)  

---

### ⚙️ Backend  
**Platform:** [![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white)](https://render.com)  
🌐 **Live API URL:** [https://your-backend.onrender.com](https://your-backend.onrender.com)  

---

## 🧾 **License**

This project is licensed under the **MIT License** — free to use, modify, and distribute.

<p align="center">
 
MkulimaHub © 2025

</p>
