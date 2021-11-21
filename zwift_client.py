from zwift import Client
from zwift.error import RequestException
import time
from logger import logger
from settings import settings

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
        self.__cached_player_status = 0, None

    def check_login(self):
        auth_token = self.client.auth_token.fetch_token_data()
        if 'error' in auth_token:
            raise ZwiftLoginError(auth_token['error_description'])


    @property
    def is_online(self):
        return self.player_status() is not None

    @property
    def heart_rate(self):
        return self.player_status().player_state.heartrate if self.is_online else None

    @property
    def speed(self):
        return self.player_status().player_state.speed / 1000000 if self.is_online else None

    @property
    def power(self):
        return self.player_status().player_state.power if self.is_online else None

    @property
    def user_id(self):
        return settings.zwift_user_id

    @user_id.setter
    def user_id(self, user_id):
        settings.zwift_user_id = user_id

    def status(self):
        return {
            'login': True,
            'user_id': self.user_id,
            'online': self.is_online,
            'heart_rate': self.heart_rate,
            'speed': self.speed,
            'power': self.power,
        }

    def dbg_get_cycling_players(self):
        return [c for c in self.client.get_world().players['friendsInWorld'] if c['currentSport'] == 'CYCLING' and c['totalDistanceInMeters'] > 0]


    def dbg_set_cycling_player(self, check_hr=False, check_power=False):
        for player in self.dbg_get_cycling_players():
            self.user_id = player['playerId']
            if self.speed:
                if check_hr:
                    if self.heart_rate:
                        break
                    else:
                        continue
                if check_power:
                    if self.power:
                        break
                    else:
                        continue
                break

    def player_status(self):
        last_checked_time, state = self.__cached_player_status
        if time.time() - last_checked_time >= 5:
            try:
                state = self.client.get_world().player_status(self.user_id)
            except RequestException as e:
                state = None
            self.__cached_player_status = time.time(), state
        return state

    def __check_online(self):
        if not self.is_online:
            raise ZwiftOfflineError()

