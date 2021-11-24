import json
import os

class InvalidSettingTypeError(Exception):
    def __init__(self, setting, expected_type, actual_type):
        self.message = 'Wrong type for {}: expected `{}`, got `{}`'.format(setting, expected_type.__name__, actual_type.__name__)
        super().__init__(self.message)

    @staticmethod
    def check(setting, expected_type, value):
        if value is not None and not type(value) == expected_type:
            raise InvalidSettingTypeError(setting, expected_type, type(value))


class SettingValueNotAllowedError(Exception):
    def __init__(self, setting, value, valid_entries):
        self.message = 'Value for {} should be one of {}'.format(setting, str(valid_entries))
        super().__init__(self.message)

    @staticmethod
    def check(setting, valid_entries, value):
        if not value in valid_entries:
            raise SettingValueNotAllowedError(setting, value, valid_entries)

class Settings:    
    def __init__(self):
        self.settings_file = os.path.join(os.environ['HOME'], '.config', 'GuLinux', 'zwift-autofan', 'settings.json')
        self.settings = {}
        self.__reload()

    def reset(self):
        try:
            os.remove(self.settings_file)
        except FileNotFoundError:
            pass
        self.__reload()

    def to_map(self):
        settings = {}
        settings.update(self.settings)
        return settings

    @classmethod
    def declare_setting(cls, name, default_value, valid_entries=None, valid_type=None):
        setattr(cls, name, property(
                    lambda self: self.__get(name, default_value),
                    lambda self, value: self.__set(name, value, valid_entries, valid_type)
                    ))
        default_settings = getattr(cls, 'default_settings', {})
        default_settings[name] = default_value
        setattr(cls, 'default_settings', default_settings)


    def __reload(self):
        self.settings = {}
        self.settings.update(self.default_settings)
        if os.path.isfile(self.settings_file):
            try:
                with open(self.settings_file, 'r') as f:
                    self.settings.update(json.load(f))
            except json.JSONDecodeError:
                pass

    def __get(self, setting, default_value):
        return self.settings.get(setting, default_value)

    def __set(self, setting, value, valid_entries=None, valid_type=None):
        if valid_type:
            InvalidSettingTypeError.check(setting, valid_type, value)
        if valid_entries:
            SettingValueNotAllowedError.check(setting, valid_entries, value)

        self.settings[setting] = value
        os.makedirs(os.path.dirname(self.settings_file), exist_ok=True)
        with open(self.settings_file, 'w') as f:
            json.dump(self.settings, f, indent=4, sort_keys=True)


    def __str__(self):
        return str(self.to_map())

    def __repr__(self):
        return self.__str__()


Settings.declare_setting('mode', 'manual', valid_entries=['manual', 'power', 'heartrate', 'speed'], valid_type=str)
Settings.declare_setting('speeds', 3, valid_type=int)
Settings.declare_setting('fan_method', 'relay', valid_type=str, valid_entries=['relay'])
Settings.declare_setting('autostart', False, valid_type=bool)
Settings.declare_setting('relay_gpio', [2,3,4], valid_type=list)
Settings.declare_setting('relay_active_high', True, valid_type=bool)
Settings.declare_setting('heartrate_thresholds', [130,160,180], valid_type=list)
Settings.declare_setting('zwift_username', None, valid_type=str)
Settings.declare_setting('zwift_password', None, valid_type=str)
Settings.declare_setting('zwift_user_id', None, valid_type=int)
Settings.declare_setting('speed_thresholds', [15,25,35], valid_type=list)
Settings.declare_setting('power_thresholds', [150,250,350], valid_type=list)
Settings.declare_setting('physical_buttons', 'none', valid_type=str, valid_entries=['none', 'cycle', 'up-down', 'speeds'])
Settings.declare_setting('buttons_pull_up', True, valid_type=bool)
Settings.declare_setting('cycle_button_gpio', 26, valid_type=int)
Settings.declare_setting('up_button_gpio', 19, valid_type=int)
Settings.declare_setting('down_button_gpio', 26, valid_type=int)
Settings.declare_setting('speeds_buttons_gpio', [26, 19, 13, 6], valid_type=list)
Settings.declare_setting('zwift_monitor_offline_polling_secs', 60, valid_type=int)
Settings.declare_setting('zwift_monitor_online_polling_secs', 10, valid_type=int)
Settings.declare_setting('monitor_started_crash_detection', False, valid_type=bool)


settings = Settings()


