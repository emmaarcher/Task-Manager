const form = document.querySelector(".getTasks");
const taskInput = form.querySelector("input");
const activeList = document.querySelector(".listTasks");
const completedList = document.querySelector(".completedTasks");
const activeCount = document.querySelector(".task-count");
const completedCount = document.querySelector(".completed-count");

let tasks = readTasks();
renderTasks();

function readTasks() {
    try {
        const storedTasks = JSON.parse(localStorage.getItem("tasks"));
        return Array.isArray(storedTasks)
            ? storedTasks
                .filter(taskObj => taskObj && typeof taskObj.text === "string")
                .map(taskObj => ({
                    text: taskObj.text,
                    done: taskObj.done === true || taskObj.done === "true" || taskObj.completed === true,
                    priority: taskObj.priority === true || taskObj.priority === "true"
                }))
            : [];
    } catch {
        return [];
    }
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
    activeList.replaceChildren();
    completedList.replaceChildren();

    const activeTasks = tasks
        .filter(taskObj => !taskObj.done)
        .sort((first, second) => Number(second.priority) - Number(first.priority));
    const completedTasks = tasks.filter(taskObj => taskObj.done);

    activeTasks.forEach(taskObj => activeList.appendChild(createTaskElement(taskObj)));
    completedTasks.forEach(taskObj => completedList.appendChild(createTaskElement(taskObj)));

    activeCount.textContent = activeTasks.length;
    completedCount.textContent = completedTasks.length;
    activeList.classList.toggle("is-empty", activeTasks.length === 0);
    completedList.classList.toggle("is-empty", completedTasks.length === 0);
}

function createTaskElement(taskObj) {
    const item = document.createElement("li");
    item.className = taskObj.priority && !taskObj.done ? "priority-task" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(taskObj.done);
    checkbox.setAttribute("aria-label", `Mark ${taskObj.text} as complete`);
    checkbox.addEventListener("change", () => {
        taskObj.done = checkbox.checked;
        saveTasks();
        renderTasks();
    });

    const text = document.createElement("span");
    text.textContent = taskObj.text;

    const priorityButton = document.createElement("button");
    priorityButton.className = "priority-button";
    priorityButton.type = "button";
    priorityButton.textContent = taskObj.priority ? "★" : "☆";
    priorityButton.setAttribute("aria-label", taskObj.priority ? "Remove priority" : "Mark as priority");
    priorityButton.title = taskObj.priority ? "Remove priority" : "Mark as priority";
    priorityButton.setAttribute("aria-pressed", String(Boolean(taskObj.priority)));
    priorityButton.hidden = Boolean(taskObj.done);
    priorityButton.addEventListener("click", () => {
        taskObj.priority = !taskObj.priority;
        saveTasks();
        renderTasks();
    });

    const removeButton = document.createElement("button");
    removeButton.className = "delete-button";
    removeButton.type = "button";
    removeButton.textContent = "Delete";
    removeButton.addEventListener("click", () => {
        tasks = tasks.filter(candidate => candidate !== taskObj);
        saveTasks();
        renderTasks();
    });

    item.append(checkbox, text, priorityButton, removeButton);
    return item;
}

form.addEventListener("submit", event => {
    event.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    tasks.push({ text, done: false, priority: false });
    saveTasks();
    renderTasks();
    form.reset();
    taskInput.focus();
});