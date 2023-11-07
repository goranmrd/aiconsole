import { Plus } from 'lucide-react';
import { MouseEvent } from 'react';

interface SidebarTabHeaderProps {
  title: string;
  onClick: (event: MouseEvent) => void;
}

export const SidebarTabHeader = ({ title, onClick }: SidebarTabHeaderProps) => (
  <div className="flex justify-between items-center py-[15px] mb-[15px] mr-[30px]">
    <p className="text-[16px] font-extrabold">{title}</p>
    <Plus
      onClick={onClick}
      className="cursor-pointer hover:bg-gray-600 p-[5px] w-[30px] h-[30px] rounded-full"
    />
  </div>
);
