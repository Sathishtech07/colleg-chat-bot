/**
 * chatbot.js — Chatbot Logic
 * ===========================
 * Implements the chatbot for chatbot.html.
 *
 * ARCHITECTURE:
 *   1. The user types a question.
 *   2. We first try to match it using the LOCAL KEYWORD ENGINE (instant, no internet needed).
 *   3. If no local match, we call the Java backend API GET /api/chat?q=...
 *   4. If the backend is also unavailable, show a default "contact office" message.
 *
 * This dual-mode approach means the chatbot ALWAYS works, even without the backend.
 */

// ----------------------------------------------------------------
// 1. LOCAL KNOWLEDGE BASE (Keyword-Matching Engine)
// ----------------------------------------------------------------

/**
 * Each entry has:
 *   keywords — words/phrases to look for in the user's question
 *   answer   — the response to display
 *
 * The matching algorithm: for each entry, it checks how many keywords
 * appear in the user's question. The entry with the most matches wins.
 */
const LOCAL_KB = [
  {
    keywords: ['timing', 'time', 'hours', 'open', 'working hours', 'office hours', 'college hours'],
    answer: `🕐 <strong>College Timings:</strong><br>
📅 Monday – Saturday: <strong>8:00 AM – 5:00 PM</strong><br>
🚫 Closed on Sundays and national holidays.<br><br>
Individual departments may have their own hours. Please check with your department office for specific timings.`
  },
  {
    keywords: ['library', 'books', 'reading room', 'borrow'],
    answer: `📚 <strong>SIT Library:</strong><br>
📍 Location: Central Block (Block A), Ground Floor<br>
🕐 Timings:<br>
&nbsp;&nbsp;• Mon–Fri: <strong>8:00 AM – 8:00 PM</strong><br>
&nbsp;&nbsp;• Saturday: <strong>9:00 AM – 5:00 PM</strong><br>
&nbsp;&nbsp;• Sunday: Closed<br><br>
📖 Students can borrow up to <strong>3 books</strong> for 14 days.<br>
📧 Contact: library@sit.edu`
  },
  {
    keywords: ['cse', 'computer science', 'computer department', 'cs department'],
    answer: `💻 <strong>CSE Department:</strong><br>
📍 Location: CSE Block (Block C), 2nd Floor<br>
👨‍🏫 HOD: <strong>Dr. Ananya Krishnan</strong><br>
📧 Email: hod.cse@sit.edu<br>
📞 Phone: +91-98765-43220<br>
🕐 HOD Consultation: Mon, Wed, Fri — 11:00 AM – 1:00 PM`
  },
  {
    keywords: ['ece', 'electronics', 'communication', 'electrical'],
    answer: `📡 <strong>ECE Department:</strong><br>
📍 Location: Block D, 1st Floor<br>
👨‍🏫 HOD: <strong>Dr. Rajesh Verma</strong><br>
📧 Email: hod.ece@sit.edu<br>
🕐 HOD Consultation: Tue, Thu — 10:00 AM – 12:00 PM`
  },
  {
    keywords: ['mech', 'mechanical', 'workshop'],
    answer: `⚙️ <strong>Mechanical Engineering Department:</strong><br>
📍 Location: Block M, Ground Floor<br>
👨‍🏫 HOD: <strong>Dr. Mohan Das</strong><br>
📧 Email: hod.mech@sit.edu<br>
Facilities: Workshop, CAD Lab, Thermal Engineering Lab`
  },
  {
    keywords: ['civil', 'construction', 'structural'],
    answer: `🏗️ <strong>Civil Engineering Department:</strong><br>
📍 Location: Block B, Ground Floor<br>
👨‍🏫 HOD: <strong>Dr. Sunita Rao</strong><br>
📧 Email: hod.civil@sit.edu`
  },
  {
    keywords: ['mba', 'management', 'business'],
    answer: `📊 <strong>MBA Department:</strong><br>
📍 Location: Management Block, 1st Floor<br>
👨‍🏫 HOD: <strong>Dr. Kavita Sharma</strong><br>
📧 Email: hod.mba@sit.edu<br>
Facilities: Bloomberg Terminal Lab, Case Study Room`
  },
  {
    keywords: ['admission', 'apply', 'application', 'join', 'enroll', 'enrollment'],
    answer: `📋 <strong>Admission Process:</strong><br>
1️⃣ Fill online application at <strong>www.sit.edu/apply</strong><br>
2️⃣ Upload required documents<br>
3️⃣ Pay application fee (₹500)<br>
4️⃣ Attend counselling as per schedule<br>
5️⃣ Pay tuition fee and confirm seat<br><br>
📧 admissions@sit.edu | 📞 +91-98765-43211`
  },
  {
    keywords: ['documents', 'required documents', 'document', 'certificate', 'marksheet'],
    answer: `📄 <strong>Documents Required for Admission:</strong><br>
1. 10th Mark Sheet & Certificate<br>
2. 12th Mark Sheet & Certificate<br>
3. Transfer Certificate (TC)<br>
4. Migration Certificate<br>
5. Birth Certificate<br>
6. Passport-size Photographs (6 nos.)<br>
7. Aadhar Card (student & parents)<br>
8. Caste Certificate (if applicable)<br>
9. Medical Fitness Certificate`
  },
  {
    keywords: ['fees', 'fee', 'tuition', 'cost', 'price', 'how much'],
    answer: `💰 <strong>Approximate Fee Structure (per year):</strong><br>
• B.Tech: ₹80,000 – ₹1,20,000<br>
• MBA: ₹60,000 – ₹90,000<br>
• MCA: ₹55,000 – ₹80,000<br><br>
Scholarships available for merit and economically weaker students.<br>
📧 Contact fees counter for exact breakdown.`
  },
  {
    keywords: ['contact', 'phone', 'email', 'address', 'reach'],
    answer: `📞 <strong>College Contact Details:</strong><br>
📞 Phone: <strong>+91-98765-43210</strong><br>
📧 Email: <strong>info@sit.edu</strong><br>
🌐 Website: <strong>www.sit.edu</strong><br>
📍 Address: 123 Knowledge Park, Tech City, State – 500001`
  },
  {
    keywords: ['location', 'where', 'address', 'how to reach', 'directions', 'route'],
    answer: `📍 <strong>How to Reach SIT:</strong><br>
Address: 123 Knowledge Park, Tech City, State – 500001<br><br>
🚇 Metro: Tech City Central Station (500 m away)<br>
🚌 Bus: Routes 42, 57, 88 stop at SIT Main Gate<br>
🚗 Parking available on campus`
  },
  {
    keywords: ['hostel', 'accommodation', 'stay', 'room', 'dormitory'],
    answer: `🏠 <strong>Hostel Facilities:</strong><br>
🏠 Boys Hostel: Block H1 (500 seats)<br>
🏠 Girls Hostel: Block H2 (400 seats)<br><br>
✅ Facilities: Wi-Fi, Mess, Laundry, Reading Room, 24×7 Security<br>
📧 hostel@sit.edu | 📞 Warden: +91-98765-43230`
  },
  {
    keywords: ['leave', 'absent', 'absence', 'leave application'],
    answer: `📝 <strong>How to Apply for Leave:</strong><br>
1. Log in to <strong>www.sit.edu/portal</strong><br>
2. Go to "Leave Application"<br>
3. Select type: Medical / Personal / Academic<br>
4. Enter dates and reason<br>
5. Submit — tutor reviews within 1 working day<br><br>
For urgent leave, contact your Class Tutor directly.`
  },
  {
    keywords: ['exam', 'examination', 'test', 'timetable', 'schedule'],
    answer: `📝 <strong>Examination Information:</strong><br>
Exam schedules are published on the <strong>Student Portal</strong> 3 weeks before exams.<br><br>
To check your timetable:<br>
1. Visit <strong>www.sit.edu/portal</strong><br>
2. Go to Examinations → Timetable<br><br>
📧 exam@sit.edu | 📞 +91-98765-43240`
  },
  {
    keywords: ['result', 'marks', 'grade', 'score', 'scorecard', 'cgpa'],
    answer: `📊 <strong>Results:</strong><br>
Results are published on the <strong>Student Portal</strong> within 4 weeks after exams.<br><br>
To check: Log in → Results → Select Semester<br><br>
Revaluation requests: Submit within <strong>15 days</strong> of result publication.<br>
📧 exam@sit.edu`
  },
  {
    keywords: ['placement', 'job', 'recruitment', 'campus', 'company', 'intern'],
    answer: `💼 <strong>Placement Cell:</strong><br>
📈 Placement Rate: <strong>85%+</strong><br>
🏢 150+ companies visit campus<br>
💰 Avg Package: ₹5.5 LPA | Highest: ₹18 LPA<br><br>
🏆 Top Recruiters: TCS, Infosys, Wipro, HCL, Amazon, Deloitte<br>
📧 placement@sit.edu | 📞 +91-98765-43250`
  },
  {
    keywords: ['principal', 'head', 'director', 'management'],
    answer: `👨‍💼 <strong>Principal:</strong> Dr. Suresh Kumar<br>
📍 Office: 1st Floor, Administrative Block<br>
🕐 Office Hours: Mon–Fri, 10:00 AM – 1:00 PM<br><br>
For appointments, contact the admin office.`
  },
  {
    keywords: ['departments', 'courses', 'programs', 'what courses', 'available'],
    answer: `🏛️ <strong>Departments at SIT:</strong><br>
1. 💻 Computer Science & Engineering (CSE)<br>
2. 📡 Electronics & Communication Engineering (ECE)<br>
3. ⚙️ Mechanical Engineering (MECH)<br>
4. 🏗️ Civil Engineering (CIVIL)<br>
5. 📊 Master of Business Administration (MBA)<br>
6. 🖥️ Master of Computer Applications (MCA)`
  },
  {
    keywords: ['bus', 'transport', 'vehicle', 'shuttle'],
    answer: `🚌 <strong>College Transport:</strong><br>
Bus service on <strong>12 routes</strong> covering the city.<br>
Bus Pass: ₹4,000/semester<br>
Apply: Transport Office, Block A, Ground Floor<br><br>
📧 transport@sit.edu | 📞 +91-98765-43260<br>
Route list: www.sit.edu/transport`
  },
  {
    keywords: ['wifi', 'internet', 'network', 'connection'],
    answer: `📶 <strong>Internet & Wi-Fi:</strong><br>
Free Wi-Fi is available across the entire campus including hostels.<br>
Network Name: <strong>SIT-Campus</strong><br>
Login using your student portal credentials.<br>
For issues: IT Support, Block A, 2nd Floor | it@sit.edu`
  },
  {
    keywords: ['canteen', 'food', 'mess', 'cafeteria', 'eat', 'lunch'],
    answer: `🍽️ <strong>Canteen & Mess:</strong><br>
📍 Main Canteen: Ground Floor, Central Block<br>
🕐 Timings: 7:30 AM – 8:00 PM<br><br>
Hostel Mess: 7:00 AM – 9:00 PM (Breakfast, Lunch, Dinner)<br>
Menu changes daily. Vegetarian and non-vegetarian options available.`
  },
  {
    keywords: ['sports', 'gym', 'games', 'ground', 'cricket', 'football'],
    answer: `🏟️ <strong>Sports Facilities:</strong><br>
• Cricket Ground, Football Field, Basketball Court<br>
• Indoor: Badminton, Table Tennis, Chess<br>
• Modern Gymnasium (Mon–Sat, 6:00 AM – 8:00 PM)<br><br>
Annual Sports Week held every December.<br>
Contact: Sports Office, Block G`
  },
  {
    keywords: ['hod', 'head of department'],
    answer: `👨‍🏫 <strong>Heads of Departments:</strong><br>
• CSE: Dr. Ananya Krishnan — hod.cse@sit.edu<br>
• ECE: Dr. Rajesh Verma — hod.ece@sit.edu<br>
• MECH: Dr. Mohan Das — hod.mech@sit.edu<br>
• CIVIL: Dr. Sunita Rao — hod.civil@sit.edu<br>
• MBA: Dr. Kavita Sharma — hod.mba@sit.edu`
  }
];

