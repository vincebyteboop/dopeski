// Dopeski Macro Tracker — MVP
// Data model:
// goals: { calories, protein, carbs, fat }
// entries: [{ id, name, calories, protein, carbs, fat, timestamp }]

const STORAGE_KEYS = {
  goals: "dopeski_goals",
  entries: "dopeski_entries_" + todayKey(),
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadGoals() {
  const raw = localStorage.getItem(STORAGE_KEYS.goals);
  return raw ? JSON.parse(raw) : { calories: 2400, protein: 180, carbs: 250, fat: 70 };
}

function saveGoals(goals) {
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
}

function loadEntries() {
  const raw = localStorage.getItem(STORAGE_KEYS.entries);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
}

function getTotals(entries) {
  return entries.reduce(
    (totals, e) => ({
      calories: totals.calories + Number(e.calories),
      protein: totals.protein + Number(e.protein),
      carbs: totals.carbs + Number(e.carbs),
      fat: totals.fat + Number(e.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function renderGoalInputs(goals) {
  document.getElementById("goalCalories").value = goals.calories;
  document.getElementById("goalProtein").value = goals.protein;
  document.getElementById("goalCarbs").value = goals.carbs;
  document.getElementById("goalFat").value = goals.fat;
}

function renderProgress(goals, entries) {
  const totals = getTotals(entries);
  const macros = [
    { key: "calories", label: "Calories", color: "var(--accent-2)" },
    { key: "protein", label: "Protein", color: "var(--protein)" },
    { key: "carbs", label: "Carbs", color: "var(--carbs)" },
    { key: "fat", label: "Fat", color: "var(--fat)" },
  ];

  const container = document.getElementById("macroBars");
  container.innerHTML = "";

  macros.forEach((m) => {
    const goalVal = Number(goals[m.key]) || 1;
    const currentVal = totals[m.key];
    const pct = Math.min(100, Math.round((currentVal / goalVal) * 100));

    const row = document.createElement("div");
    row.className = "macro-bar-row";
    row.innerHTML = `
      <div class="macro-bar-label">
        <span>${m.label}</span>
        <span>${currentVal} / ${goalVal}${m.key === "calories" ? "" : "g"}</span>
      </div>
      <div class="macro-bar-track">
        <div class="macro-bar-fill" style="width:${pct}%; background:${m.color};"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderEntries(entries) {
  const list = document.getElementById("entriesList");
  list.innerHTML = "";

  if (entries.length === 0) {
    list.innerHTML = `<li style="justify-content:center; color: var(--muted);">No entries yet today</li>`;
    return;
  }

  entries.forEach((e) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <div>${e.name}</div>
        <div class="entry-macros">${e.calories} kcal · P${e.protein} C${e.carbs} F${e.fat}</div>
      </div>
      <button class="delete-entry" data-id="${e.id}">✕</button>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll(".delete-entry").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      let entries = loadEntries().filter((e) => e.id !== id);
      saveEntries(entries);
      refreshUI();
    });
  });
}

function refreshUI() {
  const goals = loadGoals();
  const entries = loadEntries();
  renderGoalInputs(goals);
  renderProgress(goals, entries);
  renderEntries(entries);
}

document.getElementById("saveGoals").addEventListener("click", () => {
  const goals = {
    calories: Number(document.getElementById("goalCalories").value) || 0,
    protein: Number(document.getElementById("goalProtein").value) || 0,
    carbs: Number(document.getElementById("goalCarbs").value) || 0,
    fat: Number(document.getElementById("goalFat").value) || 0,
  };
  saveGoals(goals);
  refreshUI();
});

document.getElementById("logForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const entry = {
    id: crypto.randomUUID(),
    name: document.getElementById("foodName").value.trim(),
    calories: Number(document.getElementById("foodCalories").value) || 0,
    protein: Number(document.getElementById("foodProtein").value) || 0,
    carbs: Number(document.getElementById("foodCarbs").value) || 0,
    fat: Number(document.getElementById("foodFat").value) || 0,
    timestamp: Date.now(),
  };

  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);

  event.target.reset();
  refreshUI();
});

refreshUI();
