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

    const outputPdfPath = path.join(__dirname, 'public', 'photo', `${Date.now()}_print.pdf`);

    sharp(imageFilePath)
        .resize({ width: 1800, height: 1200, fit: 'contain', background: 'white' }) // 6x4 inch @ 300dpi
        .jpeg()
        .toBuffer()
        .then(buffer => {
            const pdf = require('pdfkit');
            const doc = new pdf({
                size: [432, 288], // 6x4 inch in points (72 points per inch)
                margin: 0
            });

            const stream = fs.createWriteStream(outputPdfPath);
            doc.pipe(stream);
            doc.image(buffer, 0, 0, { width: 432, height: 288 }); // fill the page
            doc.end();

            stream.on('finish', () => {
                console.log("📄 PDF saved to:", outputPdfPath);

                // SUMATRA silent print command
                const { exec } = require('child_process');
                const sumatraPath = `"${path.join(__dirname, 'tools', 'SumatraPDF', 'SumatraPDF.exe')}"`;                // 🔁 Update this path!
                const printCommand = `${sumatraPath} -print-to "HiTi P525L" "${outputPdfPath}"`;

                exec(printCommand, (err, stdout, stderr) => {
                    if (err) {
                        console.error("❌ Print failed via SumatraPDF:", err);
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
    // ipcMain.on('print-image', (event, imageName) => {
    //     console.log("🖨️ Received request to print:", imageName);
    //     const mainWebContents = BrowserWindow.getFocusedWindow()?.webContents;

    //     const imageFilePath = path.join(__dirname, 'public', 'photo', imageName);
    //     console.log("🖼️ Image full path:", imageFilePath);

    //     if (!fs.existsSync(imageFilePath)) {
    //         console.log("❌ Image not found:", imageFilePath);
    //         return;
    //     }

    //     // Use sharp to get image dimensions
    //     sharp(imageFilePath)
    //         .metadata()
    //         .then(metadata => {
    //             const imageWidth = metadata.width;  // 1800px
    //             const imageHeight = metadata.height; // 1200px

    //             // Define the desired print page size (in inches)
    //             const pageWidthIn = 6;  // 6 inches width
    //             const pageHeightIn = 4; // 4 inches height
    //             const dpi = 300;  // Target 300 DPI for printing

    //             // Convert inches to pixels at 300 DPI
    //             const pageWidthPx = pageWidthIn * dpi;  // 1800px
    //             const pageHeightPx = pageHeightIn * dpi; // 1200px

    //             // Scaling factor for 96 DPI images to 300 DPI
    //             const imgWidth = imageWidth;
    //             const imgHeight = imageHeight;
                

    //             // Limit the image to fit within the page size (6x4)
    //             const maxWidth = pageWidthPx;
    //             const maxHeight = pageHeightPx;

    //             const scaledWidth = Math.min(imgWidth, maxWidth);  // Ensures the image doesn't overflow
    //             const scaledHeight = Math.min(imgHeight, maxHeight);

    //             // Generate image base64 data
    //             const imageBase64 = fs.readFileSync(imageFilePath, { encoding: 'base64' });
    //             const mimeType = 'image/jpeg';
    //             const imageUrl = `data:${mimeType};base64,${imageBase64}`;

    //             // Print content HTML (adjusted for scaling)
    //             const htmlContent = `
    //             <html>
    //             <head>
    //               <style>
    //                 @media print {
    //                   @page {
    //                     size: 6in 4in; /* Exactly 6x4 inch paper */
    //                     margin: 0;
    //                   }
    //                   body {
    //                     margin: 0;
    //                     padding: 0;
    //                     width: 6in;
    //                     height: 4in;
    //                     display: flex;
    //                     justify-content: center;
    //                     align-items: center;
    //                     background: white;
    //                   }
    //                   img {
    //                     width: 6in;
    //                     height: 4in;
    //                     object-fit: contain;
    //                   }
    //                 }
                
    //                 html, body {
    //                   margin: 0;
    //                   padding: 0;
    //                   width: 100%;
    //                   height: 100%;
    //                 }
    //               </style>
    //             </head>
    //             <body>
    //             <img src="${imageUrl}" />

    //             </body>
    //             </html>
    //             `;
                
    //             const printWindow = new BrowserWindow({
    //                 show: true,
    //                 webPreferences: {
    //                     nodeIntegration: true,
    //                     contextIsolation: false,
    //                     webSecurity: false,
    //                 },
    //             });
    //             printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    //             printWindow.webContents.on('did-finish-load', () => {
    //                 printWindow.webContents.executeJavaScript(`
    //                     new Promise(resolve => {
    //                         const img = document.querySelector('img');
    //                         if (!img) return resolve(false);
    //                         if (img.complete) return resolve(true);
    //                         img.onload = () => resolve(true);
    //                         img.onerror = () => resolve(false);
    //                     });
    //                 `).then((imageLoaded) => {
    //                     if (!imageLoaded) {
    //                         console.log("❌ Image failed to load in print window.");
    //                         printWindow.close();
    //                         return;
    //                     }
                
    //                     // Add a small delay before printing to ensure everything is loaded in silent mode
    //                     setTimeout(() => {
    //                         printWindow.webContents.print({
    //                             silent: true,  // Now using silent mode
    //                             printBackground: true,  // Ensure background is printed
    //                             deviceName: 'HiTi P525L',  // Ensure the device name is correct
    //                         }, (success, failureReason) => {
    //                             if (!success) {
    //                                 console.log('❌ Print failed:', failureReason);
    //                             } else {
    //                                 console.log('✅ Printed successfully!');
    //                                 if (mainWebContents) {
    //                                     mainWebContents.send('redirect-home');
    //                                 }
    //                             }
    //                             printWindow.close();
    //                         });
    //                     }, 1000);  // Adjust the delay as needed (e.g., 500 ms)
    //                 });
    //             });
    //         })
    //         .catch(err => {
    //             console.error("❌ Error getting image size:", err);
    //         });
    // });

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
