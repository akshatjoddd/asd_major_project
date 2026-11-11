
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("museum", {
    getAppInfo: () => ipcRenderer.invoke("app:getInfo"),

    minimizeWindow: () => ipcRenderer.send("window:minimize"),

    maximizeWindow: () => ipcRenderer.send("window:maximize"),

    closeWindow: () => ipcRenderer.send("window:close"),

    isMaximized: () => ipcRenderer.invoke("window:isMaximized")
});
