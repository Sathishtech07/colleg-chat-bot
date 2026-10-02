-- ============================================================
--  College AI Chatbot — MySQL Database Setup Script
--  College: Sunrise Institute of Technology (SIT)
--  Run this file once to create and populate the database.
--
--  Usage:
--    mysql -u root -p < college_chatbot.sql
-- ============================================================

-- Create the database
CREATE DATABASE IF NOT EXISTS college_chatbot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE college_chatbot;

-- ============================================================
-- TABLE 1: users
--   Stores student and admin accounts.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,          -- store hashed passwords in production
  role       ENUM('student','admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: college_info
--   Chatbot Q&A pairs. The chatbot searches the 'question'
--   column using keyword matching.
-- ============================================================
CREATE TABLE IF NOT EXISTS college_info (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  category   VARCHAR(100) NOT NULL,
  question   VARCHAR(500) NOT NULL,
  answer     TEXT         NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 3: departments
--   Academic departments of the college.
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(150) NOT NULL,
  hod_name        VARCHAR(100) NOT NULL,
  description     TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 4: faculty
--   Faculty members and their details.
-- ============================================================
CREATE TABLE IF NOT EXISTS faculty (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  department  VARCHAR(150) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  email       VARCHAR(150),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 5: events
--   College events (seminars, fests, sports days, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  event_name  VARCHAR(200) NOT NULL,
  event_date  DATE         NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 6: announcements
--   College-wide announcements and notices.
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT         NOT NULL,
  date        DATE         NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SAMPLE DATA: users
--   Default admin account — CHANGE THE PASSWORD BEFORE USE!
-- ============================================================
INSERT INTO users (name, email, password, role) VALUES
  ('Admin',           'admin@sit.edu',    'admin123',   'admin'),
  ('Rahul Sharma',    'rahul@sit.edu',    'student123', 'student'),
  ('Priya Menon',     'priya@sit.edu',    'student123', 'student'),
  ('Arjun Patel',     'arjun@sit.edu',    'student123', 'student');

-- ============================================================
-- SAMPLE DATA: college_info  (Chatbot Q&A)
-- ============================================================
INSERT INTO college_info (category, question, answer) VALUES

-- General
('General', 'college timings working hours',
 'Sunrise Institute of Technology is open Monday to Saturday, 8:00 AM – 5:00 PM. The college remains closed on Sundays and national holidays.'),

('General', 'college contact phone email address',
 'You can reach us at:\n📞 Phone: +91-98765-43210\n📧 Email: info@sit.edu\n🌐 Website: www.sit.edu\n📍 Address: 123 Knowledge Park, Tech City, State – 500001'),

('General', 'college location address how to reach',
 'Sunrise Institute of Technology is located at 123 Knowledge Park, Tech City. It is well-connected by bus and metro. Nearest metro station: Tech City Central (500 m away).'),

('General', 'principal name who is principal',
 'The Principal of Sunrise Institute of Technology is Dr. Suresh Kumar. His office is on the 1st floor of the Administrative Block. Office hours: 10:00 AM – 1:00 PM (Mon–Fri).'),

-- Admission
('Admission', 'admission documents required documents',
 'Documents required for admission:\n1. 10th Mark Sheet & Certificate\n2. 12th Mark Sheet & Certificate\n3. Transfer Certificate (TC)\n4. Migration Certificate\n5. Birth Certificate\n6. Passport-size Photographs (6 nos.)\n7. Aadhar Card (student & parents)\n8. Caste Certificate (if applicable)\n9. Medical Fitness Certificate'),

('Admission', 'admission process how to apply fees',
 'Admission Process:\n1. Fill the online application at www.sit.edu/apply\n2. Upload required documents\n3. Pay the application fee (₹500)\n4. Appear for counselling as per schedule\n5. Pay tuition fee and confirm seat\n\nFor queries: admissions@sit.edu | +91-98765-43211'),

('Admission', 'fees structure tuition fee how much',
 'Approximate Fee Structure (per year):\n• B.Tech: ₹80,000 – ₹1,20,000\n• MBA: ₹60,000 – ₹90,000\n• MCA: ₹55,000 – ₹80,000\n\nFees vary by department. Scholarships available for merit and financially weak students. Contact the fees counter for exact details.'),

-- Departments
('Department', 'cse department computer science location',
 'The CSE (Computer Science & Engineering) department is located in the CSE Block (Block C), 2nd Floor. HOD: Dr. Ananya Krishnan. Contact: cse@sit.edu'),

('Department', 'ece department electronics location',
 'The ECE (Electronics & Communication Engineering) department is located in Block D, 1st Floor. HOD: Dr. Rajesh Verma. Contact: ece@sit.edu'),

('Department', 'mech department mechanical engineering location',
 'The Mechanical Engineering department is located in the Mechanical Block (Block M), Ground Floor. HOD: Dr. Mohan Das. Contact: mech@sit.edu'),

('Department', 'civil department location',
 'The Civil Engineering department is located in Block B, Ground Floor. HOD: Dr. Sunita Rao. Contact: civil@sit.edu'),

('Department', 'mba department business management location',
 'The MBA department is located in the Management Block (Block MBA), 1st Floor. HOD: Dr. Kavita Sharma. Contact: mba@sit.edu'),

('Department', 'departments available courses list',
 'Available Departments at SIT:\n1. Computer Science & Engineering (CSE)\n2. Electronics & Communication Engineering (ECE)\n3. Mechanical Engineering (MECH)\n4. Civil Engineering (CIVIL)\n5. Master of Business Administration (MBA)\n6. Master of Computer Applications (MCA)'),

-- Library
('Library', 'library location where is library',
 'The college library is located in the Central Block (Block A), Ground Floor. It is a 3-floor library with over 50,000 books and digital resources.'),

('Library', 'library timings hours open',
 'Library Timings:\n📅 Monday – Friday: 8:00 AM – 8:00 PM\n📅 Saturday: 9:00 AM – 5:00 PM\n📅 Sunday: Closed\n\nLibrary Card is required for borrowing books. Contact: library@sit.edu'),

('Library', 'library books borrow issue return',
 'Library Rules:\n• Students can borrow up to 3 books at a time\n• Loan period: 14 days (renewable once)\n• Late fine: ₹5 per day per book\n• Books can be returned at the issue counter\n• E-books and journals available via the Student Portal'),

-- HOD
('Faculty', 'hod cse head computer science department',
 'HOD of CSE Department: Dr. Ananya Krishnan\n📧 Email: hod.cse@sit.edu\n📞 Phone: +91-98765-43220\n🕐 Consultation Hours: 11:00 AM – 1:00 PM (Mon, Wed, Fri)'),

('Faculty', 'hod ece head electronics department',
 'HOD of ECE Department: Dr. Rajesh Verma\n📧 Email: hod.ece@sit.edu\n📞 Phone: +91-98765-43221\n🕐 Consultation Hours: 10:00 AM – 12:00 PM (Tue, Thu)'),

-- Leave
('Leave', 'leave application how to apply leave',
 'How to Apply for Leave:\n1. Log in to the Student Portal at www.sit.edu/portal\n2. Navigate to "Leave Application"\n3. Select leave type: Medical / Personal / Academic\n4. Fill in dates and reason\n5. Submit — your class tutor will review within 1 working day\n\nFor urgent leave, directly contact your Class Tutor or Department Office.'),

-- Hostel
('Hostel', 'hostel facility accommodation stay',
 'SIT provides separate hostels for boys and girls:\n🏠 Boys Hostel: Block H1 (capacity 500)\n🏠 Girls Hostel: Block H2 (capacity 400)\n\nFacilities: Wi-Fi, mess, laundry, reading room, 24×7 security\nContact: hostel@sit.edu | Warden: +91-98765-43230'),

-- Exam
('Exam', 'exam schedule timetable dates',
 'Exam schedules are published on the Student Portal and Notice Boards 3 weeks before exams.\n\nTo check your timetable:\n1. Visit www.sit.edu/portal\n2. Go to "Examinations" → "Timetable"\n\nFor exam-related queries: exam@sit.edu | +91-98765-43240'),

('Exam', 'result marks grade scorecard',
 'Results are announced on the Student Portal within 4 weeks of the last exam date.\n\nTo check results:\n1. Log in to www.sit.edu/portal\n2. Navigate to "Results"\n3. Select semester\n\nFor revaluation requests, submit within 15 days of result publication.'),

-- Placement
('Placement', 'placement job campus recruitment companies',
 'SIT Placement Cell helps students secure internships and jobs.\n\nHighlights:\n• 85%+ placement rate\n• 150+ companies visit campus\n• Avg. package: ₹5.5 LPA | Highest: ₹18 LPA\n\nTop recruiters: TCS, Infosys, Wipro, HCL, Amazon, Deloitte\nContact: placement@sit.edu | +91-98765-43250'),

-- Transport
('Transport', 'bus transport route college bus',
 'SIT provides bus service on 12 routes covering the city.\n\nBus Pass: ₹4,000/semester (apply at the transport office, Block A, Ground Floor)\nRoute list available at: www.sit.edu/transport\nContact: transport@sit.edu | +91-98765-43260');

-- ============================================================
-- SAMPLE DATA: departments
-- ============================================================
INSERT INTO departments (department_name, hod_name, description) VALUES
  ('Computer Science & Engineering',
   'Dr. Ananya Krishnan',
   'The CSE department offers B.Tech in Computer Science with specializations in AI, Data Science, and Cybersecurity. State-of-the-art labs with 24×7 internet access. Located in Block C, 2nd Floor.'),

  ('Electronics & Communication Engineering',
   'Dr. Rajesh Verma',
   'The ECE department covers communication systems, VLSI, embedded systems, and IoT. Well-equipped labs including a signal processing lab and RF lab. Located in Block D, 1st Floor.'),

  ('Mechanical Engineering',
   'Dr. Mohan Das',
   'The Mechanical Engineering department covers thermodynamics, manufacturing, robotics, and CAD/CAM. Equipped with a workshop, CAD lab, and thermal engineering lab. Located in Block M.'),

  ('Civil Engineering',
   'Dr. Sunita Rao',
   'The Civil department focuses on structural engineering, environmental engineering, and urban planning. Includes a surveying lab and construction simulation facility. Located in Block B.'),

  ('Master of Business Administration',
   'Dr. Kavita Sharma',
   'The MBA program covers marketing, finance, HR, and operations management. Equipped with a Bloomberg terminal lab and case-study room. Located in the Management Block.');

-- ============================================================
-- SAMPLE DATA: faculty
-- ============================================================
INSERT INTO faculty (name, department, designation, email) VALUES
  -- CSE
  ('Dr. Ananya Krishnan',       'Computer Science & Engineering', 'Professor & HOD',       'hod.cse@sit.edu'),
  ('Prof. Vikram Nair',         'Computer Science & Engineering', 'Associate Professor',   'vikram@sit.edu'),
  ('Prof. Deepa Rajan',         'Computer Science & Engineering', 'Assistant Professor',   'deepa@sit.edu'),
  ('Prof. Sanjay Gupta',        'Computer Science & Engineering', 'Assistant Professor',   'sanjay@sit.edu'),
  -- ECE
  ('Dr. Rajesh Verma',          'Electronics & Communication Engineering', 'Professor & HOD',  'hod.ece@sit.edu'),
  ('Prof. Meena Pillai',        'Electronics & Communication Engineering', 'Associate Professor','meena@sit.edu'),
  ('Prof. Arun Kumar',          'Electronics & Communication Engineering', 'Assistant Professor','arun@sit.edu'),
  -- MECH
  ('Dr. Mohan Das',             'Mechanical Engineering', 'Professor & HOD',       'hod.mech@sit.edu'),
  ('Prof. Ravi Shankar',        'Mechanical Engineering', 'Associate Professor',   'ravi@sit.edu'),
  ('Prof. Lalitha Devi',        'Mechanical Engineering', 'Assistant Professor',   'lalitha@sit.edu'),
  -- CIVIL
  ('Dr. Sunita Rao',            'Civil Engineering', 'Professor & HOD',            'hod.civil@sit.edu'),
  ('Prof. Prakash Iyer',        'Civil Engineering', 'Associate Professor',        'prakash@sit.edu'),
  -- MBA
  ('Dr. Kavita Sharma',         'Master of Business Administration', 'Professor & HOD', 'hod.mba@sit.edu'),
  ('Prof. Nikhil Sood',         'Master of Business Administration', 'Associate Professor','nikhil@sit.edu');

-- ============================================================
-- SAMPLE DATA: events
-- ============================================================
INSERT INTO events (event_name, event_date, description) VALUES
  ('TechFest 2026 — National Technical Symposium',
   '2026-10-15',
   'SIT''s flagship annual technical festival featuring paper presentations, coding competitions, robotics contest, hackathon, and tech exhibitions. Open to all engineering students across India. Registration at www.sit.edu/techfest'),

  ('Annual Cultural Fest — "Utsav 2026"',
   '2026-11-20',
   'A two-day celebration of art, dance, music, drama, and fashion. Includes celebrity performances and inter-college competitions. All students are encouraged to participate.'),

  ('Campus Recruitment Drive — TCS & Infosys',
   '2026-10-05',
   'Campus placement drive for final-year students. TCS and Infosys will conduct aptitude, technical, and HR rounds. Eligible: B.Tech final year with 60%+ aggregate. Register via Student Portal by Oct 1.'),

  ('Workshop on Artificial Intelligence & ML',
   '2026-10-22',
   'Two-day hands-on workshop by industry experts from Google. Topics: Python for ML, TensorFlow, Neural Networks, Real-world case studies. Open to all students. Fee: Free. Seats: 100. Register ASAP!'),

  ('Sports Week 2026',
   '2026-12-01',
   'Annual sports week with events including cricket, football, basketball, athletics, chess, and table tennis. Prizes and trophies for winners. Registration open at the Sports Office, Block G.');

-- ============================================================
-- SAMPLE DATA: announcements
-- ============================================================
INSERT INTO announcements (title, description, date) VALUES
  ('Semester Registration Open — Odd Semester 2026-27',
   'Students are required to register for the Odd Semester 2026-27 by September 30, 2026. Log in to the Student Portal and complete registration. Late registration fee of ₹500 will be charged after the due date.',
   '2026-09-20'),

  ('Mid-Semester Exam Schedule Released',
   'The mid-semester examination schedule for all departments has been released. Students can download the timetable from the Student Portal under Examinations → Timetable. Exams begin on October 10, 2026.',
   '2026-09-22'),

  ('Library Holiday Notice',
   'The college library will remain closed on September 28, 2026 (Sunday) due to annual maintenance. Normal services will resume on September 29, 2026. We apologise for the inconvenience.',
   '2026-09-24'),

  ('Anti-Ragging Pledge — Mandatory Submission',
   'All students must submit the Anti-Ragging Pledge through the Student Portal before September 30, 2026. This is mandatory as per UGC regulations. Students who have not submitted will not be allowed to write exams.',
   '2026-09-25'),

  ('New Online Library Resources Available',
   'SIT Library has subscribed to NPTEL, IEEE Xplore, and Springer e-journals. Students can access these resources for free using their college email ID. Visit www.sit.edu/library for access links.',
   '2026-09-18');

-- ============================================================
--  End of Script
-- ============================================================
