"""Place your awesome module here"""


class Echo():
    """Dummy Echo Class
    """

    def echo_string_method(self, value: str) -> str:
        """Echos the string sent to the method

        Args:
            value (str): The value to be sent back

        Returns:
            str: The input value
        """
        print(f"Recieved {value} which is an {type(value)}. Sending it back.")
        return value

    def echo_integer_method(self, value: int) -> int:
        """Echos the integer sent to the method

        Args:
            value (int): The value to be sent back

        Returns:
            int: The input value
        """
        print(f"Recieved {value} which is an {type(value)}. Sending it back.")
        return value

    def echo_struct_method(self, value: dict) -> dict:
        """Echos the dict sent to the method

        Args:
            value (dict): The value to be sent back

        Returns:
            dict: The input value
        """
        print(f"Recieved {value} which is an {type(value)}. Sending it back.")
        return value
