const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { server } = require('./server');

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

    win.loadURL('http://localhost:3000');
    win.on('closed', () => {
        win = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.on('print-image', (event, imageName) => {
        console.log("🖨️ Received request to print:", imageName);
        const mainWebContents = BrowserWindow.getFocusedWindow()?.webContents;

        const imageFilePath = path.join(__dirname, 'public', 'photo', imageName);
        console.log("🖼️ Image full path:", imageFilePath);

        if (!fs.existsSync(imageFilePath)) {
            console.log("❌ Image not found:", imageFilePath);
            return;
        }

        const printWindow = new BrowserWindow({
            show: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false, // Disable web security to allow loading local images
            },
        });

        // Use HTTP URL instead of file:// URL
        const imageUrl = `http://localhost:3000/photo/${imageName}`;
        const htmlContent = `
            <html>
            <head>
                <style>
                    @media print {
                        @page { margin: 0; }
                        body {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 100vw;
                            height: 100vh;
                            background: white;
                        }
                        img {
                            max-width: 100%;
                            max-height: 100%;
                            object-fit: contain;
                        }
                    }
                    html, body {
                        margin: 0;
                        padding: 0;
                        width: 100vw;
                        height: 100vh;
                    }
                </style>
            </head>
            <body>
                <img src="${imageUrl}" />
            </body>
            </html>
        `;

        // Add a small delay to ensure the print window is ready
        setTimeout(() => {
            printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
        }, 300);

        printWindow.webContents.on('did-finish-load', () => {
            printWindow.webContents.executeJavaScript(`
                new Promise(resolve => {
                    const img = document.querySelector('img');
                    if (!img) return resolve(false);
                    if (img.complete) return resolve(true);
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                });
            `).then((imageLoaded) => {
                if (!imageLoaded) {
                    console.log("❌ Image failed to load in print window.");
                    printWindow.close();
                    return;
                }

                printWindow.webContents.print({
                    silent: false, // Set to false to show the print dialog
                    printBackground: true,
                }, (success, failureReason) => {
                    if (!success) {
                        console.log('❌ Print failed:', failureReason);
                    } else {
                        console.log('✅ Printed after image load!');
                        if (mainWebContents) {
                            mainWebContents.send('redirect-home');
                        }
                    }
                    printWindow.close();
                });
            });
        });
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            server.close(() => {
                console.log("Server has been stopped");
            });
            app.quit();
        }
    });
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
