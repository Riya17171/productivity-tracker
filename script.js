/* Adaptive Productivity Dashboard - SPA version (restored) */

const STORAGE_KEY = "apd_state";
const STORAGE_VERSION = 1;

const appEl = document.getElementById("app");
const mainViewEl = document.getElementById("mainView");
const currentDateEl = document.getElementById("currentDate");
const newGoalBtn = document.getElementById("newGoalBtn");
const navGoals = document.getElementById("navGoals");
const navGoal = document.getElementById("navGoal");
const navTasks = document.getElementById("navTasks");

const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");

let confirmCallback = null;

let state = normalizeState(loadState());

init();

function init() {
  currentDateEl.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  ensureSelectedGoal();
  renderApp();
  wireEvents();
}

function wireEvents() {
  newGoalBtn.addEventListener("click", handleNewGoal);

  modalCancel.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  modalConfirm.addEventListener("click", () => {
    if (confirmCallback) confirmCallback();
    closeModal();
  });

  appEl.addEventListener("click", handleClick);
  appEl.addEventListener("change", handleChange);
  appEl.addEventListener("input", handleInput);
  appEl.addEventListener("blur", handleBlur, true);
  appEl.addEventListener("keydown", handleKeydown);
  appEl.addEventListener("focusin", handleFocusIn);

  appEl.addEventListener("dragstart", handleDragStart);
  appEl.addEventListener("dragover", handleDragOver);
  appEl.addEventListener("drop", handleDrop);
  appEl.addEventListener("dragend", handleDragEnd);
}

/* --------------------------- State + Persistence -------------------------- */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION) return seedState();
    return parsed.state;
  } catch (err) {
    return seedState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, state }));
}

function updateState(updater) {
  updater(state);
  saveState();
  renderApp();
}

function normalizeState(current) {
  if (!current || !current.ui) return seedState();
  current.ui = {
    selectedGoalId: current.ui.selectedGoalId || null,
    showArchived: current.ui.showArchived ?? false,
    page: current.ui.page || "goals",
    tab: current.ui.tab || "all",
    search: current.ui.search || "",
    sort: current.ui.sort || "deadline",
    priorityFilter: current.ui.priorityFilter || "all",
    expandedTaskIds: Array.isArray(current.ui.expandedTaskIds) ? current.ui.expandedTaskIds : [],
    dashboardNotes: current.ui.dashboardNotes || "",
    activeWidget: current.ui.activeWidget || "",
  };
  if (!current.notes) current.notes = {};
  if (!Array.isArray(current.noteOrder)) current.noteOrder = Object.keys(current.notes);

  Object.values(current.tasks || {}).forEach((task) => {
    if (task.status === "done" && !task.completedAt) {
      task.completedAt = task.createdAt;
    }
  });

  return current;
}

/* ------------------------------ Seed Data -------------------------------- */

function seedState() {
  const today = new Date();
  const goal1Id = uid("goal");
  const goal2Id = uid("goal");

  const task1Id = uid("task");
  const task2Id = uid("task");
  const task3Id = uid("task");
  const task4Id = uid("task");
  const task5Id = uid("task");
  const task6Id = uid("task");

  const sub1Id = uid("sub");
  const sub2Id = uid("sub");
  const sub3Id = uid("sub");
  const sub4Id = uid("sub");

  const nowIso = new Date().toISOString();

  return {
    goals: {
      [goal1Id]: {
        id: goal1Id,
        title: "Launch Portfolio v2",
        description: "Refresh the case studies and ship a new personal site.",
        createdAt: nowIso,
        targetDate: formatDateInput(addDays(today, 14)),
        archived: false,
        tasks: [task1Id, task2Id, task3Id],
        progressMode: "auto",
      },
      [goal2Id]: {
        id: goal2Id,
        title: "Fitness Reset",
        description: "Build consistency with workouts and nutrition.",
        createdAt: nowIso,
        targetDate: formatDateInput(addDays(today, 30)),
        archived: false,
        tasks: [task4Id, task5Id, task6Id],
        progressMode: "auto",
      },
    },
    goalOrder: [goal1Id, goal2Id],
    tasks: {
      [task1Id]: {
        id: task1Id,
        goalId: goal1Id,
        title: "Audit old projects",
        notes: "Mark outdated pieces and gather metrics.",
        priority: 3,
        deadline: formatDateInput(addDays(today, 2)),
        estimateMinutes: 90,
        status: "doing",
        createdAt: nowIso,
        completedAt: "",
        orderIndex: 0,
        subtaskIds: [sub1Id, sub2Id],
      },
      [task2Id]: {
        id: task2Id,
        goalId: goal1Id,
        title: "Write new case study",
        notes: "Focus on problem framing and results.",
        priority: 5,
        deadline: formatDateInput(addDays(today, 6)),
        estimateMinutes: 180,
        status: "todo",
        createdAt: nowIso,
        completedAt: "",
        orderIndex: 1,
        subtaskIds: [],
      },
      [task3Id]: {
        id: task3Id,
        goalId: goal1Id,
        title: "Deploy site",
        notes: "Connect custom domain and test on mobile.",
        priority: 4,
        deadline: formatDateInput(addDays(today, 10)),
        estimateMinutes: 60,
        status: "todo",
        createdAt: nowIso,
        completedAt: "",
        orderIndex: 2,
        subtaskIds: [],
      },
      [task4Id]: {
        id: task4Id,
        goalId: goal2Id,
        title: "Plan weekly workouts",
        notes: "Focus on strength split and cardio slots.",
        priority: 4,
        deadline: formatDateInput(addDays(today, 1)),
        estimateMinutes: 45,
        status: "done",
        createdAt: nowIso,
        completedAt: nowIso,
        orderIndex: 0,
        subtaskIds: [sub3Id],
      },
      [task5Id]: {
        id: task5Id,
        goalId: goal2Id,
        title: "Track meals for 7 days",
        notes: "Log protein, fiber, and water intake.",
        priority: 2,
        deadline: formatDateInput(addDays(today, 5)),
        estimateMinutes: 20,
        status: "doing",
        createdAt: nowIso,
        completedAt: "",
        orderIndex: 1,
        subtaskIds: [],
      },
      [task6Id]: {
        id: task6Id,
        goalId: goal2Id,
        title: "Schedule recovery session",
        notes: "Yoga or mobility flow.",
        priority: 3,
        deadline: "",
        estimateMinutes: 30,
        status: "todo",
        createdAt: nowIso,
        completedAt: "",
        orderIndex: 2,
        subtaskIds: [sub4Id],
      },
    },
    subtasks: {
      [sub1Id]: {
        id: sub1Id,
        taskId: task1Id,
        title: "Collect screenshots",
        done: true,
        createdAt: nowIso,
      },
      [sub2Id]: {
        id: sub2Id,
        taskId: task1Id,
        title: "Outline improvements",
        done: false,
        createdAt: nowIso,
      },
      [sub3Id]: {
        id: sub3Id,
        taskId: task4Id,
        title: "Book gym slots",
        done: true,
        createdAt: nowIso,
      },
      [sub4Id]: {
        id: sub4Id,
        taskId: task6Id,
        title: "Find local studio",
        done: false,
        createdAt: nowIso,
      },
    },
    notes: {
      note_1: {
        id: "note_1",
        title: "Weekly check-in",
        body: "Review goals on Friday and plan Monday priorities.",
        createdAt: nowIso,
      },
      note_2: {
        id: "note_2",
        title: "Ideas",
        body: "Polish portfolio hero section and prep a short intro video.",
        createdAt: nowIso,
      },
    },
    noteOrder: ["note_2", "note_1"],
    ui: {
      selectedGoalId: goal1Id,
      showArchived: false,
      page: "goals",
      tab: "all",
      search: "",
      sort: "deadline",
      priorityFilter: "all",
      expandedTaskIds: [],
      dashboardNotes: "",
      activeWidget: "",
    },
  };
}

