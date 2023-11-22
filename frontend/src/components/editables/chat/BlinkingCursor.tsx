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

import { useEffect, useState } from 'react';

export const BlinkingCursor = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible((v) => !v);
    }, 500);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <svg
      className={`inline-block ${visible ? '' : 'invisible'}`}
      width="8" // This can be adjusted to match the width of your cursor
      height="12" // This can be adjusted to match the height of your cursor
      viewBox="0 0 8 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="currentColor" x="0" y="0" width="100%" height="100%" />
    </svg>
  );
};
