
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('emptyState');
const themeToggle = document.getElementById('themeToggle');


const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');


const themeLabels = document.querySelectorAll('.theme-label');


let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';


let darkMode = localStorage.getItem('darkMode') === 'true';


function initApp() {
    
    applyTheme();
    
    updateStats();
    renderTasks();
    
    
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    
    themeToggle.addEventListener('change', toggleTheme);
    
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            
            filterBtns.forEach(b => b.classList.remove('active'));
            
            this.classList.add('active');
            
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    });
}


function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateStats();
    
    
    taskInput.value = '';
    taskInput.focus();
}


function renderTasks() {
    
    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }
    
    
    taskList.innerHTML = '';
    
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.setAttribute('data-id', task.id);
        
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${escapeHtml(task.text)}</span>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        taskList.appendChild(taskItem);
    });
    
    
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', toggleTask);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteTask);
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', editTask);
    });
    
    
    document.querySelectorAll('.task-text').forEach(taskText => {
        taskText.addEventListener('dblclick', function() {
            const taskId = parseInt(this.closest('.task-item').getAttribute('data-id'));
            enableTaskEdit(taskId);
        });
    });
}


function toggleTask(e) {
    const taskId = parseInt(e.target.closest('.task-item').getAttribute('data-id'));
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}


function deleteTask(e) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    const taskId = parseInt(e.target.closest('.task-item').getAttribute('data-id'));
    tasks = tasks.filter(t => t.id !== taskId);
    
    saveTasks();
    renderTasks();
    updateStats();
}


function editTask(e) {
    const taskId = parseInt(e.target.closest('.task-item').getAttribute('data-id'));
    enableTaskEdit(taskId);
}


function enableTaskEdit(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
    const taskTextEl = taskItem.querySelector('.task-text');
    
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.className = 'edit-input';
    input.style.cssText = `
        flex: 1;
        padding: 8px;
        font-size: 1.1rem;
        border: 2px solid var(--task-border);
        border-radius: 6px;
        outline: none;
        background-color: var(--input-bg);
        color: var(--text-primary);
    `;
    
    
    taskTextEl.replaceWith(input);
    input.focus();
    input.select();
    
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveTaskEdit(taskId, this.value);
        }
    });
    
    input.addEventListener('blur', function() {
        saveTaskEdit(taskId, this.value);
    });
}


function saveTaskEdit(taskId, newText) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    newText = newText.trim();
    if (newText === '') {
        alert('Task text cannot be empty!');
        renderTasks();
        return;
    }
    
    task.text = newText;
    saveTasks();
    renderTasks();
}


function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}


function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyTheme();
}

function applyTheme() {
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
        themeLabels[0].textContent = 'Light';
        themeLabels[1].textContent = 'Dark';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.checked = false;
        themeLabels[0].textContent = 'Light';
        themeLabels[1].textContent = 'Dark';
    }
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


if (tasks.length === 0) {
    tasks = [
        { id: 1, text: 'Create a to-do list app', completed: true, createdAt: new Date().toISOString() },
        { id: 2, text: 'Learn JavaScript', completed: true, createdAt: new Date().toISOString() },
        { id: 3, text: 'Build a portfolio project', completed: false, createdAt: new Date().toISOString() },
        { id: 4, text: 'Read a programming book', completed: false, createdAt: new Date().toISOString() }
    ];
    saveTasks();
}


document.addEventListener('DOMContentLoaded', initApp);