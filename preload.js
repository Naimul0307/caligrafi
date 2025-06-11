const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getPrinters: () => {
        console.log('📨 preload: sending get-printers');
        ipcRenderer.send('get-printers');
    },
    onPrinterList: (callback) => {
        ipcRenderer.removeAllListeners('printer-list');
        ipcRenderer.on('printer-list', (event, printers) => {
            console.log('📥 preload: received printer list', printers);
            callback(printers);
        });
    },
    // ✅ Add these two:
    printImage: (imageName) => {
        console.log('🖨️ Sending print-image:', imageName);
        ipcRenderer.send('print-image', imageName);
    },
    onRedirectHome: (callback) => {
        ipcRenderer.on('redirect-home', callback);
    },
    uploadBackgroundImage: (fileBuffer, fileName) => {
        ipcRenderer.send('upload-background-image', { fileBuffer, fileName });
    },

    onImageSaved: (callback) => {
        ipcRenderer.on('background-image-saved', (event, fileName) => {
            callback(fileName);
        });
    },
    uploadImages: (fileBuffersWithNames) => {
        ipcRenderer.send('upload-images', fileBuffersWithNames);
    }
    
});
