ARG PYTHON_VERSION
FROM python:${PYTHON_VERSION}

WORKDIR /app

COPY ../poetry.lock ./poetry.lock
COPY ../pyproject.toml ./pyproject.toml
COPY ../README.md ./README.md

RUN apt-get update && \
    apt-get install -y curl gnupg

RUN pip install poetry
RUN poetry install

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -y nodejs
RUN apt-get install -y npm


RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update && apt-get install -y yarn

COPY ../aiconsole /app/aiconsole
COPY ../bin /app/bin
COPY ../tests /app/tests
COPY ../web/ /app/web

RUN cd /app/web && yarn install
RUN cd /app/web && yarn build
RUN cd /app && poetry build
