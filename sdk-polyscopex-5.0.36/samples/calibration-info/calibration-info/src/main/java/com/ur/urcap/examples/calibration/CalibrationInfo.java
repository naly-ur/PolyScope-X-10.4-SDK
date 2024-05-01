package com.ur.urcap.examples.calibration;

import java.util.Arrays;

/**
 * Value-object defining the calibration of the robot
 */
public record CalibrationInfo(long[] jointChecksums, double[] theta, double[] a, double[] d, double[] alpha,
                              long calibrationStatus) {
    @Override
    public String toString() {
        return "CalibrationInfo{" +
                "\n jointChecksums=" + Arrays.toString(jointChecksums) +
                ",\n theta=" + Arrays.toString(theta) +
                ",\n a=" + Arrays.toString(a) +
                ",\n d=" + Arrays.toString(d) +
                ",\n alpha=" + Arrays.toString(alpha) +
                ",\n calibrationStatus=" + calibrationStatus +
                '}';
    }
}
