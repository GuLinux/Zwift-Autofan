from zwift import Client
from zwift.error import RequestException

class ZwiftClient:
    def __init__(self, user, password):
        self.client = Client(user, password)
        self.user_id = self.client.get_profile().profile['id']

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

    def dbg_set_active_cyclist(self):
        cyclists = [u for u in self.client.get_world().players['friendsInWorld'] if u['currentSport'] == 'CYCLING' and u['totalDistanceInMeters'] > 0]
        for c in cyclists:
            self.user_id = c['playerId']
            if self.is_online and self.speed() > 0:
                print(self.user_id)
                break


    def __check_online(self):
        if not self.is_online:
            raise RuntimeError('User offline')
