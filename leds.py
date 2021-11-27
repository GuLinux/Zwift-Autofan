from gpiozero import LED
from logger import logger

class Led:
    def __init__(self, gpio, on_speed, slow_blink_speed=None, fast_blink_speed=None):
        self.led = LED(gpio, active_high=True, initial_value=False)
        self.on_speed = on_speed
        self.slow_blink_speed = slow_blink_speed
        self.fast_blink_speed = fast_blink_speed
        self.current_speed = 0
        self.status = {
            'pin': gpio,
            'status': 'off',
            'on_speed': on_speed,
            'slow_blink_speed': slow_blink_speed,
            'fast_blink_speed': fast_blink_speed,
        }

    def on_speed_changed(self, speed):
        if speed != self.current_speed:
            self.current_speed = speed
            if speed >= self.on_speed:
                self.led.on()
                self.status['status'] = 'on'
            elif self.__should_slow_blink(speed):
                self.led.blink(on_time=1, off_time=1)
                self.status['status'] = 'slow_blink'
            elif self.__should_fast_blink(speed):
                self.led.blink(on_time=0.3, off_time=0.3)
                self.status['status'] = 'fast_blink'
            else:
                self.led.off()
                self.status['status'] = 'off'

    def close(self):
        self.led.close()

    def __should_slow_blink(self, speed):
        return self.slow_blink_speed and speed < self.on_speed and speed >= self.slow_blink_speed and not self.__should_fast_blink()

    def __should_fast_blink(self, speed):
        return self.fast_blink_speed and speed < self.on_speed and speed >= self.fast_blink_speed

class LedsController:
    def __init__(self, leds_settings):
        self.leds = [Led(led['gpio'], led['on_speed'], led.get('slow_blink_speed'), led.get('fast_blink_speed')) for led in leds_settings]

    def on_speed_changed(self, speed):
        for led in self.leds:
            led.on_speed_changed(speed)

    def close(self):
        for led in self.leds:
            led.close()
            
    def status(self):
        return [l.status for l in self.leds]
