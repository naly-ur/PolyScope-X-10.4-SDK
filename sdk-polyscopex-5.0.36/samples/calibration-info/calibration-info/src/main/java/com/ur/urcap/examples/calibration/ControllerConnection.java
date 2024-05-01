package com.ur.urcap.examples.calibration;

import java.io.BufferedInputStream;
import java.io.Closeable;
import java.io.DataInput;
import java.io.DataInputStream;
import java.io.IOException;
import java.net.Socket;
import java.nio.ByteBuffer;

public class ControllerConnection implements Closeable {

    private static final String HOST = "urcontrol-primary-read-only";
    private static final int PORT = 30011;

    private static final int NUM_JOINTS = 6;

    private final Socket socket;
    private final DataInput input;

    public ControllerConnection() throws IOException {
        socket = new Socket(HOST, PORT);
        input = new DataInputStream(new BufferedInputStream(socket.getInputStream()));
    }

    /**
     * Read the header of a package from the Controller
     * @return the package header
     * @throws IOException if a read-failure occurs
     */
    public PackageHeader readHeader() throws IOException {
        int messageLength = input.readInt();
        int messageType = input.readUnsignedByte();
        return new PackageHeader(messageLength, messageType);
    }

    /**
     * Read an unsigned 32-bit integer from the Controller
     * @return the integer
     * @throws IOException if a read-failure occurs
     */
    public long readUint32() throws IOException {
        final byte[] buf8 = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
        input.readFully(buf8, 4, 4);
        return ByteBuffer.wrap(buf8).getLong();
    }

    /**
     * Read an array of doubles from the Controller, with the length = the number of joints on the robot
     * @return the array of doubles
     * @throws IOException if a read-failure occurs
     */
    public double[] readDoubleArray() throws IOException {
        double[] result = new double[NUM_JOINTS];
        for (int i = 0; i < NUM_JOINTS; i++) {
            result[i] = input.readDouble();
        }
        return result;
    }

    /**
     * Read an array of unsigned 32-bit integers from the Controller, with the length = the number of joints on the robot
     * @return the array of integers
     * @throws IOException if a read-failure occurs
     */
    public long[] readUint32Array() throws IOException {
        long[] result = new long[NUM_JOINTS];
        for (int i = 0; i < result.length; i++) {
            result[i] = readUint32();
        }
        return result;
    }

    /**
     * Ignore a package from the controller with given size
     * @param packageSize the size of the package to ignore in bytes
     * @throws IOException if a read-failure occurs
     */
    public void ignorePackage(int packageSize) throws IOException {
        input.skipBytes(packageSize);
    }

    @Override
    public void close() throws IOException {
        if (socket != null && !socket.isClosed()) {
            socket.close();
        }
    }
}
