const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;
let mainWindow;
let addWindow;

// Listen for app to be ready

app.on("ready", function () {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });
  // Load html into window
  mainWindow.loadURL(
    url.format({
      pathname: path.join("public", "mainWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  // Quit all windows when closed
  mainWindow.on("closed", function () {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert Menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle createAddWindow
function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add Shoppindg List Item",
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });
  // Load html into window
  addWindow.loadURL(
    url.format({
      pathname: path.join("public", "addWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  // Garbage Collection Handle
  addWindow.on("close", function () {
    addWindow = null;
  });
}

// Catch item:add
ipcMain.on("item:add", function (e, item) {
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Clear Item",
        click() {
          mainWindow.webContents.send("item:clear");
        },
      },
      {
        label: "Quit",
        click() {
          app.quit();
        },
      },
    ],
  },
];

// If mac, add empty obj to menu
if (process.platform == "darwin") {
  mainMenuTemplate.unshift({});
}

// Add Dev toll if not prod
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Dev Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: "reload",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+R",
      },
    ],
  });
}
