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

import { notifications } from '@mantine/notifications';
import { cn } from '@/utils/common/cn';

type Notification = {
  title: string;
  message: string;
  variant?: NotificationVariant;
};

type NotificationVariant = 'success' | 'error' | 'info';

const getStyles = (variant: NotificationVariant) => {
  let bodyClassNames = 'pl-4 border-l-[3px]';
  const rootClassNames = 'w-[400px] ml-auto !bg-gray-600 !rounded-lg !p-4 gap-5 !shadow-dark before:!hidden';
  const titleClassNames = '!text-white !font-semibold !text-sm';
  const descriptionClassNames = '!text-gray-300 !font-normal !text-[13px]';
  const closeButtonClassNames =
    '!text-gray-300 hover:!text-white hover:!bg-transparent self-start !h-[16px] !w-[16px]';

  switch (variant) {
    case 'success':
      bodyClassNames = cn(bodyClassNames, 'border-green');
      break;
    case 'error':
      bodyClassNames = cn(bodyClassNames, 'border-red');
      break;
    case 'info':
      bodyClassNames = cn(bodyClassNames, 'border-gray-400');
      break;
  }

  return {
    root: rootClassNames,
    body: bodyClassNames,
    title: titleClassNames,
    description: descriptionClassNames,
    closeButton: closeButtonClassNames,
  };
};

const showNotification = ({ title, message, variant = 'info' }: Notification) => {
  notifications.show({
    title,
    message,
    classNames: { ...getStyles(variant) },
    closeButtonProps: {
      size: 1,
    },
  });
};

export default showNotification;