/* ------------------------------ Renderers ------------------------------- */

function renderApp() {
  if (!mainViewEl) return;
  const page = getPage();
  if (page === "goals") {
    renderGoalsPage();
  } else if (page === "goal") {
    renderGoalPage();
  } else if (page === "tasks") {
    renderTasksPage();
  }
  updateHeaderNav();
}

function renderGoalsPage() {
  const { goals, goalOrder, ui } = state;

  const stats = getDashboardStats();

  const goalCards = goalOrder
    .map((goalId) => goals[goalId])
    .filter((goal) => (ui.showArchived ? true : !goal.archived))
    .map((goal) => {
      const progress = getGoalProgress(goal.id);
      const percent = Math.round(progress * 100);
      return `
        <div class="goal-card" data-action="select-goal" data-goal-id="${goal.id}">
          <div class="goal-title">${escapeHtml(goal.title)}${goal.archived ? " <span class=\"muted\">(Archived)</span>" : ""}</div>
          <div class="progress-bar" aria-hidden="true"><span style="width:${percent}%"></span></div>
          <div class="goal-meta">
            <span>${percent}%</span>
            <span>${goal.targetDate ? formatDisplayDate(goal.targetDate) : "No target"}</span>
          </div>
        </div>
      `;
    })
    .join("");

  mainViewEl.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Goals</h2>
          <p class="muted">Pick a goal to view details.</p>
        </div>
        <label class="toggle">
          <input type="checkbox" ${ui.showArchived ? "checked" : ""} data-action="toggle-archived-inline" />
          <span>Show archived</span>
        </label>
      </div>
      <div class="summary-row">
        <div class="summary-card">
          <div class="summary-title">At a glance</div>
          <div class="summary-metric">${stats.totalGoals}</div>
          <div class="muted">Total goals</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Tasks</div>
          <div class="summary-metric">${stats.activeTasks}</div>
          <div class="muted">${stats.doneTasks} completed</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Today</div>
          <div class="summary-metric">${stats.dueToday}</div>
          <div class="muted">Due today</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Overdue</div>
          <div class="summary-metric">${stats.overdue}</div>
          <div class="muted">Needs attention</div>
        </div>
      </div>
    </section>

    <section class="dashboard-shell">
      <aside class="panel widget-sidebar">
        <div class="panel-head">
          <div>
            <h3>Widgets</h3>
            <p class="muted">Click to open</p>
          </div>
        </div>
        <div class="widget-list">
          <button class="widget-btn ${ui.activeWidget === "notes" ? "active" : ""}" data-action="open-widget" data-widget="notes">
            <span>Notes</span>
            <span class="muted">Quick reminders</span>
          </button>
          <button class="widget-btn ${ui.activeWidget === "weekly" ? "active" : ""}" data-action="open-widget" data-widget="weekly">
            <span>Weekly progress</span>
            <span class="muted">Completed tasks</span>
          </button>
          <button class="widget-btn ${ui.activeWidget === "calendar" ? "active" : ""}" data-action="open-widget" data-widget="calendar">
            <span>Calendar preview</span>
            <span class="muted">Month at a glance</span>
          </button>
          <button class="widget-btn ${ui.activeWidget === "upcoming" ? "active" : ""}" data-action="open-widget" data-widget="upcoming">
            <span>Upcoming focus</span>
            <span class="muted">Next deadlines</span>
          </button>
        </div>
      </aside>

      <div class="panel goals-panel">
        <div class="panel-head">
          <div>
            <h3>Your goals</h3>
            <p class="muted">Tap any goal to open details.</p>
          </div>
          <div class="quick-actions-row">
            <button class="primary-btn" data-action="new-goal-inline">New goal</button>
            <button class="secondary-btn" data-action="view-tasks">Task board</button>
          </div>
        </div>
        <div class="goal-strip">
          ${goalCards || `<div class="empty">No goals yet. Create your first goal.</div>`}
        </div>
      </div>
    </section>

    ${renderWidgetOverlay()}
  `;
}

function renderGoalPage() {
  const goal = state.goals[state.ui.selectedGoalId];
  if (!goal) {
    mainViewEl.innerHTML = `
      <div class="panel empty">
        <h2>No goal selected</h2>
        <p>Go back to the goals list to choose one.</p>
        <button class="secondary-btn" data-action="nav-goals">Back to Goals</button>
      </div>
    `;
    return;
  }

  const progress = getGoalProgress(goal.id);
  const percent = Math.round(progress * 100);
  const overdueCount = countOverdueTasks(goal.id);
  const dueTodayCount = countDueTodayTasks(goal.id);

  mainViewEl.innerHTML = `
    <section class="panel goal-header">
      <div>
        <div class="editable" contenteditable="true" data-placeholder="Goal title" data-action="edit-goal-title" data-goal-id="${goal.id}">${escapeHtml(goal.title)}</div>
        <div class="editable" contenteditable="true" data-placeholder="Add a description..." data-action="edit-goal-desc" data-goal-id="${goal.id}">${escapeHtml(goal.description || "")}</div>
      </div>
      <div>
        <label class="muted">Target date</label>
        <input type="date" data-action="edit-goal-date" data-goal-id="${goal.id}" value="${goal.targetDate || ""}" />
      </div>
      <div>
        <div class="progress-bar" aria-hidden="true"><span style="width:${percent}%"></span></div>
        <div class="stats">
          <span>Progress: ${percent}%</span>
          <span>Overdue: ${overdueCount}</span>
          <span>Due today: ${dueTodayCount}</span>
        </div>
      </div>
      <div class="goal-actions">
        <button class="primary-btn" data-action="add-task" data-goal-id="${goal.id}">Add Task</button>
        <button class="secondary-btn" data-action="view-tasks" data-goal-id="${goal.id}">View Tasks</button>
        <button class="secondary-btn" data-action="toggle-archive" data-goal-id="${goal.id}">${goal.archived ? "Unarchive" : "Archive"}</button>
        <button class="danger-btn" data-action="delete-goal" data-goal-id="${goal.id}">Delete Goal</button>
      </div>
    </section>
  `;
}

function renderTasksPage() {
  const goal = state.goals[state.ui.selectedGoalId];
  if (!goal) {
    mainViewEl.innerHTML = `
      <div class="panel empty">
        <h2>No goal selected</h2>
        <p>Pick a goal first to manage tasks.</p>
        <button class="secondary-btn" data-action="nav-goals">Back to Goals</button>
      </div>
    `;
    return;
  }

  mainViewEl.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>${escapeHtml(goal.title)}</h2>
          <p class="muted">Manage tasks and subtasks.</p>
        </div>
        <button class="primary-btn" data-action="add-task" data-goal-id="${goal.id}">Add Task</button>
      </div>
      ${renderTaskControls()}
      <div class="task-list" id="taskList">
        ${renderTaskList(goal.id)}
      </div>
    </section>
  `;
}

