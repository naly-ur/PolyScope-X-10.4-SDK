import rclpy
import os
from enum import Enum
from rclpy.node import Node
from rcl_interfaces.srv import SetParameters
from rcl_interfaces.msg import SetParametersResult
from rclpy.qos import QoSProfile, QoSDurabilityPolicy, QoSHistoryPolicy, QoSReliabilityPolicy, QoSLivelinessPolicy
from std_msgs.msg import String

#   /dev/ur-ttylink/ttyTool is the serial path given to the serial connector close to the tool flange
GRIPPER_SERIAL_PATH = "dev/ur-ttylink/ttyTool"

#   If the URCap is being tested in simulator a simulated serial is imported and used
if os.path.exists(GRIPPER_SERIAL_PATH):
    from simple_gripper.serializer import serial_write, init_serial_communication
else:
    from simple_gripper.serializer_sim import serial_write, init_serial_communication

SIMULATED_GRIPPER_STATE_CHANGE_FREQUENCY = 0.5


class GripperState(Enum):
    """
    Enums describing the states the gripper can be in
    """
    CLOSED = 0
    CLOSING = 1
    OPENING = 2
    OPEN = 3

    def __str__(self):
        """
        Overwriting the default behavior to return only the string part of the enum i.e. CLOSED or OPEN
        """
        return self.name


