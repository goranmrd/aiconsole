import { cn } from '@/utils/common/cn';

export function QuestionMarkIcon({ className }: { className?: string }) {
  return <div className={cn('text-2xl flex items-center justify-center', className)}>?</div>;
}