function renderTaskControls() {
  const { tab, search, sort, priorityFilter } = state.ui;
  return `
    <div class="tabs">
      ${["all", "today", "upcoming", "overdue", "done"]
        .map(
          (name) => `
            <button class="tab-btn ${tab === name ? "active" : ""}" data-action="set-tab" data-tab="${name}">
              ${capitalize(name)}
            </button>
          `
        )
        .join("")}
    </div>
    <div class="filters" style="margin-top:12px;">
      <input type="search" placeholder="Search tasks or notes" value="${escapeHtml(search)}" data-action="search-tasks" />
      <select data-action="sort-tasks">
        <option value="deadline" ${sort === "deadline" ? "selected" : ""}>Sort by deadline</option>
        <option value="priority" ${sort === "priority" ? "selected" : ""}>Sort by priority</option>
        <option value="createdAt" ${sort === "createdAt" ? "selected" : ""}>Sort by created</option>
      </select>
      <select data-action="filter-priority">
        <option value="all" ${priorityFilter === "all" ? "selected" : ""}>All priorities</option>
        <option value="high" ${priorityFilter === "high" ? "selected" : ""}>Priority 4-5</option>
        <option value="low" ${priorityFilter === "low" ? "selected" : ""}>Priority 1-3</option>
      </select>
    </div>
  `;
}

