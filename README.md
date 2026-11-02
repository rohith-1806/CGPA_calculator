<div align="center">🎓 GrowX
Academic Performance & CGPA Management Platform
A private student academic dashboard with JNTUK R23 grading support.
   
🚀 Live Application · 📘 JNTUK R23 Regulations
</div>✨ About GrowX
GrowX helps students manage their academic records, calculate semester-wise SGPA and cumulative CGPA, review subject grades, and monitor backlogs in one place. It provides separate Student and Admin portals and uses JNTUK R23 marks-to-grade rules rather than a generic grading scale.
GrowX is an independent academic management project and is not an official JNTUK portal. Academic calculations are for tracking purposes; university-issued results remain authoritative.

🚀 Features
👨‍🎓 Student Portal	🛡️ Admin Portal
Personalized dashboard and profile	Manage student accounts
Add and manage semesters	Create and update student profiles
Add subjects, marks and credits	Manage academic records
Automatically calculate grades	Manage semesters and subjects
Track SGPA, CGPA and backlogs	Review results and academic performance
View semester-wise results	Reset passwords and manage access


📚 Academic Workflow
1. Sign in with your assigned student credentials.
2. Open CGPA Calculator and select + Add Semester.
3. Add subjects with their names, codes, credits and marks.
4. GrowX determines the applicable R23 letter grade and grade point.
5. Review semester SGPA, cumulative CGPA, earned credits and backlogs.
6. Edit or update records as new results become available.
Supported semester labels: 1-1 · 1-2 · 2-1 · 2-2 · 3-1 · 3-2 · 4-1 · 4-2.
🏅 JNTUK R23 Grading System
GrowX follows the 10-point absolute grading scale published in the JNTUK B.Tech R23 academic regulations.
Marks (out of 100)	Letter Grade	Description	Grade Points
90–100	S	Superior	10
80–89	A	Excellent	9
70–79	B	Very Good	8
60–69	C	Good	7
50–59	D	Average	6
40–49	E	Pass	5
Below 40	F	Fail	0
Absent	Ab	Absent	0


Important R23 rules:
- E is a passing grade; F and Ab indicate failure and require reappearance.
- A course may also require a minimum of 35% in the end examination in addition to 40% overall, where applicable under the academic regulations. A final pass/fail decision should therefore use component-wise exam marks when available, not only the total.
- F/Ab courses count with zero grade points in SGPA calculations when they carry credits.
- Non-credit audit courses are excluded from SGPA/CGPA.
- The system must handle supplementary results without counting the same course's credits twice.
Source: JNTUK B.Tech R23 Academic Regulations — Grading and SGPA/CGPA. Check university amendments and your college's applicable regulations before treating calculated values as official.
🧮 SGPA & CGPA Calculation
Semester Grade Point Average (SGPA)
\[
SGPA = \frac{\sum (C_i \times G_i)}{\sum C_i}
\]
- Cᵢ = subject credits
- Gᵢ = grade points earned in that subject
Cumulative Grade Point Average (CGPA)
\[
CGPA = \frac{\sum_{\text{all semesters}}(C_i \times G_i)}{\sum_{\text{all semesters}}C_i}
\]
Both values are rounded to two decimal places. CGPA is credit-weighted; it is not a simple average of semester SGPAs.
<details>
<summary><strong>📊 Example SGPA calculation</strong></summary>Subject	Credits	Grade	Grade Points	Credit Points
Subject 1	3	A	9	27
Subject 2	3	B	8	24
Subject 3	4	S	10	40
Subject 4	2	E	5	10
Total	12			101


SGPA = 101 ÷ 12 = 8.42
</details>🧰 Technology Stack
Layer	Technology
Frontend	React, Vite
Backend	Node.js, Express
Database	MongoDB Atlas, Mongoose
Authentication	JWT, password hashing
Styling	Responsive light/dark UI


🗺️ Application Structure
GrowX
├── Student Portal
│   ├── Dashboard
│   ├── Profile
│   ├── CGPA Calculator
│   │   ├── Semesters
│   │   └── Subjects & Grades
│   └── Results
└── Admin Portal
    ├── Dashboard
    ├── Student Management
    ├── Academic Records
    ├── Semesters & Subjects
    └── Settings
🔐 Privacy & Security
GrowX is designed for a restricted student group. Each student should be able to access only their own records; administrators have separately authorized management access. Credentials must be hashed, secrets kept in server-side environment variables, and academic records stored persistently in the database.

Never commit student credential spreadsheets/JSON files, .env files, MongoDB connection strings or JWT secrets to GitHub.
🔗 Quick Links
- Application: https://grow-x-academic-platform--rohith46181.replit.app/
- R23 regulation reference: https://jntukucen.ac.in/wp-content/uploads/2023/11/R23-REGULATIONS.pdf
- Developer portfolio: https://rohith06-portfolio.netlify.app/
- GitHub: https://github.com/rohith-1806
<div align="center">GrowX — Track your progress. Understand your grades. Grow academically. 🌱

Made with ❤️ for student academic management.
</div>
