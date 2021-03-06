from flask import Flask, jsonify, request, send_from_directory
from settings import settings, InvalidSettingTypeError, SettingValueNotAllowedError
from zwift_client import ZwiftLoginError
from zwift_monitor import ZwiftMonitorError
from controller import controller
from validators import JSONInputException, bad_request, json_input
from logger import logger
import logging
import time

app = Flask(__name__, static_folder=None, static_url_path=None)

@app.before_first_request
def on_startup():
    if settings.log_level:
        app.logger.setLevel(getattr(logging, settings.log_level))
    app.logger.debug('****** starting up controller')
    logger.init()
    controller.startup()

@app.errorhandler(JSONInputException)
def on_json_input_error(error):
    return bad_request(error.message)

@app.errorhandler(ZwiftLoginError)
def on_zwift_login_error(error):
    return {'error': 'zwift_login_error', 'error_message': 'Invalid Zwift username/password' }, 401

@app.errorhandler(ZwiftMonitorError)
def on_zwift_login_error(error):
    return {'error': 'zwift_monitor_error', 'error_message': error.message }, 400

@app.errorhandler(InvalidSettingTypeError)
def on_invalid_setting_type(e):
    logger.debug('Invalid setting: ', exc_info=e)
    return bad_request(f'Invalid setting type: {e.message}')


@app.errorhandler(SettingValueNotAllowedError)
def on_setting_value_not_allowed(e):
    logger.debug('Setting value not allowed', exc_info=e)
    return bad_request(f'Invalid setting value: {e.message}')

@app.errorhandler(Exception)
def on_generic_exception(e):
    logger.debug('A generic exception occured: ', exc_info=e)
    return {'error': 'exception', 'error_message': str(e)}, 500

@app.route('/api/status')
def get_status():
    return {
        'zwift': controller.zwift_client.status() if controller.zwift_client else { 'login': False },
        'fan': controller.fan_controller.status(),
        'monitor': controller.zwift_monitor.status(),
        'settings': settings.to_map(),
        'leds': controller.leds.status(),
    }

@app.route('/api/zwift/login', methods=['POST'])
def zwift_login():
    data = json_input(['username', 'password'])
    settings.zwift_username = data['username']
    settings.zwift_password = data['password']
    controller.reload_zwift()
    return get_status()

@app.route('/api/zwift/logout', methods=['POST'])
def zwift_logout():
    settings.zwift_username = None
    settings.zwift_password = None
    controller.reload_zwift()
    return get_status()


@app.route('/api/zwift/monitor/start', methods=['POST'])
def start_zwift_monitor():
    controller.zwift_monitor.start()
    return get_status()

@app.route('/api/zwift/monitor/stop', methods=['POST'])
def stop_zwift_monitor():
    controller.zwift_monitor.stop()
    return get_status()

@app.route('/api/fan/speed', methods=['GET'])
def get_speed():
    return { 'speed': controller.fan_controller.speed if controller.fan_controller else None}

@app.route('/api/fan/speed/<int:speed>', methods=['POST'])
def set_speed(speed):
    controller.fan_controller.speed = speed
    controller.zwift_monitor.stop()
    return get_status()


@app.route('/api/settings', methods=['GET'])
def get_settings():
    return settings.to_map()


@app.route('/api/settings/reset', methods=['POST'])
def reset_settings():
    settings.reset()
    controller.startup()
    return get_status()

def change_setting(setting, value=None, value_key=None, extra_settings=[], reloads=[]):
    if value_key:
        value = json_input([value_key])[value_key]
    if extra_settings and request.is_json:
        data = json_input(extra_settings)
        for extra_key, extra_value in data.items():
            setattr(settings, extra_key, extra_value)
    setattr(settings, setting, value)
    for action in reloads:
        getattr(controller, action)()
    return get_status()

@app.route('/api/settings/fan/relay', methods=['POST'])
def set_relay_fan_speeds():
    return change_setting('fan_method', value='relay', extra_settings=['relay_active_high', 'relay_gpio', 'relay_interpolate_speeds', 'relay_interpolate_blink_seconds'], reloads=['reload_fan_controller'])

