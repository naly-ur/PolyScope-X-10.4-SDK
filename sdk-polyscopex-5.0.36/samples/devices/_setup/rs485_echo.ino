 /**
 * Simple echo device that echos every received character on the RS485 serial connection to the sender in combination with this shield:
 *
 * Flash this onto the Arduino board WITHOUT the shield being attached.
 *
 * If the shield is attached and the mode-switch is in "ON", it looks like the shield takes over the serial connection of the arduino, so that
 * serial communication and flashing new programs via USB is not possible. So put it to "OFF" when flashing and the other switch in auto rather than manual when operating. Used for the ttytool
 */

#define BAUD_RATE   115200

void setup()
{
  Serial.begin(BAUD_RATE);
  pinMode(LED_BUILTIN, OUTPUT);
}


void loop()
{
  // Serial data is pending
  if (Serial.available()
  )
  {
    digitalWrite(LED_BUILTIN, HIGH);


    String temp;
    temp=Serial.readString();
    temp.concat(" OK");
    Serial.println(temp);
    Serial.flush();
  }
}
