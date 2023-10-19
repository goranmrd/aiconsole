# AIConsole

## Installing & Running

```shell
pip install --upgrade aiconsole --pre # (in some environments it must be pip3 instead of pip)
mkdir your_project_dir
cd your_project_dir
export OPENAI_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
aiconsole
```

In your project directory, aiconsole will create a bunch of working files like standard materials and agents

## Running Your AIConsole Dev Mode

In order to run your own AIConsole:

1. CD into the project folder `/ai-console`
2. Install dependencies `poetry install` and `cd aiconsole/web && yarn`
3. In `/ai-console` run: `poetry run aiconsole-dev`

Requires OPENAI_API_KEY env variable to be set.

### Running in another directory in dev mode

Often times you want to host aiconsole working files in another directory, even while developing. In order to do that you need to:

1. Discover the path to your env:
poetry env info

2. You will get something like: /Users/user/Library/Caches/pypoetry/virtualenvs/aiconsole-rmLpd4fO-py3.10

3. Execute in your directory of choice the following command:

```shell
vepath/bin/python -m aiconsole.init
```

so in our example that would be:

```shell
/Users/user/Library/Caches/pypoetry/virtualenvs/aiconsole-rmLpd4fO-py3.10bin/python -m aiconsole.init
```

## Publishing process

```shell
cd web && npm run build && cd .. && poetry build && poetry publish --username __token__ --password ...
```

## Materials

Create .md files in ./materials directory in the following format:


```md
<!---
Description of when this material should be used?
-->

# Title of the material

Actual content of a material
```

Files are monitored and automatically loaded, then used as context. You can keep there API manuals, login information, prompts and other contextual information.

You can see examples of materials in the ./preset/materials directory
