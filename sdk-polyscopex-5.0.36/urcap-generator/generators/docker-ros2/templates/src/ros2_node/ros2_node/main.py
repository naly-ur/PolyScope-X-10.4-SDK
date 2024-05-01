"""Template ROS2 UR Backend"""

import os

import rclpy
from rclpy.node import Node


class TemplateROS2Node(Node):
    """Creates a ROS Node"""

    def __init__(self):
        self.namespace = os.getenv('ROS2_NAMESPACE')
        super().__init__('<%= ros2NodeName %>')

        # From here you can subscribe to data or use service to set values


def main(args=None):
    """Main Entrance"""
    rclpy.init(args=args)
    template_ros2_node = TemplateROS2Node()
    template_ros2_node.get_logger().info('ROS2 Node started')

    try:
        rclpy.spin(template_ros2_node)
    except KeyboardInterrupt:
        template_ros2_node.get_logger().info('Ctrl-C detected, shutting down')
    finally:
        template_ros2_node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
