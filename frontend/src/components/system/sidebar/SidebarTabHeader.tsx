import { cn } from '@/utils/styles';
import { Plus } from 'lucide-react';
import { Link, useMatch } from 'react-router-dom';

interface SidebarTabHeaderProps {
  title: string;
  linkTo: string;
}

export const SidebarTabHeader = ({ title, linkTo }: SidebarTabHeaderProps) => {
  const isActive = useMatch(linkTo);

  return (
    <div className="flex justify-between items-center py-[15px] mb-[15px] mr-[30px]">
      <p className="text-[16px] font-extrabold">{title}</p>
      <Link to={linkTo} className={cn("cursor-pointer hover:bg-gray-600 rounded-full border border-white/0", isActive && 'border-opacity-100 border-secondary-dark/25')}>
        <Plus className={"p-[5px] w-[30px] h-[30px] "}  />
      </Link>
    </div>
  );
};
