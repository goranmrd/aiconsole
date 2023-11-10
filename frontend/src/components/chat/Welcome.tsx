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

export const Welcome = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <section className="container mx-auto px-6 py-8">
        <img
          src="favicon.svg"
          className="filter opacity-75 shadows-lg w-20 h-20 mx-auto m-4"
          alt="Logo"
        />
        <h2 className="text-4xl mb-4 text-center font-extrabold">
          Welcome to <span className=" text-primary">AIConsole!</span>
        </h2>
        <p className="text-xl mb-12  text-center">
          The platform to build your own AI universe.
        </p>
      </section>
    </div>
  );
};
