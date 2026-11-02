 <div align="center">

# 🎓 GrowX
### Your Academic Journey, Organized.

**A private, student-focused academic management platform with JNTUK R23-aligned grade calculations.**

[![React](https://img.shields.io/badge/Frontend-React-149ECA?logo=react&logoColor=white)](https://react.dev/) [![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/) [![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/) [![Regulation](https://img.shields.io/badge/Academic%20Grading-JNTUK%20R23-233876)](https://jntukucen.ac.in/wp-content/uploads/2023/11/R23-REGULATIONS.pdf)

[**🌐 Live Platform**](https://grow-x-academic-platform--rohith46181.replit.app/) · [**📘 Official R23 Regulations**](https://jntukucen.ac.in/wp-content/uploads/2023/11/R23-REGULATIONS.pdf)

</div>

---

## ✨ About GrowX

**GrowX** is a private academic management platform designed to help students organize semester-wise results, manage subjects and credits, calculate SGPA/CGPA, and monitor backlogs—all in one place.

It also provides an administrative workspace for managing student accounts and academic records.

> **Note:** GrowX is an independent project, not an official JNTUK website or university service. Its grading logic is based on JNTUK B.Tech R23 regulations.

## 🚀 Key Features

### 👨‍🎓 Student Portal

- Secure student login and personalized dashboard.
- Student profile with academic information.
- Semester-wise academic record management (1-1 to 4-2).
- Add, edit, and delete subjects.
- Enter subject marks and credits.
- Automatic grade and grade-point calculation.
- Automatic SGPA and CGPA calculation.
- Backlog identification and tracking.
- Semester-wise results management.
- Persistent academic records using MongoDB.
- Responsive interface with Light and Dark modes.

### 🛡️ Admin Portal

- Separate administrator login.
- Admin dashboard with student statistics.
- Create and manage student accounts.
- Update student profiles.
- Reset student passwords.
- Manage semesters and subjects.
- Manage academic records and results.
- View student-wise academic information.
- Activate or deactivate student accounts.

## 🎯 JNTUK R23 Grading System

GrowX follows the **JNTUK B.Tech R23 10-point absolute grading system**.

| Marks Range | Letter Grade | Grade Points | Result |
|---|---|---:|---|
| 90–100 | S | 10 | Pass |
| 80–89 | A | 9 | Pass |
| 70–79 | B | 8 | Pass |
| 60–69 | C | 7 | Pass |
| 50–59 | D | 6 | Pass |
| 40–49 | E | 5 | Pass |
| Below 40 | F | 0 | Fail |
| Absent | Ab | 0 | Absent |

**Academic grading notes:**

- S, A, B, C, D and E represent passing grades.
- F represents failure.
- Ab represents absence.
- F and Ab are treated as unsuccessful attempts and tracked as backlogs.
- Credit-bearing failed subjects contribute zero grade points while their credits are included in the calculation, as applicable under the regulation.
- Non-credit courses are excluded from SGPA and CGPA calculations.

**Official reference:** [JNTUK B.Tech R23 Academic Regulations](https://jntukucen.ac.in/wp-content/uploads/2023/11/R23-REGULATIONS.pdf)

## 🧮 SGPA & CGPA Calculation

### Semester Grade Point Average (SGPA)

```text
SGPA = Σ (Credits × Grade Points) / Σ (Credits)
```

### Cumulative Grade Point Average (CGPA)

```text
CGPA = Σ (All Semester Subject Credits × Grade Points)
       / Σ (All Semester Subject Credits)
```

- SGPA is calculated separately for each semester.
- CGPA is calculated using the credit-weighted grade points of all included subjects.
- CGPA is not calculated by simply averaging semester SGPAs.
- Results are displayed up to two decimal places.
- Failed subjects and supplementary attempts must be handled according to the applicable regulation without double-counting a subject.

### 📊 Example SGPA Calculation

| Subject | Credits | Marks | Grade | Grade Points |
|---|---:|---:|---|---:|
| Machine Learning | 3 | 94 | S | 10 |
| Database Systems | 3 | 83 | A | 9 |
| Computer Networks | 3 | 74 | B | 8 |
| Professional Elective | 3 | 47 | E | 5 |
| Laboratory | 2 | 35 | F | 0 |
| **Total** | **14** | | | |

```text
SGPA = (3×10 + 3×9 + 3×8 + 3×5 + 2×0) / 14

SGPA = 96 / 14

SGPA = 6.86
```

*Example data for illustration only.*

## 🧭 Platform Modules

| Student Portal | Admin Portal |
|---|---|
| Dashboard | Admin Dashboard |
| My Profile | Student Management |
| CGPA Calculator | Create Student |
| Semester Management | Academic Records |
| Subject Management | Results Management |
| Results | Subject Management |
| Logout | Settings & Logout |

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT |
| Password Security | bcrypt |
| API Communication | REST API |
| Styling | CSS / Responsive UI |

## 🔐 Data Security & Persistence

GrowX is designed to maintain individual student records securely.

- Student accounts have individual login credentials.
- Academic records are associated with the authenticated student.
- MongoDB is used for persistent academic data storage.
- Passwords are stored in hashed form.
- Protected routes restrict unauthorized access.
- Student records remain available after logout and login.
- Admin access is separated from student access.

## ⚙️ Local Development

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

### 2. Backend Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Environment Variables

Create a `.env` file inside the frontend folder.

```env
VITE_API_URL=http://localhost:5000
```

### 4. Install Dependencies

Install dependencies using the package scripts in the respective frontend and backend directories.

### 5. Start the Application

Run the frontend and backend using the development scripts configured in their respective `package.json` files.

**Security:** Never upload `.env` files, database passwords, JWT secrets, or student credentials to GitHub.

## 🌐 Deployment

The intended deployment architecture supports:

- **Frontend:** Vercel
- **Backend:** Render / Replit
- **Database:** MongoDB Atlas

Production environment variables must be configured in the deployment platform.

## 📌 Academic Disclaimer

GrowX is an independent academic management project developed for personal academic record management and grade estimation.

It is not affiliated with or officially endorsed by Jawaharlal Nehru Technological University, Kakinada (JNTUK).

Official university results, regulations, amendments, and examination notifications always take precedence over calculations displayed by GrowX.

## 👨‍💻 Project Creator

**Developed by Perumalla Rohith**

- GitHub: [rohith-1806](https://github.com/rohith-1806)
- Portfolio: [rohith06-portfolio](https://rohith06-portfolio.netlify.app/)
- Instagram: [@broo_codeee_](https://www.instagram.com/broo_codeee_/)

---

<div align="center">

### GrowX — Track Your Grades. Understand Your Progress. Keep Growing. 🌱

**Made with ❤️ for students.**

</div>
