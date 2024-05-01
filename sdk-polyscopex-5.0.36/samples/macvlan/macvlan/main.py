from flask import Flask
from pyroute2 import IPRoute
import socket

app = Flask(__name__)
global my_socket


@app.route("/hello", methods=["GET"])
def alive():
    return "world", 201


@app.route("/set_interface", methods=["PUT"])
def set_interface():
    global my_socket
    # Define the IP address and interface name
    subnet_mask = "22"
    ip_address = "192.168.1.10"
    interface = "eth1"

    #   Verify if the network interface exists
    with IPRoute() as ipr:
        #   https://docs.pyroute2.org/iproute.html#responses-as-lists
        #   If the network exists it will return a list with size larger than 0
        if len(ipr.link_lookup(ifname=interface)) == 0:
            return "The network device {0} does not exists".format(interface), 401

        nif_idx = ipr.link_lookup(ifname=interface)[0]

        #   Check if the network interface is up, before trying to set the IP
        if ipr.get_links(index=nif_idx)[0].get_attr("IFLA_OPERSTATE") == "UP":
            #   If the network interface is already up the set_interface might have been run already
            #       check if the ip address is the correct one then
            if is_ip_already_in_network(ipr, nif_idx, ip_address, subnet_mask):
                #   If the IP address has already been set, check if the socket is correctly bound
                if socket_is_bound_to_interface(my_socket, interface):
                    return "interface {0} had already been set".format(interface), 201
            ipr.link("set", index=nif_idx, state="down")

        #   Check if there are existing ip addresses on the network interface
        if not is_ip_already_in_network(ipr, nif_idx, ip_address, subnet_mask):
            ipr.addr("add", index=nif_idx, address=ip_address, prefixlen=int(subnet_mask))
        ipr.link("set", index=nif_idx, state="up")

        my_socket = bind_socket_to_interface(ip_address, interface)

    if not socket_is_bound_to_interface(my_socket, interface):
        return "socket {0} was not bound to interface {1}".format(my_socket, interface), 401

    return "interface {0} has been set".format(interface), 201


def is_ip_already_in_network(ipr, nif_idx, given_ip_addr, given_subnet_mask):
    ip_addresses = []
    for addr in ipr.get_addr(index=nif_idx):
        ip_addresses.append((addr.get_attr("IFA_ADDRESS"), addr["prefixlen"]))

    for ip, subnet in ip_addresses:
        if str(ip) == given_ip_addr and str(subnet) == given_subnet_mask:
            # The ip address with subnet mask was already defined for the network interface
            return True
    return False


def bind_socket_to_interface(ip_address, interface):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Set the SO_BINDTODEVICE option to bind the socket to the interface
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BINDTODEVICE, bytes(interface, "utf-8"))

    # Bind the socket to a specific IP address
    sock.bind((ip_address, 0))

    return sock


def socket_is_bound_to_interface(sock, interface):
    socket_info = sock.getsockopt(socket.SOL_SOCKET, socket.SO_BINDTODEVICE, 256)
    return bytes(interface, "utf-8") in socket_info


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8001)
