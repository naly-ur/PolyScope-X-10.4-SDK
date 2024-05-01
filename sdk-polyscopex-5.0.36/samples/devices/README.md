# Devices Demo

This project serves as a demonstration of serial communication using an Arduino device. It provides a simple flask server with endpoints that allow you to interact with the device and gather information about its status. While an Arduino is used for this demonstration, you can substitute it with any other device of your choice. For setup and installation instructions, refer to the [README](./_setup/README.md) file in the `_setup` folder.


## URCap Description

This URCap contains two main components:

1. **Device Hooks:**
   These are scripts that are triggered when a device event occurs. The scripts included in this project are:
   - `on_device_add`: Executed when a new device is plugged into the system.
   - `on_device_remove`: Executed when a device is unplugged from the system.
2. **Business Logic:**
   The business logic of the project starts with the `main.py` file. It includes a Flask server with specific endpoints that you can call to obtain information about the device or to perform some actions on it.

After installtion of urcap. When a new device is plugged into the system, the `on_device_add` and `on_device_remove` hooks are executed with a payload within the URCap container. The role of these hooks is to either approve or reject a device to be added to the container based on the information provided in the payload.

As a URCap developer, it is your responsibility to create a logic that inspects the payload, identifies the device, and decides whether to approve or reject it. While the existing example approves all serial devices by default, it can be modified to accommodate specific cases.

## Requirements for Device Hooks

1. The backend container expecting devices to be plugged in must contain `on_device_add` & `on_device_remove` executables and must have exact names.
2. These files must be placed in the root (`/`) directory. You can verify their placement with the following commands:

   ```bash
   ls -l /on_device_add
   ls -l /on_device_remove
   ```
3. The device hooks (`on_device_add`/`on_device_remove`) must be executable files with execution permissions. You can set these permissions with the following commands:

   ```bash
   chmod +x /on_device_add
   chmod +x /on_device_remove
   ```

This project aims to provide a practical understanding of URCap development, device hooks, and device interaction in an easily digestible format. We hope you find it useful!

Sure, here's a better-structured markdown version:

## Flask Server

Flask server is running in the background container. After installing the URCap, you can make curl requests. For more details, refer to the file [api](./device/src/rest/api.py).

### Get List of Owned Devices

To retrieve a list of owned devices, execute the following command. Replace `<robot_ip>` with the IP address of the robot and `<my_device_type>` with either 'serial' or 'video'.

```bash
curl -X GET http://<robot_ip>/universal-robots/devices-demo/device/rest-api/owned_devices?device_type=<my_device_type>
```

### Get Invocation Logs

To retrieve the invocation logs related to `on_add_device` and `on_remove_device`, execute the following command. Replace `<robot_ip>` with the IP address of the robot.

```bash
curl -X GET http://<robot_ip>/universal-robots/devices-demo/device/rest-api/invocation_logs
```

### Echo a Serial Device

To echo a serial device, execute the following command. Replace `<robot_ip>` with the IP address of the robot. Note that the logic may need to be adjusted to match your device.

```bash
curl -X GET http://<robot_ip>/universal-robots/devices-demo/device/rest-api/serial/echo -H "Content-Type: application/json" -d '{"device": "/dev/ttyUSB0", "baud": 115200, "timeout_s": 10.0, "sent_msg": "hello world", "expected_msg": "hello world OK", "reset_delay_s": 0.5}'
```

## Debugging the on_device_add

If you're interested in debugging the `on_device_add`, follow the steps below.

### 1. Monitor the Execution Events

Monitor `exec_create` and `exec_start` events for a specific container. Replace `<container_id>` with the ID of your container.

```bash
docker events --filter 'event=exec_create' --filter 'event=exec_start' --filter 'container=<container_id>'
```

### 2. Execute the Event Manually

You can manually trigger the `on_device_add` event using the `docker exec` command.

Replace `<container>` with the name or ID of your container.

```bash
docker exec -it <container> /bin/bash
```

Next, you can trigger the `on_device_add` event:

```bash
/on_device_add '{"idProduct":"6001","idVendor":"0403","logicalDevices":[{"deviceNode":"/dev/ttyUSB0","major":188,"minor":0}],"manufacturer":"FTDI","product":"USB-RS485 Cable","serial":"AU064DZK","urDeviceType":"SERIAL","urDeviceAPIVersion":"0.1"}'
```

You can run this command directly in the Docker container:

```bash
docker exec -it <container> /on_device_add '{"idProduct":"6001","idVendor":"0403","logicalDevices":[{"deviceNode":"/dev/ttyUSB0","major":188,"minor":0}],"manufacturer":"FTDI","product":"USB-RS485 Cable","serial":"AU064DZK","urDeviceType":"SERIAL","urDeviceAPIVersion":"0.1"}'
```

Following these steps should provide you with a method for debugging the `on_device_add` event.
