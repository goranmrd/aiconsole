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

import { Link } from 'react-router-dom';

import { TopBar } from '@/components/top/TopBar';
import { Plus } from 'lucide-react';
import { useAICStore } from '@/store/AICStore';
import { MaterialTable } from './MaterialTable';

export function MaterialsPage() {
  const materials = useAICStore((state) => state.materials);

  return (
    <div className="App flex flex-col h-screen fixed top-0 left-0 bottom-0 right-0 bg-gray-800/95 text-stone-400">
      <TopBar />

      <Link to="/materials/new" className="absolute bottom-5 right-5">
        <button className="bg-primary  text-black/80 font-bold flex items-center justify-center  rounded-full hover:bg-primary-light">
          <Plus className="h-14 w-14" />
        </button>
      </Link>

      <div className="flex flex-col h-full overflow-y-auto p-12">
      {materials && <MaterialTable materials={materials} />}
      </div>
    </div>
  );
}