function renderTaskList(goalId) {
  const tasks = getFilteredTasks(goalId);
  if (!tasks.length) {
    return `<div class="empty">No tasks match this view.</div>`;
  }

  return tasks
    .map((task) => {
      const statusClass = `status-${task.status}`;
      const subtaskInfo = getSubtaskStats(task.id);
      const subtaskPercent = subtaskInfo.total
        ? Math.round((subtaskInfo.done / subtaskInfo.total) * 100)
        : 0;
      const isExpanded = state.ui.expandedTaskIds.includes(task.id);

      return `
        <div class="task-card" draggable="true" data-task-id="${task.id}">
          <div class="task-top">
            <div>
              <div class="editable task-title" contenteditable="true" data-placeholder="Task title" data-action="edit-task-title" data-task-id="${task.id}">${escapeHtml(task.title)}</div>
              <div class="task-meta">
                <span class="status-pill ${statusClass}">${task.status}</span>
                <span>Priority ${task.priority}</span>
                <span>${task.deadline ? "Due " + formatDisplayDate(task.deadline) : "No deadline"}</span>
                <span>${task.estimateMinutes} min est.</span>
              </div>
            </div>
            <div class="task-actions">
              <button class="expand-btn" data-action="toggle-expand" data-task-id="${task.id}">${isExpanded ? "Collapse" : "Expand"}</button>
              <button class="danger-btn" data-action="delete-task" data-task-id="${task.id}">Delete</button>
            </div>
          </div>

          <div class="subtask-progress">
            ${subtaskInfo.total ? `${subtaskInfo.done}/${subtaskInfo.total} subtasks complete` : "No subtasks"}
          </div>
          <div class="progress-bar" aria-hidden="true" style="margin-top:6px;">
            <span style="width:${subtaskPercent}%"></span>
          </div>

          ${
            isExpanded
              ? `
            <div class="task-controls">
              <label>
                Status
                <select data-action="edit-task-status" data-task-id="${task.id}">
                  ${["todo", "doing", "done"]
                    .map(
                      (status) =>
                        `<option value="${status}" ${task.status === status ? "selected" : ""}>${capitalize(status)}</option>`
                    )
                    .join("")}
                </select>
              </label>
              <label>
                Priority
                <select data-action="edit-task-priority" data-task-id="${task.id}">
                  ${[1, 2, 3, 4, 5]
                    .map(
                      (level) =>
                        `<option value="${level}" ${task.priority === level ? "selected" : ""}>${level}</option>`
                    )
                    .join("")}
                </select>
              </label>
              <label>
                Deadline
                <input type="date" data-action="edit-task-deadline" data-task-id="${task.id}" value="${task.deadline || ""}" />
              </label>
              <label>
                Estimate (minutes)
                <input type="number" min="0" data-action="edit-task-estimate" data-task-id="${task.id}" value="${task.estimateMinutes}" />
              </label>
            </div>
            <div style="margin-top:10px;">
              <div class="muted">Notes</div>
              <div class="editable" contenteditable="true" data-placeholder="Add notes..." data-action="edit-task-notes" data-task-id="${task.id}">${escapeHtml(
                task.notes || ""
              )}</div>
            </div>
            <div style="margin-top:12px;">
              <div class="muted">Subtasks</div>
              <div style="display:flex; gap:8px; margin-top:6px;">
                <input type="text" placeholder="New subtask" data-action="new-subtask-input" data-task-id="${task.id}" />
                <button class="secondary-btn" data-action="add-subtask" data-task-id="${task.id}">Add</button>
              </div>
              <div class="subtask-list">
                ${renderSubtasks(task)}
              </div>
            </div>
          `
              : ""
          }
        </div>
      `;
    })
    .join("");
}

function renderSubtasks(task) {
  if (!task.subtaskIds.length) {
    return `<div class="muted">No subtasks yet.</div>`;
  }
  return task.subtaskIds
    .map((subId) => state.subtasks[subId])
    .filter(Boolean)
    .map(
      (sub) => `
        <div class="subtask" data-subtask-id="${sub.id}">
          <input type="checkbox" data-action="toggle-subtask" data-subtask-id="${sub.id}" ${sub.done ? "checked" : ""} />
          <div class="editable subtask-title" contenteditable="true" data-placeholder="Subtask title" data-action="edit-subtask-title" data-subtask-id="${sub.id}">${escapeHtml(
            sub.title
          )}</div>
          <button class="secondary-btn" data-action="delete-subtask" data-subtask-id="${sub.id}">Delete</button>
        </div>
      `
    )
    .join("");
}

function renderUpcomingItem(task) {
  const goal = state.goals[task.goalId];
  return `
    <div class="mini-item">
      <div>
        <div class="mini-title">${escapeHtml(task.title)}</div>
        <div class="muted">${goal ? escapeHtml(goal.title) : "Unknown goal"}</div>
      </div>
      <span class="pill">${task.deadline ? formatDisplayDate(task.deadline) : "No date"}</span>
    </div>
  `;
}

function renderNoteCard(note) {
  return `
    <div class="note-card" data-note-id="${note.id}">
      <div class="note-card-head">
        <div class="editable note-title" contenteditable="true" data-action="edit-note-title" data-note-id="${note.id}">${escapeHtml(
          note.title
        )}</div>
        <button class="icon-btn small" data-action="delete-note" data-note-id="${note.id}" aria-label="Delete note">✕</button>
      </div>
      <div class="note-date muted">${formatFullDate(note.createdAt)}</div>
      <div class="editable note-body" contenteditable="true" data-placeholder="Write your note..." data-action="edit-note-body" data-note-id="${note.id}">${escapeHtml(
        note.body
      )}</div>
    </div>
  `;
}

