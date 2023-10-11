FROM python:3.11

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików z projektu
COPY ../poetry.lock ./poetry.lock
COPY ../pyproject.toml ./pyproject.toml
COPY ../README.md ./README.md

# Instalowanie zależności systemowych i narzędzi
RUN apt-get update && \
    apt-get install -y curl gnupg

RUN pip install poetry
# Instalacja zależności Pythona
RUN poetry install

# Instalacja Node.js
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -y nodejs
RUN apt-get install -y npm


# Instalacja Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update && apt-get install -y yarn

COPY ../aiconsole /app/aiconsole
COPY ../bin /app/bin
COPY ../tests /app/tests
COPY ../web/ /app/web

RUN cd /app/web && npm install
RUN cd /app/web && yarn install
RUN cd /app/web && yarn build
RUN cd /app && poetry build
