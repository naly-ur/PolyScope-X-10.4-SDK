ARG PACKAGE_NAME="simple-gripper"
ARG PYTHON_EXECUTABLE="main"

FROM --platform=linux/amd64 universalrobots/urcap_polyscopex_ros2:2.0.8-humble-dev as ros-dev

# install package dependencies
COPY requirements.txt /opt/ros2_ws/requirements.txt
RUN /venv/bin/pip install --disable-pip-version-check -r /opt/ros2_ws/requirements.txt

# copy source and build release
FROM ros-dev AS ros-builder
COPY src /opt/ros2_ws/src
RUN rm -rf /opt/ros2_ws/install
RUN colcon \
    build \
    --merge-install \
    --mixin build-testing-on release \
    --cmake-args --no-warn-unused-cli

# Copy the built package to runtime image
FROM --platform=linux/amd64 universalrobots/urcap_polyscopex_ros2:2.0.8-humble-runtime as final
ARG PACKAGE_NAME
ARG PYTHON_EXECUTABLE

COPY --from=ros-builder /venv /venv
COPY --from=ros-builder /opt/ros2_ws/install/lib /usr/lib

WORKDIR /usr/lib/$PACKAGE_NAME

# Run python executable
RUN ln -s /usr/lib/$PACKAGE_NAME/$PYTHON_EXECUTABLE /usr/lib/$PACKAGE_NAME/python3_executable
ENTRYPOINT ["/venv/bin/python3", "python3_executable"]
