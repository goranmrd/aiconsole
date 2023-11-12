export function convertNameToId(name: string) {
  //to lower
  name = name.toLowerCase() || '';

  //replace white space with underscore
  name = name.replace(/\s/g, '_');

  //remove special characters
  name = name.replace(/[^a-zA-Z0-9_]/g, '');

  //remove duplicate underscores
  name = name.replace(/_+/g, '_');

  //remove leading and trailing underscores
  name = name.replace(/^_+|_+$/g, '');

  return name;
}