class SampleGripper(Node):

    def __init__(self, namespace):
        super().__init__('URCap_simple_gripper', namespace=namespace)

        self.get_logger().info('Initializing simple-gripper ROS2 Node')

        """
        Initial values of the gripper
        """
        self.gripper_state = GripperState.CLOSED
        self.gripper_force = 0.0

        """
        Setting up of the topics to publish and subscribe on, 
        and two callable service for open/close and setting the gripper force
        """
        self.setup_published_topic()
        self.setup_subscription()
        self.setup_service_open_close()
        self.setup_service_set_force()

        init_serial_communication(GRIPPER_SERIAL_PATH)

        self.get_logger().info('Started ROS2 Node with namespace ' + namespace + '/' + self.get_name())

        """
        Simulating the gripper changing states
        """
        self.internal_counter_for_changing_state = -1
        self.create_timer(SIMULATED_GRIPPER_STATE_CHANGE_FREQUENCY, self.simulate_gripper_state_change)

    def simulate_gripper_state_change(self):
        """
        Helper function for testing the URCap on a robot or in simulation without a gripper.
        Called with a frequency by the ROS-timer after a specified time it will change the self.gripper_state
        """

        #   Comment in below if you want to publish the self.gripper_state every SIMULATED_GRIPPER_STATE_CHANGE_FREQUENCY
        # self.publish_status()

        if self.internal_counter_for_changing_state == -1:
            return

        if self.internal_counter_for_changing_state > 0:
            self.internal_counter_for_changing_state -= 1
            return

        if self.internal_counter_for_changing_state == 0:
            self.internal_counter_for_changing_state -= 1
            if self.gripper_state is GripperState.CLOSING:
                self.gripper_state = GripperState.CLOSED
            elif self.gripper_state is GripperState.OPENING:
                self.gripper_state = GripperState.OPEN

        #   Leave this commented in if you only want to publish self.gripper_state on state changes
        self.publish_status()

    def publish_status(self):
        msg = String()
        msg.data = str(self.gripper_state)
        self.status_publisher.publish(msg)

    def setup_published_topic(self):
        """
        Setting up the ROS topic publisher with a Quality of service and a topic name i.e. status
        """
        qos_profile = QoSProfile(depth=10)
        qos_profile.history = QoSHistoryPolicy.KEEP_LAST
        qos_profile.liveliness = QoSLivelinessPolicy.AUTOMATIC
        qos_profile.reliability = QoSReliabilityPolicy.RELIABLE
        qos_profile.durability = QoSDurabilityPolicy.TRANSIENT_LOCAL

        STATUS_TOPIC = self.get_name() + '/status'
        self.status_publisher = self.create_publisher(String, STATUS_TOPIC, qos_profile)
        self.publish_status()

    def open_gripper(self):
        if self.gripper_state is not GripperState.OPEN and self.gripper_state is not GripperState.OPENING:
            self.get_logger().info("Opening gripper")
            self.gripper_state = GripperState.OPENING

            NUMBER_OF_SECONDS = 5
            self.internal_counter_for_changing_state = int(
                NUMBER_OF_SECONDS * 1 / SIMULATED_GRIPPER_STATE_CHANGE_FREQUENCY)

            try:
                GRIPPER_OPEN = "1"
                serial_write(GRIPPER_OPEN)
            except Exception as e:
                self.get_logger().error("Failed writing to serial with: " + str(e))

            return True, "Opening gripper"
        else:
            self.get_logger().warn("Gripper already open or opening")
            return False, "Gripper already open or opening"

    def close_gripper(self):
        """
        Callback function for closing the gripper used by both the topic publisher and the service.
        """
        if self.gripper_state is not GripperState.CLOSED and self.gripper_state is not GripperState.CLOSING:
            self.get_logger().info("Closing gripper")
            self.gripper_state = GripperState.CLOSING

            NUMBER_OF_SECONDS = 5
            self.internal_counter_for_changing_state = int(
                NUMBER_OF_SECONDS * 1 / SIMULATED_GRIPPER_STATE_CHANGE_FREQUENCY)

            try:
                GRIPPER_CLOSE = "0"
                serial_write(GRIPPER_CLOSE)
            except Exception as e:
                self.get_logger().error("Failed writing to serial with: " + str(e))

            return True, "Closing gripper"
        else:
            self.get_logger().warn("Gripper already closed or closing")
            return False, "Gripper already closed or closing"

    def setup_subscription(self):
        """
        Setting up the back end subscription to the topic published by the frontend.
        Here the messages called from the Program Node will be handled.

        First the callback function responsible for handling messages on the topic is created, which is
        passed to the create_subscription function.
        """

        def callback(msg):
            self.get_logger().debug("Subscription callback: " + str(msg))
            if msg.data == 'CLOSE':
                self.close_gripper()
            elif msg.data == 'OPEN':
                self.open_gripper()
            else:
                self.get_logger().warn('Unknown open_close message: %s' % msg.data)

        """
        Setting up the Quality of Service profile for the subscription service.
        """
        qos_profile = QoSProfile(depth=1)
        qos_profile.history = QoSHistoryPolicy.KEEP_LAST
        qos_profile.liveliness = QoSLivelinessPolicy.AUTOMATIC
        qos_profile.reliability = QoSReliabilityPolicy.RELIABLE
        qos_profile.durability = QoSDurabilityPolicy.VOLATILE

        SUBSCRIPTION_OPEN_CLOSE = self.get_name() + '/open_close'
        self.get_logger().info("Subscribing on: " + SUBSCRIPTION_OPEN_CLOSE)
        self.create_subscription(String, SUBSCRIPTION_OPEN_CLOSE, callback, qos_profile)

    def setup_service_open_close(self):
        """
        Setting up ROS service in the backend that can be used to change the state of the gripper from the frontend.
        This service is called by the frontend with a string_value: CLOSE or OPEN
        """

        def callback(request, response):
            msg = request.parameters.pop()
            string_value = msg.value.string_value
            if string_value == "CLOSE":
                success, reason = self.close_gripper()
            elif string_value == "OPEN":
                success, reason = self.open_gripper()
            else:
                self.get_logger().warn("Service received wrong string value")
                reason = "Service received wrong string value: " + str(string_value) + " should be: CLOSE or OPEN"
                success = False

            return SampleGripper.create_set_params_result(response, reason, success)

        SERVICE_OPEN_CLOSE = self.get_name() + "/open_close"
        self.create_service(SetParameters, SERVICE_OPEN_CLOSE,
                            lambda request, response: callback(request, response))

    def setup_service_set_force(self):
        """
        Setting up ROS service that can set a certain force used when closing the gripper.
        This service is called by the frontend with a double_value
        """

        def callback(request, response):
            msg = request.parameters.pop()
            self.gripper_force = msg.value.double_value
            reason = 'Force set'
            success = True

            return SampleGripper.create_set_params_result(response, reason, success)

        SERVICE_SET_FORCE = self.get_name() + "/set_force"
        self.create_service(SetParameters, SERVICE_SET_FORCE,
                            lambda request, response: callback(request, response))

    @staticmethod
    def create_set_params_result(response, reason, success=True):
        """
        Due to custom ROS-messages is not yet implemented we are
        temporarily using this SetParameters from the rcl_interfaces

        More information about this in the Known Issues part of the Alpha-README
        """
        resp = SetParametersResult()
        resp.successful = success
        resp.reason = reason
        response.results.append(resp)
        return response


def main(args=None):
    rclpy.init(args=args)

    robot_namespace = os.getenv('ROS2_NAMESPACE')
    vendor_namespace = robot_namespace + '/' + 'Vendor_universal_robots'

    simple_gripper_node = SampleGripper(vendor_namespace)

    try:
        rclpy.spin(simple_gripper_node)
    finally:
        simple_gripper_node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
