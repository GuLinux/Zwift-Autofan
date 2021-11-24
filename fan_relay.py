from gpiozero import LED
from logger import logger

class FanRelay:
    def __init__(self, pins_gpio, active_high=True, on_speed_changed=None):
        self.pins = []
        self.__on_speed_changed = on_speed_changed
        self.__speed = 0
        for pin in pins_gpio:
            self.pins.append(LED(pin, active_high=active_high, initial_value=False))

    @property
    def speed(self):
        return self.__speed

    @speed.setter
    def speed(self, value):
        logger.debug('Setting speed to {}'.format(value))

        if self.__on_speed_changed and self.__speed != value:
            self.__on_speed_changed(value)

        self.__speed = value

        if value > len(self.pins):
            raise RuntimeError('Speed must be a value from 0 (off) to {}'.format(len(self.pins)))
        for index, pin in enumerate(self.pins):
            if index+1 == value:
                pin.on()
            else:
                pin.off()

    @property
    def max_speed(self):
        return len(self.pins)

    def release(self):
        for pin in self.pins:
            pin.close()

    def status(self):
        return {
            'type': 'relay',
            'speed': self.speed,
            'max_speed': self.max_speed,
        }


    def __str__(self):
        pins_str = ['{{{}, {}}}'.format(pin.pin, 'ON' if pin.is_lit else 'OFF') for pin in self.pins]
        return 'FanRelay: speed={}, pins: [{}]'.format(self.speed, ', '.join(pins_str))

    def __repr__(self):
        return self.__str__()

