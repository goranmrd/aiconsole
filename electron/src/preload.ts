import { IpcMainEvent, IpcRendererEvent } from "electron";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  requestBackendPort: async () => {
    return new Promise((resolve, reject) => {
      const listener = (_event: IpcRendererEvent, port: number) => {
        console.log("Backend at port:", port);
        resolve(port);
        ipcRenderer.removeListener("set-backend-port", listener);
      };
      ipcRenderer.on("set-backend-port", listener);

      const log = (_event: IpcRendererEvent, message: string) => {
        console.log(message);
      };
      ipcRenderer.on("log", log);

      const error = (_event: IpcRendererEvent, message: string) => {
        console.error(message);
      };
      ipcRenderer.on("error", error);

      ipcRenderer.send("request-backend-port");
    });
  },
  openDirectoryPicker: async () => ipcRenderer.invoke("open-dir-picker"),
});
