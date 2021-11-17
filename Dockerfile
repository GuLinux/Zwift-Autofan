FROM python

# Run with --device /dev/gpiomem
ENV CFLAGS=-fcommon
RUN pip3 install -r requirements.txt
