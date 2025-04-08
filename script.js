document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const categoryFilter = document.getElementById('categoryFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const statusFilter = document.getElementById('statusFilter');
    const taskCategory = document.getElementById('taskCategory');
    const taskPriority = document.getElementById('taskPriority');
    const taskDueDate = document.getElementById('taskDueDate');
    const totalTasksSpan = document.getElementById('totalTasks');
    const completedTasksSpan = document.getElementById('completedTasks');
    const pendingTasksSpan = document.getElementById('pendingTasks');
    const categoryStats = document.getElementById('categoryStats');
    const priorityStats = document.getElementById('priorityStats');
    const alertMessage = document.getElementById('alertMessage');

    // Alert message system
    const showAlert = (message, type = 'info', duration = 3000) => {
        const icon = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        }[type];

        alertMessage.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        `;
        alertMessage.className = `alert-message ${type} show`;

        // Close button functionality
        const closeBtn = alertMessage.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            alertMessage.classList.remove('show');
        });

        // Auto-close after duration
        if (duration > 0) {
            setTimeout(() => {
                alertMessage.classList.remove('show');
            }, duration);
        }
    };

    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Save tasks to localStorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateStats();
    };

    // Update statistics
    const updateStats = () => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;

        totalTasksSpan.textContent = `Total: ${total}`;
        completedTasksSpan.textContent = `Completed: ${completed}`;
        pendingTasksSpan.textContent = `Pending: ${pending}`;

        // Update category statistics
        const categoryCounts = {};
        const priorityCounts = { high: 0, medium: 0, low: 0 };

        tasks.forEach(task => {
            categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
            priorityCounts[task.priority]++;
        });

        categoryStats.innerHTML = Object.entries(categoryCounts)
            .map(([category, count]) => `
                <div class="stat-item">
                    <span class="stat-label">${category}</span>
                    <span class="stat-value">${count}</span>
                </div>
            `).join('');

        priorityStats.innerHTML = Object.entries(priorityCounts)
            .map(([priority, count]) => `
                <div class="stat-item">
                    <span class="stat-label">${priority}</span>
                    <span class="stat-value">${count}</span>
                </div>
            `).join('');
    };

    // Create task element
    const createTaskElement = (task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority`;
        
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;

        const taskMeta = document.createElement('div');
        taskMeta.className = 'task-meta';
        
        const categoryBadge = document.createElement('span');
        categoryBadge.className = 'task-category';
        categoryBadge.textContent = task.category;

        const dueDate = document.createElement('span');
        dueDate.className = 'task-due-date';
        if (task.dueDate) {
            const date = new Date(task.dueDate);
            dueDate.textContent = `Due: ${date.toLocaleDateString()}`;
        }

        taskMeta.appendChild(categoryBadge);
        taskMeta.appendChild(dueDate);

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        const completeBtn = document.createElement('button');
        completeBtn.className = 'action-btn complete-btn';
        completeBtn.innerHTML = '<i class="fas fa-check"></i>';
        completeBtn.onclick = () => toggleTask(task.id);

        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.onclick = () => editTask(task.id);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => deleteTask(task.id);

        taskActions.appendChild(completeBtn);
        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);

        taskContent.appendChild(taskText);
        taskContent.appendChild(taskActions);

        li.appendChild(taskContent);
        li.appendChild(taskMeta);

        return li;
    };

    // Filter tasks
    const filterTasks = () => {
        const category = categoryFilter.value;
        const priority = priorityFilter.value;
        const status = statusFilter.value;

        return tasks.filter(task => {
            const categoryMatch = category === 'all' || task.category === category;
            const priorityMatch = priority === 'all' || task.priority === priority;
            const statusMatch = status === 'all' || 
                              (status === 'completed' && task.completed) || 
                              (status === 'pending' && !task.completed);

            return categoryMatch && priorityMatch && statusMatch;
        });
    };

    // Render tasks
    const renderTasks = () => {
        taskList.innerHTML = '';
        const filteredTasks = filterTasks();
        filteredTasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    };

    // Add new task
    const addTask = () => {
        const text = taskInput.value.trim();
        if (text) {
            const newTask = {
                id: Date.now(),
                text: text,
                category: taskCategory.value,
                priority: taskPriority.value,
                dueDate: taskDueDate.value,
                completed: false,
                createdAt: new Date().toISOString()
            };
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            taskInput.value = '';
            taskDueDate.value = '';
            showAlert('Task added successfully!', 'success');
        } else {
            showAlert('Please enter a task description', 'warning');
        }
    };

    // Toggle task completion
    const toggleTask = (id) => {
        tasks = tasks.map(task => {
            if (task.id === id) {
                const newStatus = !task.completed;
                showAlert(`Task marked as ${newStatus ? 'completed' : 'pending'}`, 'info');
                return { ...task, completed: newStatus };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    };

    // Edit task
    const editTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const newText = prompt('Edit task:', task.text);
            if (newText && newText.trim()) {
                task.text = newText.trim();
                saveTasks();
                renderTasks();
                showAlert('Task updated successfully!', 'success');
            }
        }
    };

    // Delete task
    const deleteTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            showAlert('Task deleted successfully!', 'error');
        }
    };

    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    categoryFilter.addEventListener('change', renderTasks);
    priorityFilter.addEventListener('change', renderTasks);
    statusFilter.addEventListener('change', renderTasks);

    // Initial render
    renderTasks();
    updateStats();
}); 