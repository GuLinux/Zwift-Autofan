from zwift import Client
from zwift.error import RequestException

class ZwiftLoginError(Exception):
    def __init__(self, msg):
        super().__init__(msg)

class ZwiftOfflineError(Exception):
    def __init__(self):
        super().__init__('Zwift user offline')



class ZwiftClient:
    def __init__(self, user, password):
        self.client = Client(user, password)
        self.check_login()
        self.user_id = self.client.get_profile().profile['id']

    def check_login(self):
        auth_token = self.client.auth_token.fetch_token_data()
        if 'error' in auth_token:
            raise ZwiftLoginError(auth_token['error_description'])


    @property
    def is_online(self):
        try:
            self.client.get_world().player_status(self.user_id)
            return True
        except RequestException:
            return False

    @property
    def heart_rate(self):
        self.__check_online()
        return self.client.get_world().player_status(self.user_id).player_state.heartrate

    @property
    def speed(self):
        self.__check_online()
        return self.client.get_world().player_status(self.user_id).player_state.speed / 1000000

    @property
    def power(self):
        self.__check_online()
        return self.client.get_world().player_status(self.user_id).player_state.power

    def __check_online(self):
        if not self.is_online:
            raise ZwiftOfflineError()

