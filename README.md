<h2 align="center"><img src="https://github.com/10clouds/aiconsole/assets/135703473/d48b7b40-4b9e-45af-92e4-2abc5a8a40b0" height="64"><br>AIConsole</h2>

![AIConsole_Banner_3](https://github.com/10clouds/aiconsole/assets/135703473/bb3d8bca-c45a-452f-bc98-286546159f70)

<p align="center"><strong>Your AI tools that run on your own device </strong></p> 
<p align="center"><strong>Build and train AI personal assistants that can run code locally to perform any tasks.</strong></p>

AI Console is an AI-powered personal assistant designed to help you with a wide range of tasks. It combines the power of artificial intelligence and natural language processing to provide personalized assistance and streamline your workflows.

## Features

Task Management: AI Console can help you manage your tasks and projects efficiently. It can create, update, and track your to-do lists, set reminders, and provide helpful prompts to keep you on track.

Programming Assistance: Whether you're a beginner or an experienced developer, AI Console can assist you in coding tasks. It can generate code snippets, fix common programming errors, and provide recommendations for improving your code.

Content Creation: Need help with content creation? AI Console has got you covered. It can generate engaging blog post ideas, suggest catchy headlines, and even assist in crafting compelling introductions. With its imaginative voice and storytelling techniques, AI Console can elevate your content creation efforts.

Data Retrieval: Say goodbye to tedious manual data retrieval tasks. AI Console can fetch data from various sources, such as APIs, databases, and web scraping. It can organize and analyze the retrieved data, and present it in a format that suits your needs.

## Installing & Running

```shell
pip install --upgrade aiconsole --pre # (in some environments it must be pip3 instead of pip)
mkdir your_project_dir
cd your_project_dir
export OPENAI_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
aiconsole
```

On a Mac you might be prompted to install developer tools in order to install aiconsole.

If during installation you get errors like:

```
WARNING: The script aiconsole is installed in '/Users/user/Library/Python/3.9/bin' which is not on PATH.
Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.
```

Run aiconsole like this: `/Users/user/Library/Python/3.9/bin/aiconsole` (replace the path with a path that you see in the warnings) instead of `aiconsole`.

In your project directory, aiconsole will create a bunch of working files like standard materials and agents

## Running Development Non-Electron AIConsole

In order to run the non electron development version of AIConsole:

1. To run the standalone backend: `cd backend && poetry install && poetry run aiconsole-dev`
2. To run the standalone frontend: `cd frontend && yarn && yarn dev`

## Buiding the desktop app

1. To run the development version of electron bundle: `cd electron && yarn start`
2. To bundle the desktop app: `cd electron && yarn && yarn make`
3. To publish the desktop app: `cd electron && yarn && yarn publish`

## Editing files manually

Material, Agent and settings files are monitored and automatically loaded, then used as context. You can keep there API manuals, login information, prompts and other contextual information.

You can see examples of materials in the ./preset/materials directory

## Contributing

We welcome contributions from the community to make AI Console even better. If you have any ideas, bug reports, or feature requests, please open an issue on the GitHub repository. Feel free to submit pull requests as well!

You can also visit our [Discord channel](https://discord.gg/5hzqZqP4H5) for a further discussion.

## License

AI Console is open-source software licensed under the [Apache License ver. 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt).

## Links

- [Landing page](https://aiconsole.ai)
- [Discord](https://discord.gg/5hzqZqP4H5)
- [Twitter](https://twitter.com/mcielecki)
