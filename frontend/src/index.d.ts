export {};

declare global {
  interface Window {
    electron: {
      requestBackendPort: () => Promise<number>;
      openDirectoryPicker: () => Promise<string>;
    };
  }
}