@app.route('/api/settings/mode/manual', methods=['POST'])
def set_mode_manual():
    return change_setting('mode', value='manual', extra_settings='reload_zwift_monitor')

@app.route('/api/settings/mode/heartrate', methods=['POST'])
def set_mode_heartrate():
    return change_setting('mode', value='heartrate', extra_settings=['heartrate_thresholds'], reloads=['reload_zwift_monitor'])

@app.route('/api/settings/mode/speed', methods=['POST'])
def set_mode_speed():
    return change_setting('mode', value='speed', extra_settings=['speed_thresholds'], reloads=['reload_zwift_monitor'])

@app.route('/api/settings/mode/power', methods=['POST'])
def set_mode_power():
    return change_setting('mode', value='power', extra_settings=['power_thresholds'], reloads=['reload_zwift_monitor'])

@app.route('/api/settings/zwift-monitor-bias', methods=['POST'])
def set_zwift_monitor_bias():
    return change_setting('zwift_monitor_bias', value_key='bias', reloads=[]);

@app.route('/api/settings/leds', methods=['POST'])
def set_leds():
    return change_setting('leds', value_key='leds', reloads=['reload_leds'])

@app.route('/api/settings/physical_buttons/none', methods=['POST'])
def set_buttons_none():
    return change_setting('physical_buttons', value='none', reloads=['reload_buttons'])

@app.route('/api/settings/physical_buttons/cycle', methods=['POST'])
def set_buttons_cycle():
    return change_setting('physical_buttons', value='cycle', extra_settings=['cycle_button_gpio'], reloads=['reload_buttons'])

@app.route('/api/settings/physical_buttons/up-down', methods=['POST'])
def set_buttons_up_down():
    return change_setting('physical_buttons', value='up-down', extra_settings=['up_button_gpio'], reloads=['reload_buttons'])

@app.route('/api/settings/physical_buttons/speeds', methods=['POST'])
def set_buttons_speeds():
    return change_setting('physical_buttons', value='speeds', extra_settings=['speeds_buttons_gpio'], reloads=['reload_buttons'])

@app.route('/api/settings/log-level/<level>', methods=['POST'])
def set_log_level(level):
    status = change_setting('log_level', value=level)
    app.logger.setLevel(getattr(logging, settings.log_level))
    return status


# Debug routes
@app.route('/api/zwift/__dbg_get_cycling_players', methods=['GET'])
def dbg_get_cycling_player():
    return jsonify(controller.zwift_client.dbg_get_cycling_players())

@app.route('/api/zwift/__dbg_set_cycling_player/<userid>', methods=['POST'])
def dbg_set_cycling_player(userid):
    controller.zwift_client.user_id = int(userid)
    return get_status()

@app.route('/api/zwift/__dbg_find_cycling_player', methods=['POST'])
def dbg_find_cycling_player():
    params = request.get_json() if request.is_json else dict()
    controller.zwift_client.dbg_set_cycling_player(**params)
    return get_status()

@app.route('/api/zwift/__dbg_reset_user_id', methods=['POST'])
def dbg_reset_user_id():
    controller.zwift_client.reset_user_id()
    return get_status()

@app.route('/api/__dbg_button_press/<button_number>', methods=['POST'])
def dbg_button_press(button_number):
    if controller.button_handler:
        button = controller.button_handler._buttons.get(int(button_number))
        if button:
            logger.debug(f'Simulating button press for {button} ({button_number})')
            if settings.buttons_pull_up:
                button.pin.drive_low()
                time.sleep(0.4)
                button.pin.drive_high()
            else:
                button.pin.drive_high()
                time.sleep(0.4)
                button.pin.drive_low()
            return { 'result': str(button) }
    return { 'result': 'not_found' }, 404

@app.route('/api/__dbg_generic_exception', methods=['POST'])
def dbg_raise_error():
    raise RuntimeError('hello')



@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def index(path):
    return send_from_directory('frontend/build', path)

