# Adaptive Productivity Dashboard

Hi! 👋 This is my final project for Web Dev II. I built a simple but fully functional productivity dashboard where you can manage **Goals → Tasks → Subtasks** in one place. The entire app is made with **only HTML, CSS, and Vanilla JavaScript**, and it runs directly in the browser without any external frameworks or libraries.

---

## Project Description
Adaptive Productivity Dashboard is a frontend‑only productivity system. It helps users break a big goal into tasks and subtasks so progress becomes visible and manageable. The interface is clean and interactive, and all changes are reflected immediately through DOM manipulation.

---

## Problem Statement
Many students and professionals struggle with large goals because they feel overwhelming. This project solves that by:
- Allowing a user to create a clear **goal**
- Dividing it into smaller **tasks**
- Breaking tasks into smaller **subtasks**
- Tracking progress automatically

---

## Features Implemented
- Create, edit, archive, and delete goals
- Add tasks inside goals and update their status
- Add subtasks inside each task
- Auto progress calculation for goals
- Tabs for tasks: All / Today / Upcoming / Overdue / Done
- Search, sort, and priority filters for tasks
- Drag‑and‑drop task reorder
- Notes widget with multiple notes (create/edit/delete)
- Weekly progress chart
- Calendar preview
- Upcoming tasks widget
- LocalStorage persistence with schema versioning
- Basic error handling for empty titles and confirmations for delete actions

---

## DOM Concepts Used
- **Dynamic Rendering**: Goals, tasks, and subtasks are created using JavaScript and inserted into the DOM.
- **Event Delegation**: A single event listener handles actions like add, delete, and edit for all dynamic elements.
- **Conditional Rendering**: Different views (Goals, Goal Overview, Tasks) are rendered based on state.
- **Live Updates**: Every change updates the DOM instantly, so the user always sees the latest data.
- **LocalStorage Integration**: Data is saved and loaded from browser storage.

---

## How the Project Works (Simple Flow)
1. The app loads data from localStorage. If no data exists, it creates seed data.
2. The UI is rendered based on the current state.
3. User actions update the state.
4. The state is saved back into localStorage.
5. The UI re-renders with the latest updates.

---

## Steps to Run the Project
1. Download or clone this repository.
2. Open the folder and run `index.html` in any modern browser.
3. Start adding goals, tasks, and subtasks.

---

## File Structure
- `index.html` → App structure and layout
- `style.css` → Styling and layout rules
- `script.js` → JavaScript logic, state, and DOM updates

---

## Known Limitations
- Frontend‑only (no backend database)
- Data is stored only in browser localStorage
- Drag‑and‑drop works only within the visible task list
- Not optimized for extremely large datasets

---

## Demo Video
A short demo video (3–7 minutes) shows:
- Goal creation
- Task & subtask management
- Progress updates
- Widget usage

---

Thanks for checking out my project! 😊
