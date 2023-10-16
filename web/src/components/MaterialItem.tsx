import { Link } from 'react-router-dom';

interface MaterialItemProps {
  id: string;
  usage: string;
}

export function MaterialItem({ id, usage }: MaterialItemProps) {
  return (
    <Link to={`/materials/${id}`} key={id}>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <img src={`/favicon.svg`} className="h-4 w-4 cursor-pointer filter" />
          <span className="font-bold">{id}</span> -{' '}
          <span className="text-sm">{usage}</span>
        </div>
      </div>
      <div className="flex gap-2 items-center"></div>
    </Link>
  );
}
