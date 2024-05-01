import {
    IRosTypeRclInterfacesSetParametersRequest,
    IRosTypeRclInterfacesSetParametersResponse
} from '@universal-robots/ros2-interfaces';
import {
    DurabilityPolicy,
    HistoryPolicy,
    LivelinessPolicy,
    QoSProfile,
    ReliabilityPolicy,
    Ros2Client
} from '@universal-robots/contribution-api';
import {URCAP_ROS_NAMESPACE} from '../generated/contribution-constants';
import {Observable} from 'rxjs';

export const ROS_SET_FORCE = 'set_force';
export const ROS_STATUS = 'status';
export const ROS_OPEN_CLOSE = 'open_close';

export enum GripperAction {
    close = 'CLOSE',
    open = 'OPEN',
}

export const openStatus = 'OPEN';
export const closedStatus = 'CLOSED';

export class RosHelper {
    public static callOpenCloseService(
        ros2Client: Ros2Client,
        action: GripperAction = GripperAction.close
    ): Promise<IRosTypeRclInterfacesSetParametersResponse> {
        return this.callService(ros2Client, ROS_OPEN_CLOSE, this.createParametersObject(ROS_OPEN_CLOSE, action.toUpperCase()));
    }

    public static callSetForceService(
        ros2Client: Ros2Client,
        force: number = 0
    ): Promise<IRosTypeRclInterfacesSetParametersResponse> {
        return this.callService(ros2Client, ROS_SET_FORCE, this.createParametersObject(ROS_SET_FORCE, '', force));
    }

    public static subscribeToStatusTopic(ros2Client: Ros2Client): Observable<{data: string}> {
        const topicPath = ros2Client.getTopicPath(true,ROS_STATUS,URCAP_ROS_NAMESPACE);
        const qosProfile = new QoSProfile(
            HistoryPolicy.KEEP_LAST,
            10,
            ReliabilityPolicy.RELIABLE,
            DurabilityPolicy.TRANSIENT_LOCAL,
            {seconds: 0, nanoseconds: 0},
            {seconds: 0, nanoseconds: 0},
            LivelinessPolicy.AUTOMATIC,
            {seconds: 0, nanoseconds: 0},
            false);
        return ros2Client.createSubscription('std_msgs/msg/String', topicPath, qosProfile);
    }

    private static callService(
        ros2Client: Ros2Client,
        serviceName: string,
        request: IRosTypeRclInterfacesSetParametersRequest
    ): Promise<IRosTypeRclInterfacesSetParametersResponse> {
        const serviceType = 'rcl_interfaces/srv/SetParameters';
        const qos = QoSProfile.default;
        qos.depth = 1;
        const servicePath = ros2Client.getServicePath(true, serviceName, URCAP_ROS_NAMESPACE);
        return ros2Client.callService(serviceType, servicePath, request, qos);
    }

    private static createParametersObject(serviceName: string, stringValue: string = '', intValue: number = 0) {
        const argumentValues: IRosTypeRclInterfacesSetParametersRequest = {
            parameters: [
                {
                    name: serviceName,
                    value: {
                        type: 0,
                        bool_value: false,
                        integer_value: +intValue,
                        double_value: 0.0,
                        string_value: stringValue,
                        byte_array_value: [],
                        bool_array_value: [],
                        integer_array_value: [],
                        double_array_value: [],
                        string_array_value: [],
                    },
                },
            ]
        };
        return argumentValues;
    }
}
