# MERN CSV/XLSX User Dashboard

A **full-stack MERN application** that allows you to:

- Upload `.csv` or `.xlsx` files containing user data.
- Store all records in **MongoDB Atlas**.
- Automatically **update existing users** when data changes (based on Email).
- Display **all user fields** in a paginated dashboard.
- Handle **1 lakh+ records** with fast pagination.

---

## 📌 Features

- **Upload CSV/XLSX** directly from the frontend.
- **Automatic duplicate detection** by Email.
- **Upsert functionality**: If a record exists, it is updated instead of duplicated.
- **20+ fields support**:

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/mern-csv-dashboard.git
cd mern-csv-dashboard

2. Setup backend

cd backend
npm install


Create a .env file:

MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
Start backend:

npm run dev


3. Setup frontend

cd ../frontend
npm install
npm run dev
🚀 Usage
Start backend and frontend.

Open frontend in your browser:

http://localhost:5173
Use the file input to upload .csv or .xlsx file.

Data is stored in MongoDB Atlas and shown in the dashboard.

Pagination lets you browse through large datasets.

🛠 Technologies Used
MongoDB Atlas — cloud database

Express.js — backend framework

React.js + Vite — frontend

Node.js — runtime

Mongoose — MongoDB ORM

React Query — frontend data fetching

fast-csv — CSV parsing

xlsx — Excel parsing

Multer — file uploads

