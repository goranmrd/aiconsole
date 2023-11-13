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
