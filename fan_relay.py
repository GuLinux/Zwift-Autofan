from gpiozero import LED

class FanRelay:
    def __init__(self, pins_gpio, active_high=True):
        self.pins = []
        self.__speed = 0
        for pin in pins_gpio:
            self.pins.append(LED(pin, active_high=active_high, initial_value=False))

    @property
    def speed(self):
        return self.__speed

    @speed.setter
    def speed(self, value):
        self.__speed = value
        if value > len(self.pins):
            raise RuntimeError('Speed must be a value from 0 (off) to {}'.format(len(self.pins)))
        for index, pin in enumerate(self.pins):
            if index+1 == value:
                pin.on()
            else:
                pin.off()

    def __str__(self):
        pins_str = ['{{{}, {}}}'.format(pin.pin, 'ON' if pin.is_lit else 'OFF') for pin in self.pins]
        return 'FanRelay: speed={}, pins: [{}]'.format(self.speed, ', '.join(pins_str))

    def __repr__(self):
        return self.__str__()

