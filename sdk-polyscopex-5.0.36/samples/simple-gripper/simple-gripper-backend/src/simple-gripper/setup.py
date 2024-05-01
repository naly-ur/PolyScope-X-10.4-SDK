from setuptools import setup

setup(
    name='simple_gripper',
    version='0.0.0',
    packages=['simple_gripper'],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/simple-gripper']),
        ('share/' + 'simple-gripper', ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    description='simple-gripper description',
    entry_points={
        'console_scripts': [
            'main = simple_gripper.main:main'
        ],
    },
)