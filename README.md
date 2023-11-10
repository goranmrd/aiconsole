<h2 align="center"><img src="https://github.com/10clouds/aiconsole/assets/135703473/d48b7b40-4b9e-45af-92e4-2abc5a8a40b0" height="64"><br>AIConsole</h2>

<p align="center"><strong>Open Source Desktop Alternative to OpenAI GPTs</strong></p>

# Features

| Feature | Description |
| ------------- | ------------- |
| Run Code Locally | Run it locally; the console can perform all the tasks that your machine is capable of executing. |
| Improves with Use | Describe in plain text how to perform a given task once, and thereafter AIConsole will know how to execute it indefinitely. |
| Utilize Your Notes for AI Training | Employ your notes to instruct the AI in completing and automating tasks. |
| Better than Vector Databases | For each step of your tasks, leverage a precise, efficient, and automated multi-agent Retrieval-Augmented Generation (RAG) system that is on par with expert prompt engineering. |
| Completely Open Sourced | This software does not transmit any data to any parties other than the LLM APIs – and you can confirm this for yourself. |
| Share Your Tools with the Community | Develop and share your domain-specific AI tools, for instance, on platforms like GitHub or Discord.

# Downloading and Installing

Select the version suitable for your operating system:

- [Windows](https://github.com/10clouds/aiconsole/releases)
- [macOS (Intel)](https://github.com/10clouds/aiconsole/releases)
- [macOS (ARM)](https://github.com/10clouds/aiconsole/releases)
- [Linux](https://github.com/10clouds/aiconsole/releases)

# Basic Flow of Work

Imagine you want to send your daily calendar schedule to your girlfriend through iMessage.

1. Install AIConsole using the instructions provided on GitHub and run it in a new project directory like personal-aiconsole.
2. Input the instruction: "Send an iMessage to my girlfriend with my calendar for today."
3. AIConsole is trying to understand your command, but without knowing who your girlfriend is or access to your calendar, it stumbles.
4. But, every misstep is a learning opportunity. AIConsole uses a concept of materials — user created documents which tell AIConsole how to do stuff, or provide it with contextual information. To teach AIConsole, create a 'Social Circle' material where you include contact information about your girlfriend. In case you're on a macOS, AIConsole will be able to access your Contacts application. But you can also provide the full contact information here
5. Next, within AIConsole create a new material 'Calendar Manual', specifying your calendar's location, whether it's Google Calendar or a local one. This step may require some trial and error as different calendar types may need different kinds of access. In some cases, it might be useful to provide a sample Python code showing how to access your calendar.
6. With our built-in iMessage manual, you are ready to send the message.

After updating these materials, you can retry the step, and provided all the information is accurate, AIConsole will send the iMessage.

# Project Directory Structure

Structure of a project folder

```/``` - root directory is added to the python system path, you can place here any custom modules that you want the python interpreter to have access to.

```/agents``` - agent .toml files define available agents you can disable and enable them from the app. [example agents](../blob/master/backend/aiconsole/preinstalled/agents)

```/materials``` - various materials, notes, manuals and APIs to be injected into GPT context. [examples materials](../blob/master/backend/aiconsole/preinstalled/materials)

```/.aic```

```/settings.toml``` - configuration file containing information about disabled materials

Note that in your home app directory you have additional settings.toml which stored global settings.

Material, Agent and settings files are monitored and automatically loaded, then used as context.

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

# Contributing

We welcome contributions from the community to make AI Console even better. If you have any ideas, bug reports, or feature requests, please open an issue on the GitHub repository. Feel free to submit pull requests as well!

You can also visit our [Discord channel](https://discord.gg/5hzqZqP4H5) for a further discussion.

# Embedding the AIConsole Backend in Your App

If you want to develop something on top of the aiconsole backend, you may install the backend part using:

`pip install aiconsole`

# Running Development Non-Electron AIConsole

In order to run the non electron development version of AIConsole:

1. To run the standalone backend: `cd backend && poetry install && poetry run dev`
2. To run the standalone frontend: `cd frontend && yarn && yarn dev`

# Buiding the Desktop App

1. To run the development version of electron bundle: `cd electron && yarn dev`
2. To bundle the desktop app: `cd electron && yarn && yarn make`
3. To publish the desktop app: `cd electron && yarn && yarn publish`

# License

AI Console is open-source software licensed under the [Apache License ver. 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt).

# Links

- [Landing page](https://aiconsole.ai)
- [Discord](https://discord.gg/5hzqZqP4H5)
- [Twitter](https://twitter.com/mcielecki)
