class TokenError(Exception):
    """
    Custom error class related to number of tokens.
    """

    def __init__(self, message=""):
        self.message = message
        super().__init__(self.message)
        self.name = self.__class__.__name__
