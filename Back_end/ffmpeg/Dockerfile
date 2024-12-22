FROM ubuntu:20.04
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /media
COPY stream.sh /media/
RUN chmod +x /media/stream.sh
CMD ["./stream.sh"]
