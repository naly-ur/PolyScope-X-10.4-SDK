from setuptools import setup

setup(
    name='simple_ros2_node',
    version='0.0.0',
    packages=['simple_ros2_node'],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/simple-ros2-node']),
        ('share/' + 'simple-ros2-node', ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    description='Simple ROS2 node, a sample where standard analog out 0 is sent to standard analog out 1',
    entry_points={
        'console_scripts': [
            'main = simple_ros2_node.main:main'
        ],
    },
)