from flask import request
from logger import logger

class JSONInputException(Exception):
    def __init__(self, message=None):
        self.message = message if message else 'Invalid JSON input'
        super().__init__(self.message)


def json_input(required_keys=[]):
    data = request.get_json()
    if not data:
        raise JSONInputException()
    for key in required_keys:
        if not key in data:
            raise JSONInputException(f'JSON input missing required key `{key}`')
    return data

def bad_request(reason):
    return {'error': 'bad_request', 'error_message': reason}, 400


