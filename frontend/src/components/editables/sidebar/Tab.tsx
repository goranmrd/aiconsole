import { TabsValues } from '@/types/editables/assetTypes';
import { cn } from '@/utils/common/cn';
import { Tabs, TabsTabProps } from '@mantine/core';

export type ActiveTab = TabsValues | string | null;

interface TabProps extends TabsTabProps {
  value: string;
  activeTab: ActiveTab;
  label: string;
}

export const Tab = ({ value, activeTab, label }: TabProps) => (
  <Tabs.Tab
    value={value}
    className={cn(
      'px-[26px] pt-[10px] pb-[25px] [&:first-letter:] tab-hover font-medium text-[14px] w-1/3 hover:bg-transparent overflow-hidden',
      {
        'text-white after:blur-[15px] after:opacity-20 after:w-[40px] after:h-[30px] after:absolute after:bottom-[-8px] after:z-[99] after:bg-yellow':
          activeTab === value,
      },
    )}
  >
    {label}
  </Tabs.Tab>
);
