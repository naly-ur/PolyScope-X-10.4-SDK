from setuptools import setup

setup(
    name='<%= ros2NodeName %>',
    version='0.0.0',
    packages=['<%= ros2NodeName %>'],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/<%= ros2NodeName %>']),
        ('share/' + '<%= ros2NodeName %>', ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    description='<%= ros2NodeDesc %> description',
    entry_points={
        'console_scripts': [
            'main = <%= ros2NodeName %>.main:main'
        ],
    },
)