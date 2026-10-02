# 🎓 Sunrise Institute of Technology — College AI Chatbot Web Application

A full-stack, beginner-friendly **College AI Chatbot Web Application** built for college students to ask questions about college timings, departments, CSE HOD details, admission requirements, library rules, leave applications, faculty directory, and upcoming campus events.

---

## 📸 Main Features & Pages

The application consists of **10 complete pages**:

1. **Home Page (`index.html`)**: Hero section, quick links, features, interactive chatbot preview, and live campus statistics.
2. **Student Login (`login.html`)**: Form for student authentication with demo fallback support.
3. **Student Registration (`register.html`)**: Account registration form for new students.
4. **Chatbot Page (`chatbot.html`)**: Dual-engine AI chatbot UI with real-time keyword matching, typing indicator, suggested questions, and clear conversation history.
5. **College Information (`college-info.html`)**: Detailed student handbook for college timings, admission criteria, library rules, leave procedures, and contact details.
6. **Departments (`departments.html`)**: Comprehensive listing of engineering departments (CSE, ECE, Mechanical, Civil, IT) with HOD contacts & course overviews.
7. **Faculty Directory (`faculty.html`)**: Filterable table of professors with search capabilities, designations, and contact numbers.
8. **Events & Announcements (`events.html`)**: Campus events, annual tech fests, workshops, and urgent official circulars.
9. **Admin Login (`admin-login.html`)**: Secure portal entry for authorized administrators and HODs.
10. **Admin Dashboard (`admin.html`)**: Full CRUD management interface for Q&A Knowledge Base, Departments, Faculty members, Events, and Registered Students.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Pure HTML5, Vanilla CSS3 (Custom Dark Navy & Gold Design System), Modern JavaScript (ES6+) |
| **Backend** | Java Servlets (Jakarta EE / Servlet API 6.0), Apache Tomcat 10+ |
| **Database** | MySQL Server 8.0+ |
| **Build Tool** | Apache Maven |
| **Data Interchange** | JSON (via Google Gson) |

> ❌ **No complicated frameworks** (React, Angular, Node.js) were used, making this codebase easy to present, explain, and customize for college projects!

---

## 💻 Prerequisites & Software Requirements

Before running the project, ensure you have the following installed on your machine:

- **Java Development Kit (JDK)**: Version 17 or higher (`java -version`)
- **Apache Tomcat**: Version 10.1 or higher (Supports Jakarta EE Servlets)
- **MySQL Database Server**: Version 8.0 or higher
- **Apache Maven**: Version 3.8+ (Or use built-in Maven in IntelliJ / Eclipse / VS Code)
- **Web Browser**: Chrome, Firefox, Edge, or Safari

---

## 🗄️ Database Setup (MySQL)

1. Open **MySQL Workbench** or your terminal/command line.
2. Log into MySQL:
   ```bash
   mysql -u root -p
   ```
3. Run the SQL script located at `database/college_chatbot.sql`:
   ```sql
   SOURCE c:/Users/sathi/OneDrive/Documents/Desktop/Rinex/college-ai-chatbot/database/college_chatbot.sql;
   ```
   *(Or copy-paste the entire script into MySQL Workbench and execute).*

4. The script will automatically create the database `college_chatbot` and populate 6 tables:
   - `users`: Student and Admin user credentials.
   - `college_info`: General info Q&As.
   - `departments`: CSE, ECE, Mechanical, Civil, IT info.
   - `faculty`: Professor directory details.
   - `events`: Upcoming campus events.
   - `announcements`: Official circulars and notices.

---

## ⚙️ Backend Configuration (Java Servlets)

1. Open `backend/src/main/java/com/college/chatbot/DBConnection.java`.
2. Update the MySQL password to match your local MySQL configuration:
   ```java
   private static final String URL  = "jdbc:mysql://localhost:3306/college_chatbot?useSSL=false&allowPublicKeyRetrieval=true";
   private static final String USER = "root";
   private static final String PASS = "your_mysql_password"; // 👈 Change to your MySQL password
   ```
3. Build the backend WAR package using Maven:
   ```bash
   cd backend
   mvn clean package
   ```
4. Maven will generate `college-chatbot.war` in the `backend/target/` folder.

---

## 🚀 Running the Application

### Option A: Complete Full-Stack Mode (Java + MySQL + Frontend)

