import { useEffect, useState } from 'react';
import { MaterialInfo } from '../store/types';
import { Api } from '../api/Api';
import { Link } from 'react-router-dom';
import { TopBar } from './TopBar';
import { PlusSmallIcon } from '@heroicons/react/24/outline';

export default function MaterailsView() {
  const [materials, setMaterials] = useState<MaterialInfo[]>();

  useEffect(() => {
    Api.getMaterials().then((materials) => {
      setMaterials(materials);
    });
  }, []);

  return (
    <div className="App flex flex-col h-screen fixed top-0 left-0 bottom-0 right-0 bg-gray-800/95 text-stone-400">
      <TopBar />

      <Link to="/materials/new" className='absolute bottom-5 right-5' >
          <button className="bg-primary  text-black/80 font-bold flex items-center justify-center  rounded-full hover:bg-primary-light">
            <PlusSmallIcon className="h-16 w-16" />
          </button>
        </Link>

      <div className="flex flex-row h-full overflow-y-auto">
        <div className="flex flex-col p-6 gap-4">
          {materials &&
            materials.map((material) => (
              <Link to={`/materials/${material.id}`} key={material.id}>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <img
                      src={`/favicon.svg`}
                      className="h-4 w-4 cursor-pointer filter"
                    />
                    <span className="font-bold">{material.id}</span> -{' '}
                    <span className="text-sm">{material.usage}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center"></div>
              </Link>
            ))}
        </div>
        
      </div>
    </div>
  );
}
