const API_URL = '';

document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  fetchTasks();

  const form = document.getElementById('task-form');
  form.addEventListener('submit', handleCreateTask);

  // Periodic health check every 10 seconds
  setInterval(checkHealth, 10000);
});

async function checkHealth() {
  const statusEl = document.getElementById('system-status');
  const dotEl = statusEl.querySelector('.status-dot');
  const textEl = document.getElementById('status-text');

  try {
    const res = await fetch('/health');
    const data = await res.json();

    dotEl.classList.remove('pulsing');
    if (res.ok && data.status === 'UP') {
      dotEl.className = 'status-dot online';
      textEl.textContent = 'System Healthy (DB Connected)';
    } else {
      dotEl.className = 'status-dot offline';
      textEl.textContent = `DB Error: ${data.database || 'Unreachable'}`;
    }
  } catch (err) {
    dotEl.className = 'status-dot offline';
    textEl.textContent = 'Backend Service Offline';
  }
}

async function fetchTasks() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    console.error(err);
  }
}

function renderTasks(tasks) {
  const lists = {
    todo: document.getElementById('list-todo'),
    'in-progress': document.getElementById('list-in-progress'),
    done: document.getElementById('list-done'),
  };

  const counts = { todo: 0, 'in-progress': 0, done: 0 };

  // Clear lists
  Object.values(lists).forEach(el => (el.innerHTML = ''));

  tasks.forEach(task => {
    const status = task.status || 'todo';
    if (counts[status] !== undefined) counts[status]++;

    const card = document.createElement('div');
    card.className = 'task-item';
    card.innerHTML = `
      <h4>${escapeHtml(task.title)}</h4>
      ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
      <div class="task-actions">
        <select class="status-select" onchange="updateTaskStatus(${task.id}, this.value)">
          <option value="todo" ${status === 'todo' ? 'selected' : ''}>To Do</option>
          <option value="in-progress" ${status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="done" ${status === 'done' ? 'selected' : ''}>Done</option>
        </select>
        <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    if (lists[status]) {
      lists[status].appendChild(card);
    }
  });

  // Update counters
  document.getElementById('count-todo').textContent = counts['todo'];
  document.getElementById('count-in-progress').textContent = counts['in-progress'];
  document.getElementById('count-done').textContent = counts['done'];
}

async function handleCreateTask(e) {
  e.preventDefault();
  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-desc');
  const statusInput = document.getElementById('task-status');

  const newTask = {
    title: titleInput.value,
    description: descInput.value,
    status: statusInput.value,
  };

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });

    if (!res.ok) throw new Error('Failed to create task');

    titleInput.value = '';
    descInput.value = '';
    statusInput.value = 'todo';

    fetchTasks();
  } catch (err) {
    alert(err.message);
  }
}

async function updateTaskStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error('Failed to update task');
    fetchTasks();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete task');
    fetchTasks();
  } catch (err) {
    alert(err.message);
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