1. Copy `backend/target/college-chatbot.war` into your Tomcat `webapps/` directory (e.g. `C:\Program Files\Apache Software Foundation\Tomcat 10.1\webapps\`).
2. Start Apache Tomcat:
   ```bash
   bin/startup.bat   # Windows
   ./bin/startup.sh  # Linux / macOS
   ```
3. Verify Tomcat API is running by accessing:
   `http://localhost:8080/college-chatbot/api/chat?q=timings`
4. Open `frontend/index.html` in your web browser, or serve the `frontend/` folder using VS Code **Live Server**.

### Option B: Offline / Quick Demo Mode (Frontend Standalone)

- The application features a **smart dual-mode fallback**.
- If Tomcat or MySQL is offline, the frontend automatically falls back to an offline JavaScript engine with built-in demo credentials and local knowledge base Q&A entries.
- Simply double-click `frontend/index.html` in any browser to demonstrate the complete UI!

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@sit.edu` | `admin123` | Full Admin Dashboard (`admin.html`) |
| **Student** | `rahul@sit.edu` | `student123` | Chatbot & Student Portal |
| **Student** | `priya@sit.edu` | `student123` | Chatbot & Student Portal |
| **Student** | `arjun@sit.edu` | `student123` | Chatbot & Student Portal |

---

## 💬 Sample Questions to Ask the Chatbot

You can ask the chatbot any of the following questions in natural English:

1. *What are the college timings?*
2. *Where is the CSE department?*
3. *Who is the HOD of Computer Science?*
4. *What courses are available in college?*
5. *What documents are required for admission?*
6. *How can I apply for leave?*
7. *Where is the library located?*
8. *What are the library timings?*
9. *What are the college contact details?*
10. *Who is the HOD of ECE?*
11. *Tell me about the annual tech fest.*
12. *Is there a hostel facility available?*
13. *What are the canteen hours?*
14. *How to contact the placement cell?*
15. *What are the Mechanical department details?*

---

## 📁 Directory & Project Structure

```text
college-ai-chatbot/
├── database/
│   └── college_chatbot.sql          # MySQL Schema + 25+ Sample Q&A Rows
├── backend/
│   ├── pom.xml                      # Maven Dependencies (Servlet 6.0, MySQL, Gson)
│   └── src/main/
│       ├── java/com/college/chatbot/
│       │   ├── DBConnection.java    # JDBC Connection Utility
│       │   ├── CorsFilter.java      # CORS Header Filter for Fetch API
│       │   ├── ChatbotServlet.java  # GET /api/chat?q= (Keyword Search API)
│       │   ├── AuthServlet.java     # POST /api/login & /api/register
│       │   ├── DepartmentServlet.java# GET/POST /api/departments
│       │   ├── FacultyServlet.java  # GET/POST /api/faculty
│       │   ├── EventServlet.java    # GET/POST /api/events & /api/announcements
│       │   └── AdminServlet.java    # Full CRUD Servlet for Admin Portal
│       └── webapp/WEB-INF/web.xml   # Servlet Mapping Configuration
└── frontend/
    ├── css/
    │   └── style.css                # Navy & Gold Responsive Design System
    ├── js/
    │   ├── app.js                   # API Fetch, Toast, Auth Guard, Utilities
    │   ├── auth.js                  # Login/Register Logic & Demo Fallbacks
    │   ├── chatbot.js               # Keyword Matching Engine & UI Handler
    │   └── admin.js                 # Admin Dashboard CRUD Handlers
    ├── index.html                   # 1. Home Page
    ├── login.html                   # 2. Student Login Page
    ├── register.html                # 3. Student Registration Page
    ├── chatbot.html                 # 4. Chatbot Page
    ├── college-info.html            # 5. College Information Page
    ├── departments.html             # 6. Departments Page
    ├── faculty.html                 # 7. Faculty Directory Page
    ├── events.html                  # 8. Events and Announcements Page
    ├── admin-login.html             # 9. Admin Login Page
    └── admin.html                   # 10. Admin Dashboard Page
```

---

## ❓ Troubleshooting & FAQs

#### Q1: Getting `Access denied for user 'root'@'localhost'`?
- Ensure your MySQL service is running.
- Verify the password in `DBConnection.java` matches your MySQL root password.

#### Q2: Chatbot says "API Error / Server unreachable"?
- Verify Tomcat is running on port `8080`.
- If your Tomcat runs on a different port (e.g. `8081`), update `API_BASE` at the top of `frontend/js/app.js`:
  ```javascript
  const API_BASE = 'http://localhost:8081/college-chatbot/api';
  ```

#### Q3: How does the Chatbot search work?
- The chatbot uses a **weighted keyword matching algorithm**:
  1. The user query is tokenized into words.
  2. Each Q&A pair in the database / local knowledge base has a set of keywords (e.g. `cse, computer science, hod, head`).
  3. Matches earn positive scores. Exact keyword matches get +3 points, partial matches get +1 point.
  4. The answer with the highest matching score is selected and returned!

---

## 📜 License & Credits

Created for **Sunrise Institute of Technology (SIT)** College Project. Free for educational and academic use.
