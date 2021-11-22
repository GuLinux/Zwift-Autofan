from settings import settings
from threading import Thread
import time
from logger import logger

class ZwiftMonitor:
    def __init__(self, zwift_client, fan_controller):
        self.zwift = zwift_client
        self.fan = fan_controller
        self.__stopping = False
        self.__thread = None
        if settings.autostart and self.zwift and self.fan:
            self.start()

    def status(self):
        return {
            'is_running': self.is_running,
        }

    @property
    def is_running(self):
        return self.__thread is not None

    def start(self):
        self.__thread = Thread(target=self.__loop)
        self.__thread.start()

    def stop(self):
        self.__stopping = True
        logger.debug('Stopping monitoring thread...')
        if self.__thread:
            self.__thread.join()
        logger.debug('Monitoring thread stopped')
        self.__thread = None

    def __loop(self):
        self.__stopping = False
        while not self.__stopping:
            logger.debug('polling zwift status')
            if self.zwift.is_online:
                self.__adjust_by_speed()
                self.__adjust_by_hr()
                self.__adjust_by_power()
                self.__wait_for(settings.zwift_monitor_online_polling_secs)
            else:
                self.__wait_for(settings.zwift_monitor_offline_polling_secs)

    def __wait_for(self, seconds):
        started = time.time()
        #logger.debug('waiting for {} seconds'.format(seconds))
        while time.time() - started < seconds and not self.__stopping:
            time.sleep(0.1)

    def __adjust_by_speed(self):
        if settings.mode == 'speed':
            current_speed = self.zwift.speed
            logger.debug('Checking speed thresholds (speed={})'.format(current_speed))
            new_fan_speed = self.__fan_speed_by(current_speed, settings.speed_thresholds)
            if new_fan_speed != self.fan.speed:
                logger.info('Changing fan speed to {} for Zwift speed {}'.format(new_fan_speed, current_speed))
                self.fan.speed = new_fan_speed

    def __adjust_by_hr(self):
        if settings.mode == 'heartrate':
            current_heartrate = self.zwift.heart_rate
            logger.debug('Checking HR thresholds (HR={})'.format(current_heartrate))
            new_fan_speed = self.__fan_speed_by(current_heartrate, settings.heartrate_thresholds)
            if new_fan_speed != self.fan.speed:
                logger.info('Changing fan speed to {} for Zwift heartrate {}'.format(new_fan_speed, current_heartrate))
                self.fan.speed = new_fan_speed

    def __adjust_by_power(self):
        if settings.mode == 'power':
            current_power = self.zwift.power
            logger.debug('Checking Power thresholds (Power={})'.format(current_power))
            new_fan_speed = self.__fan_speed_by(current_power, settings.power_thresholds)
            if new_fan_speed != self.fan.speed:
                logger.info('Changing fan speed to {} for Zwift power {}'.format(new_fan_speed, current_power))
                self.fan.speed = new_fan_speed

    def __fan_speed_by(self, value, thresholds):
        reached_thresholds = [i for i, t in enumerate(thresholds) if value >= int(t)]
        return reached_thresholds[-1]+1 if reached_thresholds else 0

