// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
