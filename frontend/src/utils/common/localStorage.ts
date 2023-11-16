type LocalStorageFields = 'isAssetChanged'; // this can be union of type in the future

/**
 *
 * Helper that returns typed getter & setter for localstorage
 * @param key (string) The localstorage key to which the getter and setter are connected
 */
export function localStorageTyped<T>(key: LocalStorageFields) {
  function setItem(item: T) {
    localStorage.setItem(key, JSON.stringify(item));
  }
  function getItem() {
    const dataString = localStorage.getItem(key);
    if (!dataString) return null;

    return JSON.parse(dataString) as T;
  }
  function removeItem() {
    localStorage.removeItem(key);
  }

  return { setItem, getItem, removeItem };
}
