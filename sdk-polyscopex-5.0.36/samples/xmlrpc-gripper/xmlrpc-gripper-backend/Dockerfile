FROM python:3.11-alpine

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

ENV APP_NAME xmlrpc-gripper
WORKDIR /usr/local/src/${APP_NAME}
COPY src .

ENTRYPOINT ["python", "xmlrpc-gripper.py" ]

EXPOSE 40405
