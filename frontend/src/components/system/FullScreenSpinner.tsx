import { Spinner } from '../chat/Spinner';


export function FullScreenSpinner() {
  return (
    <div className="text-primary opacity-50 flex items-center justify-center w-screen h-screen ">
      <div className="scale-150">
        <Spinner></Spinner>
      </div>
    </div>
  );
}
