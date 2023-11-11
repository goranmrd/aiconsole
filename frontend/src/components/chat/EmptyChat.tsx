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

import { getBaseURL } from '@/api/Api';
import { useAICStore } from '@/store/AICStore';
import React from 'react';
import { Link } from 'react-router-dom';

export const EmptyChat = () => {
  const projectName = useAICStore((state) => state.projectName);
  const agents = useAICStore((state) => state.agents);
  const materials = useAICStore((state) => state.materials || []);

  return (
    <section className="flex flex-col items-center justify-center container mx-auto px-6 py-8">
      <h2 className="text-4xl mb-8 text-center font-extrabold mt-20">
        <p className="p-2">Project</p>
        <span className=" text-primary uppercase">{projectName}</span>
      </h2>
      <div className="text-lg font-bold mb-4 text-center  text-secondary uppercase">
        Agents
      </div>
      <div className="flex flex-row gap-2 mb-8">
        {agents
          .filter((a) => a.id !== 'user')
          .map((agent) => (
            <div key={agent.id} className="flex flex-col items-center justify-center">
              <img
                src={`${getBaseURL()}/profile/${agent.id}.jpg`}
                className="filter opacity-75 shadows-lg w-20 h-20 mx-auto rounded-full"
                alt="Logo"
                title={agent.name}
              />
            </div>
          ))}
      </div>
      <Link to="/materials" className="text-lg font-bold mb-4 text-center  text-secondary uppercase hover:text-secondary-light">
        Materials
      </Link>
      <div className="text-center">
        {materials
          .filter((m) => m.status !== 'disabled')
          .map((material, index, arr) => (
            <React.Fragment key={material.id}>
              <Link to={`/materials/${material.id}`} className="inline-block hover:text-secondary">
                {material.name}
              </Link>
              {index < arr.length - 1 && <span className="opacity-50">, </span>}
            </React.Fragment>
          ))}
      </div>
    </section>
  );
};
