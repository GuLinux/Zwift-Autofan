FROM python:alpine
# Run with --device /dev/gpiomem
ENV CFLAGS=-fcommon
RUN apk add --update npm build-base
RUN pip3 install RPi.GPIO

COPY . /app
WORKDIR /app
RUN pip3 install -r requirements.txt
WORKDIR /app/frontend
RUN rm -rf node_modules && npm install && npm run build
WORKDIR /app
CMD sh ./start-server --with-threads --no-debugger --no-reload

