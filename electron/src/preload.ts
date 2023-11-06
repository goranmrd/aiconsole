const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  requestBackendPort: async () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("request-backend-port");
      const listener = (event, port) => {
        console.log("Backend at port:", port);
        resolve(port);
        ipcRenderer.removeListener("set-backend-port", listener);
      };
      ipcRenderer.on("set-backend-port", listener);
    });
  },
  openDirectoryPicker: async () => ipcRenderer.invoke("open-dir-picker"),
});