// Default reply when nothing matches
const DEFAULT_REPLY = `😊 I'm sorry, I don't have specific information about that question.<br><br>
Please contact the college office for assistance:<br>
📞 <strong>+91-98765-43210</strong><br>
📧 <strong>info@sit.edu</strong><br>
🕐 Mon–Sat, 8:00 AM – 5:00 PM`;

// ----------------------------------------------------------------
// 2. KEYWORD MATCHING ENGINE
// ----------------------------------------------------------------

/**
 * findLocalAnswer — Searches the LOCAL_KB for the best matching answer.
 *
 * @param {string} question - The user's input
 * @returns {string|null}   - Best answer found, or null if no match
 */
function findLocalAnswer(question) {
  if (!question) return null;

  const q = question.toLowerCase().trim();

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of LOCAL_KB) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (q.includes(keyword)) {
        // Longer keyword matches score more (more specific)
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Require at least a minimum score to avoid false positives
  return bestScore >= 3 ? bestMatch.answer : null;
}

// ----------------------------------------------------------------
// 3. CHAT UI STATE
// ----------------------------------------------------------------

let isWaitingForReply = false; // Prevents sending multiple messages at once

// Welcome message shown when chatbot opens
const WELCOME_MESSAGE =
  `👋 Hello! I'm <strong>SIT Bot</strong>, your Sunrise Institute of Technology assistant.<br><br>
I can help you with information about:<br>
📍 Departments & HODs &nbsp;|&nbsp; 📚 Library timings<br>
📋 Admission process &nbsp;|&nbsp; 💼 Placements<br>
🕐 College timings &nbsp;|&nbsp; 📞 Contact details<br><br>
Type your question below or click a suggested question! 😊`;

