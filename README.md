<h2 align="center"><img src="https://github.com/10clouds/aiconsole/assets/135703473/d48b7b40-4b9e-45af-92e4-2abc5a8a40b0" height="64"><br>AIConsole</h2>

![AIConsole_Banner_3](https://github.com/10clouds/aiconsole/assets/135703473/bb3d8bca-c45a-452f-bc98-286546159f70)

<p align="center"><strong>Your AI tools that run on your own device </strong></p> 
<p align="center"><strong>Open Source Desktop Alternative to OpenAI GPTs</strong></p>

AI Console is an AI-powered personal assistant designed to help you with a wide range of tasks. It combines the power of artificial intelligence and natural language processing to provide personalized assistance and streamline your workflows.

# Features

### Run Code Locally
Run it locally; the console can perform all the tasks that your machine is capable of executing.

### Improves with Use
Describe in plain text how to perform a given task once, and thereafter AIConsole will know how to execute it indefinitely.

### Utilize Your Notes for AI Training
Employ your notes to instruct the AI in completing and automating tasks.

### Better than Vector Databases
For each step of your tasks, leverage a precise, efficient, and automated multi-agent Retrieval-Augmented Generation (RAG) system that is on par with expert prompt engineering.

### Completely Open Sourced
This software does not transmit any data to any parties other than the LLM APIs – and you can confirm this for yourself.

### Share Your Tools with the Community
Develop and share your domain-specific AI tools, for instance, on platforms like GitHub or Discord.


# Downloading and Installing

Select the version suitable for your operating system:

- [Windows](https://github.com/10clouds/aiconsole/releases)
- [macOS (Intel)](https://github.com/10clouds/aiconsole/releases)
- [macOS (ARM)](https://github.com/10clouds/aiconsole/releases)
- [Linux](https://github.com/10clouds/aiconsole/releases)

# Embedding the AIConsole backend in your app

If you want to develop something on top of the aiconsole backend, you may install the backend part using:

`pip install aiconsole`

# Running Development Non-Electron AIConsole

In order to run the non electron development version of AIConsole:

1. To run the standalone backend: `cd backend && poetry install && poetry run dev`
2. To run the standalone frontend: `cd frontend && yarn && yarn dev`

# Buiding the desktop app

1. To run the development version of electron bundle: `cd electron && yarn dev`
2. To bundle the desktop app: `cd electron && yarn && yarn make`
3. To publish the desktop app: `cd electron && yarn && yarn publish`

# Editing files manually

Material, Agent and settings files are monitored and automatically loaded, then used as context. You can keep there API manuals, login information, prompts and other contextual information.

You can see examples of materials in the ./preset/materials directory

# Contributing

We welcome contributions from the community to make AI Console even better. If you have any ideas, bug reports, or feature requests, please open an issue on the GitHub repository. Feel free to submit pull requests as well!

You can also visit our [Discord channel](https://discord.gg/5hzqZqP4H5) for a further discussion.

# Roadmap

- [x] Initial PIP release
- [x] Switch to GPT-4 Turbo
- [ ] Release of the desktop app for MacOS, Windows and Linux
- [ ] Integrating GPT-V
- [ ] Integrating Dalle-3
- [ ] IDE like experience
- [ ] Handling of non-text materials and files (pdfs etc)
- [ ] Better materials and integrations with various tools
- [ ] Alternative interface to chat for working on a body of text
- [ ] Ability to run on Azure OpenAI Models
- [ ] Ability to run on other models than OpenAI
- [ ] Using AI to modify materials
- [ ] Generative UI
- [ ] Web Hosted SaaS like version

# License

AI Console is open-source software licensed under the [Apache License ver. 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt).

# Links

- [Landing page](https://aiconsole.ai)
- [Discord](https://discord.gg/5hzqZqP4H5)
- [Twitter](https://twitter.com/mcielecki)
