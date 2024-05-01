package com.ur.urcap.examples.calibration;

import java.io.IOException;

public class CalibrationReader {

    private static final int HEADER_SIZE = 5;
    private static final int ROBOT_STATE_MESSAGE_TYPE = 16;
    private static final int KINEMATICS_INFO_PACKAGE_TYPE = 5;

    /**
     * Reads the output of the Controller's primary interface, until a Kinematics Info message appears
     * @return the calibration info from the Kinematics message
     */
    public CalibrationInfo getCalibrationInfo() throws IOException {
        return readCalibrationMessage();
    }

    /**
     * Connects to the Controller's primary interface and ignores messages until the Kinematic Info one appears.
     * For more information on the primary interface, please see
     * <a href="https://www.universal-robots.com/articles/ur/interface-communication/remote-control-via-tcpip/">online documentation</a>
     * @return the calibration data from the Kinematic Info message
     * @throws IOException if a read failure occurs
     */
    private CalibrationInfo readCalibrationMessage() throws IOException {
        CalibrationInfo result = null;
        boolean foundKinematicsMessage = false;
        try (ControllerConnection controllerConnection = new ControllerConnection()) {
            while (!foundKinematicsMessage) {
                int readBytes = 0;
                PackageHeader messageHeader = controllerConnection.readHeader();
                readBytes += HEADER_SIZE;
                if (messageHeader.packageType() == ROBOT_STATE_MESSAGE_TYPE) {
                    boolean hasMoreSubPackages = true;
                    while (hasMoreSubPackages) {
                        PackageHeader packageHeader = controllerConnection.readHeader();
                        readBytes += HEADER_SIZE;
                        if (packageHeader.packageType() == KINEMATICS_INFO_PACKAGE_TYPE) {
                            result = readKinematicsInfo(controllerConnection);
                            readBytes += packageHeader.packageLength() - HEADER_SIZE;
                            foundKinematicsMessage = true;
                        } else {
                            //Ignore
                            controllerConnection.ignorePackage(packageHeader.packageLength() - HEADER_SIZE);
                            readBytes += packageHeader.packageLength() - HEADER_SIZE;
                        }
                        if (readBytes == messageHeader.packageLength()) {
                            hasMoreSubPackages = false;
                        }
                    }
                } else {
                    // Ignore
                    controllerConnection.ignorePackage(messageHeader.packageLength() - HEADER_SIZE);
                }
            }
        }

        return result;
    }

    private static CalibrationInfo readKinematicsInfo(ControllerConnection controllerConnection) throws IOException {
        long[] jointChecksums = controllerConnection.readUint32Array();
        double[] theta = controllerConnection.readDoubleArray();
        double[] a = controllerConnection.readDoubleArray();
        double[] d = controllerConnection.readDoubleArray();
        double[] alpha = controllerConnection.readDoubleArray();
        long calibrationStatus = controllerConnection.readUint32();

        return new CalibrationInfo(jointChecksums, theta, a, d, alpha, calibrationStatus);
    }

}