// ----------------------------------------------------------------
// 4. CHAT RENDERING FUNCTIONS
// ----------------------------------------------------------------

/**
 * addMessage — Adds a chat bubble to the messages area.
 *
 * @param {string}  text     - The message text (HTML allowed for bot)
 * @param {string}  sender   - 'user' or 'bot'
 * @param {boolean} isHtml   - If true, render as HTML (for bot only)
 */
function addMessage(text, sender = 'bot', isHtml = false) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Avatar icons
  const avatarIcon = sender === 'bot' ? '🤖' : '👤';

  const msgEl = document.createElement('div');
  msgEl.className = `message ${sender}`;

  const contentHtml = isHtml
    ? `<div class="message-bubble">${text}<span class="message-time">${now}</span></div>`
    : `<div class="message-bubble">${escapeHtml(text)}<span class="message-time">${now}</span></div>`;

  msgEl.innerHTML = `
    <div class="message-avatar">${avatarIcon}</div>
    ${contentHtml}
  `;

  container.appendChild(msgEl);

  // Scroll to the latest message
  container.scrollTop = container.scrollHeight;
}

/**
 * showTypingIndicator — Shows the animated "..." typing bubble.
 * @returns {HTMLElement} - The indicator element (to remove it later)
 */
function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;

  const indicator = document.createElement('div');
  indicator.className = 'message bot typing-indicator';
  indicator.id = 'typing-indicator';
  indicator.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-bubble">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;

  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
  return indicator;
}

