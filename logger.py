from flask import current_app as app

class Logger:
    def init(self):
        self.__logger = app.logger

    def __getattr__(self, name):
        return getattr(self.__logger, name)

logger = Logger()
