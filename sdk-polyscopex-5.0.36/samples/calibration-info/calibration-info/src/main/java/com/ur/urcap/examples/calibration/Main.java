package com.ur.urcap.examples.calibration;

import java.io.IOException;

class Main {

    private static volatile boolean running = true;

    /**
     * Main entrypoint of the URCapX container
     */
    public static void main(String[] args) throws IOException {
        addShutdownHandler();
        CalibrationReader calibrationReader = new CalibrationReader();
        CalibrationInfo calibrationInfo = calibrationReader.getCalibrationInfo();
        System.out.println(calibrationInfo);

        while (running) {
            // Work with calibrationInfo
            // ...
            Thread.onSpinWait();
        }
        System.out.println("URCap was shut down!");
    }

    private static void addShutdownHandler() {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutting down...");
            running = false;
        }));
    }

}