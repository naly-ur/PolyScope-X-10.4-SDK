/// <reference lib="webworker" />
import {
    ApplicationBehaviorAPI,
    ApplicationBehaviors,
    registerApplicationBehavior,
    Ros2Client,
    ScriptBuilder
} from '@universal-robots/contribution-api';
import { GripperApplicationNode } from './gripper-application.node';
import {
    ROS_OPEN_CLOSE,
    ROS_SET_FORCE,
    ROS_STATUS,
} from '../../RosHelper';
import { URCAP_ROS_NAMESPACE } from '../../../generated/contribution-constants';

const getTopicPath = (ros2Client: Ros2Client, topic: string): Promise<string> =>
    ros2Client.getTopicPath(true, topic, URCAP_ROS_NAMESPACE);

const generateFactoryArguments = async (topic: string, topicType: string, ros2Client: Ros2Client) =>
    `topic="${(await getTopicPath(ros2Client, topic))}", msg_type="${topicType}"`;

const generatePublisherCode = async (topic: string, topicType: string, ros2Client: Ros2Client) =>
    `ros_publisher_factory(${await generateFactoryArguments(topic, topicType, ros2Client)})
`;

const generateSubscriberCode = async (topic: string, topicType: string, ros2Client: Ros2Client) =>
    `ros_subscriber_factory(
    ${await generateFactoryArguments(topic, topicType, ros2Client)},
    durability="transient_local",
    reliability="reliable")
`;

const createGripperApplicationNode = (): GripperApplicationNode => ({
    type: 'ur-simple-gripper-application',
    version: '1.0.0', // version is required
    force: 100,
});

const behaviors: ApplicationBehaviors = {
    factory: createGripperApplicationNode,
    generatePreamble: async (applicationNode: GripperApplicationNode) => {
        const api = new ApplicationBehaviorAPI(self);
        const ros2Client = api.ros2Client;
        return new ScriptBuilder().addStatements(
            `
############################### Simple Gripper ###############################

# Robot Configuration
set_target_payload(5, [0, 0, 0])
set_tcp(p[0, 0, 0.1, 0, 0, 0])
set_tool_voltage(24)
set_tool_communication(True, 1000000, 2, 1, 1.5, 3.5)

# Program specific variables and functions
global ur_sg_is_gripper_initialized = False
global ur_sg_gripper_status = "N/A"
global ur_sg_step_time = get_steptime()

def ur_sg_init_gripper():
    # Lazy initialization of the gripper, to be called once when the first gripper program-node is executed
    if ur_sg_is_gripper_initialized == False:
        ur_sg_is_gripper_initialized = True
        global ur_sg_force_pub = ${await generatePublisherCode(ROS_SET_FORCE, 'std_msgs/msg/Int64', ros2Client)}
        global ur_sg_action_pub = ${await generatePublisherCode(ROS_OPEN_CLOSE, 'std_msgs/msg/String', ros2Client)}
        global ur_sg_status_sub = ${await generateSubscriberCode(ROS_STATUS, 'std_msgs/msg/String', ros2Client)}
    end
end

def ur_sg_open_close(action="CLOSE", blocking=True):
    ur_sg_init_gripper()
    ur_sg_force_pub.write(struct(data=floor(${applicationNode.force})))
    ur_sg_action_pub.write(struct(data=action))
    wanted_status = "CLOSED"
    if action == "OPEN":
        wanted_status = "OPEN"
    end
    if blocking:
        sync()
        local busy = True
        global ur_sg_time = 0.0
        while (busy and (ur_sg_time < 3)):
            ur_sg_update_gripper_status()
            busy = ur_sg_gripper_status != wanted_status
            ur_sg_time = ur_sg_time + ur_sg_step_time
            sync()
        end
        if ur_sg_time >= 3:
            request_boolean_from_primary_client("Open/Close timed out. Continue?")
        end
    end
end

def ur_sg_update_gripper_status():
    if ur_sg_status_sub.wait(ur_sg_step_time):
        local response = ur_sg_status_sub.read()
        ur_sg_gripper_status = response.data
    end
end
    `
        );
    },
};

registerApplicationBehavior(behaviors);
