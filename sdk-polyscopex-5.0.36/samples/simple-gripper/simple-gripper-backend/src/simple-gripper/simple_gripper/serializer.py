import pickle4 as pickle

path_to_serial = None


def init_serial_communication(serial_path):
    global path_to_serial
    print('Initializing serial communication at %s' % serial_path)
    path_to_serial = serial_path


def serial_write(data):
    global path_to_serial
    if path_to_serial is not None:
        outfile = open(str(path_to_serial), "ab")
        pickle.dump(data, outfile, pickle.HIGHEST_PROTOCOL)
        return

    raise Exception("Path to serial not set")