function renderWeeklyChart() {
  const weekly = getWeeklyProgress();
  const maxValue = Math.max(1, ...weekly.map((day) => day.count));
  return `
    <div class="chart">
      ${weekly
        .map(
          (day) => `
        <div class="chart-col">
          <div class="chart-bar" style="height:${(day.count / maxValue) * 100}%"></div>
          <div class="chart-label">${day.label}</div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function renderCalendarPreview() {
  const { weeks, monthLabel, todayKey } = getCalendarGrid();
  return `
    <div class="calendar">
      <div class="calendar-head">${monthLabel}</div>
      <div class="calendar-grid calendar-weekdays">
        ${["S", "M", "T", "W", "T", "F", "S"].map((d) => `<span>${d}</span>`).join("")}
      </div>
      <div class="calendar-grid">
        ${weeks
          .flat()
          .map((cell) => {
            if (!cell) return `<span class="calendar-cell muted"></span>`;
            const isToday = cell.key === todayKey ? "today" : "";
            return `<span class="calendar-cell ${isToday}">${cell.day}</span>`;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderWidgetContent(widgetKey) {
  if (widgetKey === "weekly") return renderWeeklyChart();
  if (widgetKey === "notes") {
    const notes = (state.noteOrder || []).map((id) => state.notes[id]).filter(Boolean);
    return `
      <div class="notes-board">
        <div class="note-compose">
          <input id="noteTitleInput" type="text" placeholder="Note title" />
          <textarea id="noteBodyInput" class="notes" rows="5" placeholder="Write your note..."></textarea>
          <button class="primary-btn" data-action="add-note">Save note</button>
        </div>
        <div class="notes-list">
          ${
            notes.length
              ? notes.map(renderNoteCard).join("")
              : `<div class="empty">No notes yet. Add your first note.</div>`
          }
        </div>
      </div>
    `;
  }
  if (widgetKey === "calendar") return renderCalendarPreview();
  if (widgetKey === "upcoming") {
    const upcoming = getUpcomingTasks(8);
    return `
      <div class="mini-list">
        ${upcoming.length ? upcoming.map(renderUpcomingItem).join("") : `<div class="empty">No upcoming tasks.</div>`}
      </div>
    `;
  }
  return `<div class="empty">Select a widget.</div>`;
}

function renderWidgetOverlay() {
  const active = state.ui.activeWidget;
  if (!active) return "";
  const titleMap = {
    notes: "Notes",
    weekly: "Weekly progress",
    calendar: "Calendar preview",
    upcoming: "Upcoming focus",
  };
  return `
    <div class="widget-overlay show">
      <div class="widget-backdrop" data-action="close-widget"></div>
      <div class="widget-panel" role="dialog" aria-modal="true">
        <div class="widget-head">
          <h3>${titleMap[active] || "Widget"}</h3>
          <button class="icon-btn small" data-action="close-widget" aria-label="Close widget">✕</button>
        </div>
        <div class="widget-body">
          ${renderWidgetContent(active)}
        </div>
      </div>
    </div>
  `;
}

/* ----------------------------- Event Handlers ---------------------------- */

function handleClick(e) {
  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;

  const action = actionEl.dataset.action;
  const goalId = actionEl.dataset.goalId;
  const taskId = actionEl.dataset.taskId;
  const subtaskId = actionEl.dataset.subtaskId;

  switch (action) {
    case "select-goal":
      updateState((draft) => {
        draft.ui.selectedGoalId = goalId;
        draft.ui.page = "goal";
      });
      break;
    case "new-goal-inline":
      handleNewGoal();
      break;
    case "add-task":
      handleAddTask(goalId);
      break;
    case "open-widget":
      updateState((draft) => {
        draft.ui.activeWidget = actionEl.dataset.widget || "";
      });
      break;
    case "close-widget":
      updateState((draft) => {
        draft.ui.activeWidget = "";
      });
      break;
    case "add-note":
      handleAddNote();
      break;
    case "delete-note":
      confirmDelete("Delete note", "This will remove the note permanently.", () => {
        updateState((draft) => {
          deleteNote(draft, actionEl.dataset.noteId);
        });
      });
      break;
    case "nav-goals":
      setPage("goals");
      break;
    case "nav-goal":
      if (state.ui.selectedGoalId) setPage("goal");
      break;
    case "nav-tasks":
      if (state.ui.selectedGoalId) setPage("tasks");
      break;
    case "view-tasks":
      if (goalId) {
        updateState((draft) => {
          draft.ui.selectedGoalId = goalId;
          draft.ui.page = "tasks";
        });
      } else if (state.ui.selectedGoalId) {
        setPage("tasks");
      }
      break;
    case "toggle-archive":
      updateState((draft) => {
        const goal = draft.goals[goalId];
        goal.archived = !goal.archived;
      });
      break;
    case "delete-goal":
      confirmDelete("Delete goal", "This will delete all tasks and subtasks.", () => {
        updateState((draft) => {
          deleteGoal(draft, goalId);
        });
        if (getPage() !== "goals") {
          setPage("goals");
        }
      });
      break;
    case "toggle-expand":
      updateState((draft) => {
        const expanded = new Set(draft.ui.expandedTaskIds);
        if (expanded.has(taskId)) {
          expanded.delete(taskId);
        } else {
          expanded.add(taskId);
        }
        draft.ui.expandedTaskIds = Array.from(expanded);
      });
      break;
    case "delete-task":
      confirmDelete("Delete task", "This will remove the task and its subtasks.", () => {
        updateState((draft) => {
          deleteTask(draft, taskId);
        });
      });
      break;
    case "add-subtask":
      handleAddSubtask(taskId);
      break;
    case "delete-subtask":
      updateState((draft) => {
        deleteSubtask(draft, subtaskId);
      });
      break;
    case "set-tab":
      updateState((draft) => {
        draft.ui.tab = actionEl.dataset.tab;
      });
      break;
    default:
      break;
  }
}

function handleChange(e) {
  const action = e.target.dataset.action;
  const goalId = e.target.dataset.goalId;
  const taskId = e.target.dataset.taskId;
  const value = e.target.value;

  switch (action) {
    case "edit-goal-date":
      updateState((draft) => {
        draft.goals[goalId].targetDate = value;
      });
      break;
    case "edit-task-status":
      updateState((draft) => {
        draft.tasks[taskId].status = value;
        if (value === "done") {
          draft.tasks[taskId].completedAt = new Date().toISOString();
        } else {
          draft.tasks[taskId].completedAt = "";
        }
      });
      break;
    case "edit-task-priority":
      updateState((draft) => {
        draft.tasks[taskId].priority = Number(value);
      });
      break;
    case "edit-task-deadline":
      updateState((draft) => {
        draft.tasks[taskId].deadline = value;
      });
      break;
    case "edit-task-estimate":
      updateState((draft) => {
        draft.tasks[taskId].estimateMinutes = Number(value) || 0;
      });
      break;
    case "toggle-subtask":
      updateState((draft) => {
        const subtask = draft.subtasks[e.target.dataset.subtaskId];
        if (subtask) {
          subtask.done = e.target.checked;
        }
      });
      break;
    case "sort-tasks":
      updateState((draft) => {
        draft.ui.sort = value;
      });
      break;
    case "filter-priority":
      updateState((draft) => {
        draft.ui.priorityFilter = value;
      });
      break;
    case "toggle-archived-inline":
      updateState((draft) => {
        draft.ui.showArchived = e.target.checked;
      });
      break;
    default:
      break;
  }
}

function handleInput(e) {
  const action = e.target.dataset.action;
  if (action === "search-tasks") {
    updateState((draft) => {
      draft.ui.search = e.target.value;
    });
  }
}

function handleBlur(e) {
  const action = e.target.dataset.action;
  const goalId = e.target.dataset.goalId;
  const taskId = e.target.dataset.taskId;
  const subtaskId = e.target.dataset.subtaskId;
  const noteId = e.target.dataset.noteId;
  const text = (e.target.textContent || "").trim();

  if (!action) return;

  switch (action) {
    case "edit-goal-title":
      updateState((draft) => {
        const value = enforceNonEmpty(text, draft.goals[goalId].title, "Goal title");
        draft.goals[goalId].title = value;
      });
      break;
    case "edit-goal-desc":
      updateState((draft) => {
        draft.goals[goalId].description = text || "";
      });
      break;
    case "edit-task-title":
      updateState((draft) => {
        const value = enforceNonEmpty(text, draft.tasks[taskId].title, "Task title");
        draft.tasks[taskId].title = value;
      });
      break;
    case "edit-task-notes":
      updateState((draft) => {
        draft.tasks[taskId].notes = text || "";
      });
      break;
    case "edit-subtask-title":
      updateState((draft) => {
        const subtask = draft.subtasks[subtaskId];
        const value = enforceNonEmpty(text, subtask.title, "Subtask title");
        subtask.title = value;
      });
      break;
    case "edit-note-title":
      updateState((draft) => {
        const note = draft.notes[noteId];
        if (!note) return;
        const value = enforceNonEmpty(text, note.title, "Note title");
        note.title = value;
      });
      break;
    case "edit-note-body":
      updateState((draft) => {
        const note = draft.notes[noteId];
        if (!note) return;
        note.body = text || "";
      });
      break;
    default:
      break;
  }
}

function handleKeydown(e) {
  if (e.key === "Enter" && e.target.matches("[contenteditable='true']")) {
    if (e.target.dataset.action === "edit-note-body") return;
    e.preventDefault();
    e.target.blur();
  }
}

function handleFocusIn(e) {
  if (e.target.matches("[contenteditable='true']")) {
    e.target.dataset.prev = (e.target.textContent || "").trim();
  }
}

/* -------------------------- Drag and Drop Logic -------------------------- */

let draggedTaskId = null;

function handleDragStart(e) {
  const card = e.target.closest(".task-card");
  if (!card) return;
  draggedTaskId = card.dataset.taskId;
  card.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  const card = e.target.closest(".task-card");
  if (!card || !draggedTaskId) return;
  e.preventDefault();
  card.classList.add("drag-over");
}

function handleDrop(e) {
  const card = e.target.closest(".task-card");
  if (!card || !draggedTaskId) return;
  e.preventDefault();
  const targetId = card.dataset.taskId;
  if (targetId === draggedTaskId) return;

  updateState((draft) => {
    reorderTasks(draft, draggedTaskId, targetId);
  });
}

function handleDragEnd() {
  const cards = document.querySelectorAll(".task-card");
  cards.forEach((card) => card.classList.remove("dragging", "drag-over"));
  draggedTaskId = null;
}

/* ------------------------------- Actions -------------------------------- */

function handleNewGoal() {
  updateState((draft) => {
    const id = uid("goal");
    const nowIso = new Date().toISOString();
    const newGoal = {
      id,
      title: "New Goal",
      description: "",
      createdAt: nowIso,
      targetDate: "",
      archived: false,
      tasks: [],
      progressMode: "auto",
    };
    draft.goals[id] = newGoal;
    draft.goalOrder.unshift(id);
    draft.ui.selectedGoalId = id;
    draft.ui.page = "goal";
  });
}

function handleAddTask(goalId) {
  const targetGoalId = goalId || state.ui.selectedGoalId;
  if (!targetGoalId || !state.goals[targetGoalId]) return;
  updateState((draft) => {
    const taskId = uid("task");
    const nowIso = new Date().toISOString();
    const goal = draft.goals[targetGoalId];
    const task = {
      id: taskId,
      goalId: targetGoalId,
      title: "New Task",
      notes: "",
      priority: 3,
      deadline: "",
      estimateMinutes: 0,
      status: "todo",
      createdAt: nowIso,
      completedAt: "",
      orderIndex: goal.tasks.length,
      subtaskIds: [],
    };
    draft.tasks[taskId] = task;
    goal.tasks.push(taskId);
    draft.ui.expandedTaskIds = Array.from(new Set([...draft.ui.expandedTaskIds, taskId]));
    draft.ui.page = "tasks";
  });
}

function handleAddSubtask(taskId) {
  const input = document.querySelector(`[data-action="new-subtask-input"][data-task-id="${taskId}"]`);
  if (!input) return;
  const value = input.value.trim();
  if (!value) {
    alert("Subtask title cannot be empty.");
    return;
  }
  updateState((draft) => {
    const subtaskId = uid("sub");
    draft.subtasks[subtaskId] = {
      id: subtaskId,
      taskId,
      title: value,
      done: false,
      createdAt: new Date().toISOString(),
    };
    draft.tasks[taskId].subtaskIds.push(subtaskId);
  });
  input.value = "";
}

function handleAddNote() {
  const titleInput = document.getElementById("noteTitleInput");
  const bodyInput = document.getElementById("noteBodyInput");
  if (!titleInput || !bodyInput) return;
  const titleRaw = titleInput.value.trim();
  const bodyRaw = bodyInput.value.trim();
  if (!titleRaw && !bodyRaw) {
    alert("Note cannot be empty.");
    return;
  }
  const title = titleRaw || "Untitled note";
  updateState((draft) => {
    const noteId = uid("note");
    draft.notes[noteId] = {
      id: noteId,
      title,
      body: bodyRaw,
      createdAt: new Date().toISOString(),
    };
    draft.noteOrder = [noteId, ...(draft.noteOrder || [])];
  });
  titleInput.value = "";
  bodyInput.value = "";
}

function deleteGoal(draft, goalId) {
  const goal = draft.goals[goalId];
  if (!goal) return;
  goal.tasks.forEach((taskId) => deleteTask(draft, taskId));
  delete draft.goals[goalId];
  draft.goalOrder = draft.goalOrder.filter((id) => id !== goalId);
  if (draft.ui.selectedGoalId === goalId) {
    draft.ui.selectedGoalId = draft.goalOrder[0] || null;
  }
}

function deleteTask(draft, taskId) {
  const task = draft.tasks[taskId];
  if (!task) return;
  task.subtaskIds.forEach((subId) => {
    delete draft.subtasks[subId];
  });
  const goal = draft.goals[task.goalId];
  if (goal) {
    goal.tasks = goal.tasks.filter((id) => id !== taskId);
  }
  delete draft.tasks[taskId];
  draft.ui.expandedTaskIds = draft.ui.expandedTaskIds.filter((id) => id !== taskId);
}

function deleteSubtask(draft, subtaskId) {
  const sub = draft.subtasks[subtaskId];
  if (!sub) return;
  const task = draft.tasks[sub.taskId];
  if (task) {
    task.subtaskIds = task.subtaskIds.filter((id) => id !== subtaskId);
  }
  delete draft.subtasks[subtaskId];
}

function deleteNote(draft, noteId) {
  if (!noteId || !draft.notes[noteId]) return;
  delete draft.notes[noteId];
  draft.noteOrder = (draft.noteOrder || []).filter((id) => id !== noteId);
}

function reorderTasks(draft, draggedId, targetId) {
  const goalId = draft.tasks[draggedId].goalId;
  const goal = draft.goals[goalId];
  if (!goal) return;

  const allTasks = goal.tasks.slice().sort((a, b) => draft.tasks[a].orderIndex - draft.tasks[b].orderIndex);
  const visibleIds = Array.from(document.querySelectorAll(".task-card"))
    .map((card) => card.dataset.taskId)
    .filter((id) => draft.tasks[id] && draft.tasks[id].goalId === goalId);

  const draggedIndex = visibleIds.indexOf(draggedId);
  const targetIndex = visibleIds.indexOf(targetId);
  if (draggedIndex === -1 || targetIndex === -1) return;

  visibleIds.splice(draggedIndex, 1);
  visibleIds.splice(targetIndex, 0, draggedId);

  const hiddenIds = allTasks.filter((id) => !visibleIds.includes(id));
  const newOrder = [...visibleIds, ...hiddenIds];

  goal.tasks = newOrder;
  newOrder.forEach((id, idx) => {
    draft.tasks[id].orderIndex = idx;
  });
  draft.ui.sort = "createdAt";
}

/* ------------------------------- Utilities ------------------------------- */

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isToday(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return false;
  const today = stripTime(new Date());
  return date.getTime() === today.getTime();
}

function isOverdue(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return false;
  const today = stripTime(new Date());
  return date.getTime() < today.getTime();
}

function isUpcoming(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return false;
  const today = stripTime(new Date());
  return date.getTime() > today.getTime();
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

function enforceNonEmpty(value, fallback, label) {
  const trimmed = value.trim();
  if (trimmed) return trimmed;
  alert(`${label} cannot be empty.`);
  return fallback;
}

/* --------------------------- Derived Calculations ------------------------ */

function getGoalProgress(goalId) {
  const goal = state.goals[goalId];
  if (!goal || !goal.tasks.length) return 0;

  const taskCompletions = goal.tasks.map((taskId) => {
    const task = state.tasks[taskId];
    if (!task) return 0;
    const subStats = getSubtaskStats(task.id);
    if (subStats.total > 0) {
      return subStats.done / subStats.total;
    }
    return task.status === "done" ? 1 : 0;
  });

  const total = taskCompletions.reduce((sum, val) => sum + val, 0);
  return total / taskCompletions.length;
}

function getSubtaskStats(taskId) {
  const task = state.tasks[taskId];
  if (!task) return { done: 0, total: 0 };
  const subs = task.subtaskIds.map((id) => state.subtasks[id]).filter(Boolean);
  const done = subs.filter((sub) => sub.done).length;
  return { done, total: subs.length };
}

function countOverdueTasks(goalId) {
  const goal = state.goals[goalId];
  if (!goal) return 0;
  return goal.tasks
    .map((id) => state.tasks[id])
    .filter((task) => task && task.status !== "done" && isOverdue(task.deadline))
    .length;
}

function countDueTodayTasks(goalId) {
  const goal = state.goals[goalId];
  if (!goal) return 0;
  return goal.tasks
    .map((id) => state.tasks[id])
    .filter((task) => task && task.status !== "done" && isToday(task.deadline))
    .length;
}

function getFilteredTasks(goalId) {
  const goal = state.goals[goalId];
  if (!goal) return [];

  const searchTerm = state.ui.search.toLowerCase();
  let tasks = goal.tasks
    .map((id) => state.tasks[id])
    .filter(Boolean);

  const tab = state.ui.tab;
  if (tab === "today") {
    tasks = tasks.filter((task) => task.status !== "done" && isToday(task.deadline));
  } else if (tab === "upcoming") {
    tasks = tasks.filter((task) => task.status !== "done" && isUpcoming(task.deadline));
  } else if (tab === "overdue") {
    tasks = tasks.filter((task) => task.status !== "done" && isOverdue(task.deadline));
  } else if (tab === "done") {
    tasks = tasks.filter((task) => task.status === "done");
  }

  if (searchTerm) {
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.notes.toLowerCase().includes(searchTerm)
    );
  }

  if (state.ui.priorityFilter === "high") {
    tasks = tasks.filter((task) => task.priority >= 4);
  } else if (state.ui.priorityFilter === "low") {
    tasks = tasks.filter((task) => task.priority <= 3);
  }

  if (state.ui.sort === "deadline") {
    tasks.sort((a, b) => {
      const aDate = a.deadline ? parseDate(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.deadline ? parseDate(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });
  } else if (state.ui.sort === "priority") {
    tasks.sort((a, b) => b.priority - a.priority);
  } else if (state.ui.sort === "createdAt") {
    tasks.sort((a, b) => {
      const aOrder = Number.isFinite(a.orderIndex) ? a.orderIndex : 0;
      const bOrder = Number.isFinite(b.orderIndex) ? b.orderIndex : 0;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }

  return tasks;
}

function getDashboardStats() {
  const goalIds = Object.keys(state.goals);
  const taskIds = Object.keys(state.tasks);
  const activeTasks = taskIds.map((id) => state.tasks[id]).filter((task) => task && task.status !== "done");
  const doneTasks = taskIds.map((id) => state.tasks[id]).filter((task) => task && task.status === "done");
  const overdue = activeTasks.filter((task) => isOverdue(task.deadline)).length;
  const dueToday = activeTasks.filter((task) => isToday(task.deadline)).length;
  return {
    totalGoals: goalIds.length,
    activeGoals: goalIds.filter((id) => !state.goals[id].archived).length,
    activeTasks: activeTasks.length,
    doneTasks: doneTasks.length,
    overdue,
    dueToday,
  };
}

function getUpcomingTasks(limit = 5) {
  const tasks = Object.values(state.tasks).filter(
    (task) => task && task.status !== "done" && task.deadline
  );
  tasks.sort((a, b) => parseDate(a.deadline) - parseDate(b.deadline));
  return tasks.slice(0, limit);
}

function getWeeklyProgress() {
  const today = stripTime(new Date());
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const dayDate = addDays(today, -i);
    const key = formatDateInput(dayDate);
    const count = Object.values(state.tasks).filter((task) => {
      if (!task || !task.completedAt) return false;
      const completedKey = formatDateInput(new Date(task.completedAt));
      return completedKey === key;
    }).length;
    days.push({
      label: dayDate.toLocaleDateString("en-US", { weekday: "short" }),
      count,
    });
  }
  return days;
}

function getCalendarGrid() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let week = new Array(7).fill(null);
  let dayCounter = 1;

  for (let i = 0; i < startWeekday; i += 1) {
    week[i] = null;
  }
  for (let i = startWeekday; i < 7; i += 1) {
    week[i] = {
      day: dayCounter,
      key: formatDateInput(new Date(year, month, dayCounter)),
    };
    dayCounter += 1;
  }
  weeks.push(week);

  while (dayCounter <= daysInMonth) {
    const nextWeek = new Array(7).fill(null);
    for (let i = 0; i < 7 && dayCounter <= daysInMonth; i += 1) {
      nextWeek[i] = {
        day: dayCounter,
        key: formatDateInput(new Date(year, month, dayCounter)),
      };
      dayCounter += 1;
    }
    weeks.push(nextWeek);
  }

  return {
    monthLabel: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    weeks,
    todayKey: formatDateInput(now),
  };
}

/* ----------------------------- Modal Helpers ----------------------------- */

function confirmDelete(title, message, onConfirm) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalConfirm.textContent = "Delete";
  confirmCallback = onConfirm;
  modalBackdrop.classList.add("show");
  modalBackdrop.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modalBackdrop.classList.remove("show");
  modalBackdrop.setAttribute("aria-hidden", "true");
  confirmCallback = null;
}

/* ------------------------------ Navigation ------------------------------ */

function getPage() {
  return state.ui.page || "goals";
}

function ensureSelectedGoal() {
  if (!state.ui.selectedGoalId && state.goalOrder.length) {
    state.ui.selectedGoalId = state.goalOrder[0];
    saveState();
  }
}

function setPage(page) {
  updateState((draft) => {
    draft.ui.page = page;
  });
}

function updateHeaderNav() {
  if (!navGoals || !navGoal || !navTasks) return;
  const page = getPage();
  navGoals.classList.toggle("active", page === "goals");
  navGoal.classList.toggle("active", page === "goal");
  navTasks.classList.toggle("active", page === "tasks");
  const hasGoal = Boolean(state.ui.selectedGoalId);
  navGoal.disabled = !hasGoal;
  navTasks.disabled = !hasGoal;
}
