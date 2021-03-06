from gpiozero import LED
from logger import logger
import math

class FanRelay:
    def __init__(self, pins_gpio, active_high=True, on_speed_changed=None, interpolate=False, interpolate_blink={}):
        self.pins = []
        self.__on_speed_changed = on_speed_changed
        self.__speed = 0
        self.__interpolate = 2 if interpolate else 1
        self.__interpolate_blink = interpolate_blink
        for pin in pins_gpio:
            self.pins.append(LED(pin, active_high=active_high, initial_value=False))

    @property
    def speed(self):
        return self.__speed

    @speed.setter
    def speed(self, value):
        effective_speed = value / self.__interpolate
        logger.debug(f'Setting speed to {value} (interpolated: {effective_speed})')

        if self.__on_speed_changed and self.__speed != value:
            self.__on_speed_changed(value)

        self.__speed = value

        if value > len(self.pins) * self.__interpolate:
            raise RuntimeError(f'Speed must be a value from 0 (off) to {len(self.pins)}')
        for index, pin in enumerate(self.pins):
            if index+1 == math.ceil(effective_speed):
                if index+1 == effective_speed:
                    logger.debug(f'GPIO {pin.pin}: [ON]')
                    pin.on()
                else:
                    logger.debug(f'GPIO {pin.pin}: [BLINK]')
                    pin.blink(on_time=self.__interpolate_blink.get('on', 4), off_time=self.__interpolate_blink.get('off', 2), background=True)
            else:
                logger.debug(f'GPIO {pin.pin}: [OFF]')
                pin.off()

    @property
    def max_speed(self):
        return len(self.pins) * self.__interpolate

    def release(self):
        for pin in self.pins:
            pin.close()

    def status(self):
        return {
            'type': 'relay',
            'speed': self.speed,
            'max_speed': self.max_speed,
            'interpolate': self.__interpolate,
            'interpolate_blink': self.__interpolate_blink,
        }


    def __str__(self):
        pins_str = [f'{{{pin.pin}, {"ON" if pin.is_lit else "OFF"}}}' for pin in self.pins]
        return f'FanRelay: speed={self.speed}, pins: [{", ".join(pins_str)}]'

    def __repr__(self):
        return self.__str__()

