from gpiozero import Button
from functools import partial
from settings import settings

class AbstractButtonController:
    def __init__(self, fan_controller, on_button_press=None):
        self.fan_controller = fan_controller
        self._buttons = dict()
        self.on_button_press = on_button_press

    def create_bind_button(self, gpio, when_pressed, *args, **kwargs):
        button = Button(gpio, bounce_time=0.1, pull_up=settings.buttons_pull_up)
        def button_pressed_callback():
            if self.on_button_press:
                self.on_button_press()
            when_pressed()
        button.when_pressed = button_pressed_callback
        self._buttons[gpio] = button
        return button

    def release(self):
        for _, button in self._buttons.items():
            button.close()

class CycleButton(AbstractButtonController):
    def __init__(self, fan_controller, on_button_press):
        super().__init__(fan_controller, on_button_press)
        self.create_bind_button(settings.cycle_button_gpio, self.when_pressed) 

    def when_pressed(self):
        new_speed = self.fan_controller.speed + 1
        if new_speed > self.fan_controller.max_speed:
            new_speed = 0
        self.fan_controller.speed = new_speed

class UpDownButtons(AbstractButtonController):
    def __init__(self, fan_controller, on_button_press):
        super().__init__(fan_controller, on_button_press)
        self.up_button = self.create_bind_button(settings.up_button_gpio, self.up_pressed) 
        self.down_button = self.create_bind_button(settings.down_button_gpio, self.down_pressed) 

    def up_pressed(self):
        new_speed = self.fan_controller.speed + 1
        if new_speed > self.fan_controller.max_speed:
            new_speed = self.fan_controller.max_speed
        self.fan_controller.speed = new_speed

    def down_pressed(self):
        new_speed = self.fan_controller.speed - 1
        if new_speed < 0:
            new_speed = 0
        self.fan_controller.speed = new_speed

class SpeedsButtons(AbstractButtonController):
    def __init__(self, fan_controller, on_button_press):
        super().__init__(fan_controller, on_button_press)
        self.buttons = [self.create_bind_button(g, partial(self.on_pressed, index)) for index, g in enumerate(settings.speeds_buttons_gpio)]

    def on_pressed(self, index):
        self.fan_controller.speed = index

