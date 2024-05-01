package com.ur.urcap.examples.calibration;

/**
 * Standard header used by all messages from the primary interface of the Controller
 * @param packageLength length of the message
 * @param packageType type of the message
 */
record PackageHeader(int packageLength, int packageType) {
}
