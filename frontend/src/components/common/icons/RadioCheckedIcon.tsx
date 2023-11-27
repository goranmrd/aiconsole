interface IconProps {
  classNames?: string;
}

export const RadioCheckedIcon = ({ classNames }: IconProps) => (
  <svg
    className={classNames}
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="0.65957" y="0.6" width="14.8" height="14.8" rx="7.4" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="8" cy="7.84766" r="3" fill="currentColor" />
  </svg>
);
