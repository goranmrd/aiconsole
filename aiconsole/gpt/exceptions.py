class NoOpenAPIKeyException(Exception):
    def __str__(self):
        return "No API key provided. " \
               "You must set the environment variable OPENAI_API_KEY=<API-KEY>. " \
               "Generate API keys in the OpenAI web interface. " \
               "See https://platform.openai.com/account/api-keys for details."
