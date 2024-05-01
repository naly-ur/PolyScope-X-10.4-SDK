"""Simple ROS2 Node for UR Backend"""

import os

import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, QoSDurabilityPolicy, QoSHistoryPolicy, QoSReliabilityPolicy, QoSLivelinessPolicy

from urinterfaces.msg import Analog
from urinterfaces.srv import SetAnalogOutput


class SimpleROS2Node(Node):
    """Creates a ROS Node"""

    def __init__(self):
        self.namespace = os.getenv('ROS2_NAMESPACE')
        super().__init__('simple_ros2_node', namespace=self.namespace)

        self.qos_profile = QoSProfile(
            depth=1,
            history=QoSHistoryPolicy.KEEP_LAST,
            liveliness=QoSLivelinessPolicy.AUTOMATIC,
            reliability=QoSReliabilityPolicy.BEST_EFFORT,
            durability=QoSDurabilityPolicy.VOLATILE
        )

        self.subscription = self.create_subscription(
            Analog,
            'standard_analog_output_0',
            self.submit_value_callback,
            self.qos_profile)

        self.client = self.create_client(SetAnalogOutput, 'set_standard_analog_output')
        while not self.client.wait_for_service(timeout_sec=1.0):
            self.get_logger().info(f'Robot Controller ({self.namespace}) not accessible, waiting again...')
        self.get_logger().info(f'Using Robot Controller: {self.namespace}')

    def submit_value_callback(self, msg):
        """Submits the value from analog output pin 0 to pin 1

        Args:
            msg (ROS message): The message
        """
        self.get_logger().info(f'Incoming request {msg}')
        req = SetAnalogOutput.Request()
        req.pin = 1
        req.output_type = req.CURRENT if msg.domain == msg.CURRENT else req.VOLTAGE
        req.data = msg.data
        self.client.call_async(req)


def main(args=None):
    """Main Entrance"""
    rclpy.init(args=args)
    simple_ros2_node = SimpleROS2Node()
    simple_ros2_node.get_logger().info('Simple ROS2 Node, a sample where standard '
                                       'analog out 0 is sent to standard analog out 1')

    try:
        rclpy.spin(simple_ros2_node)
    except KeyboardInterrupt:
        simple_ros2_node.get_logger().info('Ctrl-C detected, shutting down')
    finally:
        simple_ros2_node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
