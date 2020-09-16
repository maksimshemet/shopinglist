const { ipcMain } = require("electron");
const electron = require("electron");
const { ipcRenderer } = electron;
const serialize = require("form-serialize");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db/db.json");

// additional menu; item add form; set eventListener
// function AdditionalWindow() {
//   const formEl = document.querySelector("form#item");
//   if (formEl) formEl.addEventListener("submit", submitForm);

//   function submitForm(e) {
//     e.preventDefault();
//     const item = document.querySelector("#item").value;
//     ipcRenderer.send("item:add", item);
//   }
// }

//main menu; add/remove/clear item(s); set event listener for Task form data; send it to main.js
function MainWindow() {
  //Task add func; new part start
  const formEl = document.querySelector("form#newTaskForm");
  if (formEl) {
    formEl.addEventListener("submit", submitForm);
    formEl.addEventListener("reset", () => {
      collapseItem.classList.remove("show");
      formEl.reset();
    });
  }

  function submitForm(e) {
    e.preventDefault();
    const TaskData = document.querySelector("form#newTaskForm");
    const task = serialize(TaskData, { hash: true });
    const collapseItem = document.getElementById("collapseItem");

    ipcRenderer.send("task:add", task);

    collapseItem.classList.remove("show");
    formEl.reset();
  }
  const task = document.querySelector("div#task-list");
  if (task)
    task.addEventListener("dblclick", (e) => {
      if (
        e.path[1].className ===
        "list-group-item list-group-item-action text-dark"
      ) {
        ipcRenderer.send("task:del", e.path[1].id);
        e.path[1].remove();
      } else {
        ipcRenderer.send("task:del", e.path[0].id);
        e.path[0].remove();
      }
    });
}

function taskContainer(taskID, title, description, priority, finishAt) {
  const list = document.querySelector("div#task-list");
  const taskElementA = document.createElement("a");
  const taskElementDiv = document.createElement("div");
  const taskElementH5 = document.createElement("h5");
  const taskElementSmall1 = document.createElement("small");
  const taskElementP = document.createElement("p");
  const taskElementSmall2 = document.createElement("small");

  taskElementA.id = taskID;

  taskElementH5.className = "font-weight-bold text-success";
  taskElementSmall1.className = "font-weight-bold text-danger";
  taskElementSmall2.className = "text-success font-weight-bold";
  taskElementP.className = "mb-1 text-success";
  taskElementA.className = "list-group-item list-group-item-action text-dark";
  taskElementDiv.className = "d-flex w-100 justify-content-between";

  taskElementH5.innerText = title;
  taskElementP.innerText = description;
  taskElementSmall2.innerText = priority;
  taskElementSmall1.innerText = finishAt;

  taskElementDiv.appendChild(taskElementH5);
  taskElementDiv.appendChild(taskElementSmall1);
  taskElementA.appendChild(taskElementDiv);
  taskElementA.appendChild(taskElementP);
  taskElementA.appendChild(taskElementSmall2);

  list.appendChild(taskElementA);
}

function setTask() {
  ipcRenderer.on("task:add", function (e, task, taskId) {
    const info = document.querySelector("a#task-3");
    if (info) info.remove();

    taskContainer(
      "task-id-" + taskId,
      task.title,
      task.description,
      task.priority,
      task.finishAt
    );
  });
}

//new part finish
window.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("task:sync");
  //AdditionalWindow();
  MainWindow();
  setTask();
});