/** Removes the typing indicator */
function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

// ----------------------------------------------------------------
// 5. MAIN SEND MESSAGE FUNCTION
// ----------------------------------------------------------------

/**
 * sendMessage — Processes a user's message and generates a bot reply.
 *
 * @param {string} text - The user's question (if null, reads from input)
 */
async function sendMessage(text = null) {
  if (isWaitingForReply) return;

  const inputEl = document.getElementById('chat-input');

  // Get the message text
  const userMessage = text || (inputEl ? inputEl.value.trim() : '');
  if (!userMessage) return;

  // Clear the input field
  if (inputEl) inputEl.value = '';

  // Display the user's message
  addMessage(userMessage, 'user');

  // Show typing animation
  isWaitingForReply = true;
  showTypingIndicator();

  // Simulate a short delay for natural feel (like a real chatbot)
  await sleep(600);

  let answer = null;

  // STEP 1: Try the local keyword engine (instant, offline)
  answer = findLocalAnswer(userMessage);

  // STEP 2: If no local match, try the backend API
  if (!answer) {
    const encodedQ = encodeURIComponent(userMessage);
    const result = await apiFetch(`/chat?q=${encodedQ}`);

    if (result && result.found && result.answer) {
      answer = result.answer.replace(/\\n/g, '<br>');
    }
  }

  // STEP 3: Fallback message
  if (!answer) {
    answer = DEFAULT_REPLY;
  }

  // Remove typing indicator and show the answer
  removeTypingIndicator();
  addMessage(answer, 'bot', true); // isHtml = true for bot messages

  isWaitingForReply = false;
}

/** Simple async sleep helper */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ----------------------------------------------------------------
// 6. SUGGESTED QUESTIONS
// ----------------------------------------------------------------

const SUGGESTED_QUESTIONS = [
  'What are the college timings?',
  'Where is the CSE department?',
  'What are the library timings?',
  'What documents are required for admission?',
  'How can I apply for leave?',
  'Where is the college located?',
  'What are the placement statistics?',
  'Who is the HOD of CSE?',
  'What departments are available?',
  'What is the hostel facility?',
  'How to check exam results?',
  'What are the college contact details?',
];

/**
 * renderSuggestedQuestions — Populates the sidebar with clickable questions.
 */
function renderSuggestedQuestions() {
  const container = document.getElementById('suggested-questions');
  if (!container) return;

  container.innerHTML = '';
  SUGGESTED_QUESTIONS.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'suggested-q';
    btn.textContent = q;
    btn.addEventListener('click', () => sendMessage(q));
    container.appendChild(btn);
  });
}

// ----------------------------------------------------------------
// 7. CLEAR CHAT
// ----------------------------------------------------------------

function clearChat() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  container.innerHTML = '';
  // Show welcome message again
  setTimeout(() => addMessage(WELCOME_MESSAGE, 'bot', true), 100);
}

// ----------------------------------------------------------------
// 8. EVENT LISTENERS & INIT
// ----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Show welcome message
  setTimeout(() => addMessage(WELCOME_MESSAGE, 'bot', true), 300);

  // Render suggested questions
  renderSuggestedQuestions();

  // Send button click
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => sendMessage());
  }

  // Enter key to send
  const inputEl = document.getElementById('chat-input');
  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Clear chat button
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearChat);
  }

  // Focus input on page load
  if (inputEl) inputEl.focus();
});
