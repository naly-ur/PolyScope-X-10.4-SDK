## Serial Device Communication Setup

This README provides information on setting up serial device communication, specifically utilizing an Arduino board for simple back-and-forth serial communication. The program running on the Arduino allows it to receive text messages and respond with the same text appended with an "OK" message. This setup serves as a practical means to test communication functionality between the URcap container and any serial device of your choice.


    +--------------+                   +--------------+
    |              |                   |              |
    |   Arduino    <--[Hello World]----+     PC       |
    |              |                   |              |
    +--------------+                   +--------------+
           |                                    |
           +---------[Hello World OK]-->--------+

The diagram above illustrates the communication flow between the Arduino and a PC. The Arduino receives a "Hello World" message from the PC and responds with "Hello World OK."

## Arduino Communication Testing

This folder contains code designed for Arduino devices to verify serial device communication within URCapx's. The primary objective is to ensure successful communication between the Arduino and the URCap container. This is achieved by sending data to the Arduino and verifying the echoed response for accuracy.

To flash the Arduino while shields are attached, ensure that the switch is set to the **OFF** position.

For communication, refer to the following tutorials:
- [RS232 Shield](https://wiki.dfrobot.com/RS232_Shield)
- [RS485 Shield](https://wiki.dfrobot.com/Arduino_RS485_Shield_SKU__DFR0259)

### Steps to Test Arduino Communication

1. Flash the arduino board with the provided .ion file 
2. Power on the Arduino board and connect the communication cable to the Linux machine.
3. Check the available devices using the following commands in a terminal:
   ```sh
   ls /dev/ttyUSB*
   ls /dev/ttyACM*
   ```
4. Identify the appropriate serial port for communication, which can be either `/dev/ttyUSB*` or `/dev/ttyACM*` depending on your setup. Unplug and plug back the USB cables to identify which device belongs to which. Let's assume the serial port is `/dev/ttyUSB0`.
5. In one console, set the serial port settings and read the received data:
   ```sh
   stty 115200 -F /dev/ttyUSB0 raw -echo
   cat /dev/ttyUSB0
   ```
6. In another console, send a message to the Arduino:
   ```sh
   echo "HELLO" > /dev/ttyUSB0
   ```
7. You should see the following message in the first console:
   ```sh
   HELLO
    OK
   ```

These step-by-step instructions guide you through testing Arduino communication by configuring serial port settings and verifying bidirectional data exchange.