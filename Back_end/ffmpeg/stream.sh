#!/bin/bash

# Đợi NGINX khởi động
sleep 5

while true; do
    ffmpeg -i rtmp://nginx-c:1935/live/stream \
           -c:v copy \
           -c:a aac \
           -b:a 128k \
           -f flv rtmp://nginx-c:1935/hls/stream

    # Nếu stream bị ngắt, đợi 5 giây rồi thử lại
    sleep 5
done
