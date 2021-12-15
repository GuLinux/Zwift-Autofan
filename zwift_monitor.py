from settings import settings
from threading import Thread, current_thread
import time
from logger import logger

class ZwiftMonitorError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message

class ZwiftMonitor:
    def __init__(self, zwift_client, fan_controller):
        self.zwift = zwift_client
        self.fan = fan_controller
        self.__stopping = False
        self.__thread = None
        if (settings.autostart or settings.monitor_started_crash_detection) and self.zwift and self.fan:
            self.start()

    def status(self):
        return {
            'is_running': self.is_running,
        }

    @property
    def is_running(self):
        return self.__thread is not None

    def start(self):
        if self.is_running:
            raise ZwiftMonitorError('Zwift monitor already started')
        settings.monitor_started_crash_detection = True
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
            logger.debug(f'{current_thread().name}: polling zwift status')
            try:
                if self.zwift.is_online:
                    self.__adjust_by_speed()
                    self.__adjust_by_hr()
                    self.__adjust_by_power()
                    self.__wait_for(settings.zwift_monitor_online_polling_secs)
                else:
                    self.__wait_for(settings.zwift_monitor_offline_polling_secs)
            except:
                logger.warning('An error occured while checking Zwift status', exc_info=True)
        settings.monitor_started_crash_detection = False

    def __wait_for(self, seconds):
        started = time.time()
        #logger.debug(f'waiting for {seconds} seconds')
        while time.time() - started < seconds and not self.__stopping:
            time.sleep(0.1)

    def __adjust_by_speed(self):
        if settings.mode == 'speed':
            current_speed = self.zwift.speed
            logger.debug(f'Checking speed thresholds (speed={current_speed})')
            new_fan_speed = self.__fan_speed_by(current_speed, settings.speed_thresholds)
            if new_fan_speed != self.fan.speed:
                logger.info(f'Changing fan speed to {new_fan_speed} for Zwift speed {current_speed}')
                self.fan.speed = new_fan_speed

    def __adjust_by_hr(self):
        if settings.mode == 'heartrate':
            current_heartrate = self.zwift.heart_rate
            logger.debug(f'Checking HR thresholds (HR={current_heartrate})')
            new_fan_speed = self.__fan_speed_by(current_heartrate, settings.heartrate_thresholds)
            if new_fan_speed != self.fan.speed:
                logger.info(f'Changing fan speed to {new_fan_speed} for Zwift heartrate {current_heartrate}')
                self.fan.speed = new_fan_speed

    def __adjust_by_power(self):
        if settings.mode == 'power':
            current_power = self.zwift.power
            logger.debug(f'Checking Power thresholds (Power={current_power})')
            new_fan_speed = self.__fan_speed_by(current_power, settings.power_thresholds)
            if new_fan_speed != self.fan.speed:
                logger.info(f'Changing fan speed to {new_fan_speed} for Zwift power {current_power}')
                self.fan.speed = new_fan_speed

    def __fan_speed_by(self, value, thresholds):
        bias_adjusted_value = value + (value  * settings.zwift_monitor_bias/100.0)
        logger.debug(f'value: {value}, bias: {settings.zwift_monitor_bias}, bias_adjusted_value: {bias_adjusted_value}')
        reached_thresholds = [i for i, t in enumerate(thresholds) if bias_adjusted_value >= int(t)]
        return reached_thresholds[-1]+1 if reached_thresholds else 0

