# The AIConsole Project
#
# Copyright 2023 10Clouds
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
from pathlib import Path

license_python = """
# The AIConsole Project
#
# Copyright 2023 10Clouds
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
""".strip()

license_ts = """
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
""".strip()

for root, dirs, files in os.walk("."):
    for file in files:
        file_path = Path(root) / file

        # check ignore file patterns
        if (
            "node_modules" in str(file_path)
            or "electron/python" in str(file_path)
            or "backend/aiconsole/core/code_running/code_interpreters" in str(file_path)
        ):
            continue

        if file_path.suffix in [".tsx", ".ts", ".py"]:
            with open(file_path, "r+") as f:
                content = f.read()

                if file_path.suffix == ".tsx" or file_path.suffix == ".ts":
                    choosen_licence = license_ts
                else:
                    choosen_licence = license_python

                if not content.startswith(choosen_licence):
                    print(f"Adding licence to {file_path}")
                    f.seek(0)
                    f.write(choosen_licence + "\n\n" + content)
