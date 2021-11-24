from settings import settings
from zwift_monitor import ZwiftMonitor
from zwift_client import ZwiftClient, ZwiftLoginError
from fan_relay import FanRelay
from buttons import CycleButton, SpeedsButtons, UpDownButtons
from leds import LedsController
import time
from logger import logger
from flask import current_app as app


class Controller:
    def __init__(self):
        self.zwift_client = None
        self.fan_controller = None
        self.button_handler = None
        self.zwift_monitor = None
        self.leds = None

    def startup(self):
        try:
            self.reload_zwift()
        except ZwiftLoginError as e:
            self.zwift_client = None
            settings.zwift_username = None
            settings.zwift_password = None

        self.reload_fan_controller()
        self.reload_buttons()
        self.reload_zwift_monitor()
        self.reload_leds()

    def reload_leds(self):
        if self.leds:
            self.leds.close()

        self.leds = LedsController(settings.leds)

    def reload_zwift_monitor(self):
        logger.debug('reloading Zwift monitor')
        is_started = self.zwift_monitor is not None and self.zwift_monitor.is_running
        if self.zwift_monitor:
            self.zwift_monitor.stop()
        self.zwift_monitor = ZwiftMonitor(self.zwift_client, self.fan_controller)
        if is_started and self.zwift_client and self.fan_controller:
            self.zwift_monitor.start()

    def reload_zwift(self):
        logger.debug('reloading Zwift client')
        if settings.zwift_username and settings.zwift_password:
            self.zwift_client = ZwiftClient(settings.zwift_username, settings.zwift_password)
            self.reload_zwift_monitor()
        else:
            self.zwift_client = None

    def reload_fan_controller(self):
        logger.debug('reloading fan controller')
        current_speed = 0
        if self.fan_controller:
            current_speed = self.fan_controller.speed
            self.fan_controller.release()

        if settings.fan_method == 'relay':
            self.fan_controller = FanRelay(settings.relay_gpio, active_high=settings.relay_active_high, on_speed_changed=self.__on_speed_changed)
        else:
            self.fan_controller = None
        self.reload_buttons()
        self.reload_zwift_monitor()
        self.fan_controller.speed = current_speed

    def reload_buttons(self):
        logger.debug('reloading buttons')
        if self.button_handler:
            self.button_handler.release()

        if settings.physical_buttons != None:
            if settings.physical_buttons == 'cycle':
                self.button_handler = CycleButton(self.fan_controller, self.__on_button_switch_to_manual)
            if settings.physical_buttons == 'up-down':
                self.button_handler = UpDownButtons(self.fan_controller, self.__on_button_switch_to_manual)
            if settings.physical_buttons == 'speeds':
                self.button_handler = SpeedsButtons(self.fan_controller, self.__on_button_switch_to_manual)
        else:
            self.button_handler = None

    def __on_button_switch_to_manual(self):
        logger.debug('Button pressed: switching to manual mode')
        if self.zwift_monitor:
            self.zwift_monitor.stop()

    def __on_speed_changed(self, speed):
        if self.leds:
            self.leds.on_speed_changed(speed)

controller = Controller()


