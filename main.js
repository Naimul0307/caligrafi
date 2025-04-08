const { app, BrowserWindow } = require('electron');
const path = require('path');
const { server } = require('./server'); // Import the server from server.js

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadURL('http://localhost:3000'); // Load the express app hosted at port 3000
    win.on('closed', () => {
        win = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    // Close the server when the app is closed
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            server.close(() => {
                console.log("Server has been stopped");
            }); // Stop the server
            app.quit();
        }
    });
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
