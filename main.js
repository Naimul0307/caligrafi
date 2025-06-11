const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { server } = require('./server');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: true,
        autoHideMenuBar: true,  
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            enableRemoteModule: false,
            additionalArguments: ['--enable-features=ElectronPrintingAPI']
        },
    });

    win.loadURL('http://localhost:3000');

    win.on('closed', () => {
        win = null;
    });
}



app.whenReady().then(() => {
    
    createWindow();
    const backgroundDir = path.join(__dirname, 'public', 'background');
    if (!fs.existsSync(backgroundDir)) {
        fs.mkdirSync(backgroundDir, { recursive: true });
    }

    const imagesDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }

    ipcMain.on('get-printers', (event) => {
        try {
            const printers = event.sender.getPrinters();
            console.log('📤 Printers from main process:', printers);

            // Log fallback check
            if (!printers || printers.length === 0) {
                console.warn("⚠️ No printers detected by Electron.");
            }

            event.sender.send('printer-list', printers.map(p => p.name));
        } catch (err) {
            console.error("❌ Failed to get printers:", err);
            event.sender.send('printer-list', []);
        }
    });


    ipcMain.on('upload-images', (event, files) => {
        files.forEach(({ buffer, name }) => {
            const filePath = path.join(imagesDir, name);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // remove old
            }
            fs.writeFileSync(filePath, Buffer.from(buffer));
            console.log(`✅ Saved image: ${filePath}`);
        });
    });

    ipcMain.on('upload-background-image', (event, { fileBuffer, fileName }) => {
        const targetPath = path.join(__dirname, 'public', 'background', fileName);

        // Delete existing file with the same name
        if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
            console.log('🗑️ Removed existing file:', targetPath);
        }

        fs.writeFile(targetPath, Buffer.from(fileBuffer), (err) => {
            if (err) {
                console.error('❌ Failed to save image:', err);
                return;
            }

            console.log('✅ Image saved:', targetPath);
            event.sender.send('background-image-saved', fileName);
        });
    });

    // Handle print request
    ipcMain.on('print-image', (event, imageName) => {
        const mainWebContents = BrowserWindow.getFocusedWindow()?.webContents;
        const imageFilePath = path.join(__dirname, 'public', 'photo', imageName);
        if (!fs.existsSync(imageFilePath)) {
            console.log("❌ Image not found:", imageFilePath);
            return;
        }

        // Get settings from localStorage via preload bridge
        mainWebContents.executeJavaScript(`
            localStorage.getItem('selectedPrinter');
        `).then(printerName => {
            mainWebContents.executeJavaScript(`
                localStorage.getItem('printOrientation');
            `).then(printOrientation => {
                const pdfSize = printOrientation === 'portrait' ? [288, 432] : [432, 288];
                const imageSize = printOrientation === 'portrait'
                    ? { width: 1200, height: 1800 }
                    : { width: 1800, height: 1200 };

                const pdfDir = path.join(__dirname, 'public', 'photo', 'PDF');
                if (!fs.existsSync(pdfDir)) {
                    fs.mkdirSync(pdfDir, { recursive: true });
                }

                const outputPdfPath = path.join(pdfDir, `${Date.now()}_print.pdf`);

                sharp(imageFilePath)
                    .resize({ ...imageSize, fit: 'contain', background: 'white' })
                    .jpeg()
                    .toBuffer()
                    .then(buffer => {
                        const PDFDocument = require('pdfkit');
                        const doc = new PDFDocument({
                            size: pdfSize,
                            margin: 0
                        });

                        const stream = fs.createWriteStream(outputPdfPath);
                        doc.pipe(stream);
                        doc.image(buffer, 0, 0, { width: pdfSize[0], height: pdfSize[1] });
                        doc.end();

                        stream.on('finish', () => {
                            const { exec } = require('child_process');
                            const sumatraPath = `"${path.join(__dirname, 'tools', 'SumatraPDF', 'SumatraPDF.exe')}"`;
                            const printCommand = `${sumatraPath} -print-to "${printerName}" "${outputPdfPath}"`;

                            exec(printCommand, (err) => {
                                if (err) {
                                    console.error("❌ Print failed:", err);
                                } else {
                                    console.log("✅ Sent to printer via SumatraPDF");
                                    if (mainWebContents) {
                                        mainWebContents.send('redirect-home');
                                    }
                                }
                            });
                        });
                    })
                    .catch(err => {
                        console.error("❌ Failed to generate PDF:", err);
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
