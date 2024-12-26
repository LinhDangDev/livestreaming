FROM ubuntu:latest

# Install dependencies
RUN apt-get update && \
  apt-get install -y build-essential libpcre3-dev libssl-dev zlib1g-dev wget git ffmpeg && \
  rm -rf /var/lib/apt/lists/*

# Download and extract NGINX
WORKDIR /tmp
RUN wget http://nginx.org/download/nginx-1.24.0.tar.gz && \
  tar -zxf nginx-1.24.0.tar.gz && \
  rm nginx-1.24.0.tar.gz

# Clone RTMP module
RUN git clone https://github.com/arut/nginx-rtmp-module.git

# Build NGINX with RTMP module
WORKDIR /tmp/nginx-1.24.0
RUN ./configure \
  --prefix=/usr/local/nginx \
  --with-http_ssl_module \
  --add-module=../nginx-rtmp-module \
  --with-debug \
  --with-ld-opt="-Wl,-rpath,/usr/local/nginx/modules" && \
  make && \
  make install

# Create necessary directories
RUN mkdir -p /usr/local/nginx/conf/conf.d && \
  mkdir -p /usr/local/nginx/html/hls && \
  chmod -R 777 /usr/local/nginx/html/hls

# Forward logs
RUN ln -sf /dev/stdout /usr/local/nginx/logs/access.log && \
  ln -sf /dev/stderr /usr/local/nginx/logs/error.log

# Copy configurations
COPY nginx.conf /usr/local/nginx/conf/nginx.conf
COPY rtmp.conf /usr/local/nginx/conf/rtmp.conf

# Verify nginx configuration
RUN /usr/local/nginx/sbin/nginx -t

# Expose ports
EXPOSE 80 1935

# Start NGINX
CMD ["/usr/local/nginx/sbin/nginx", "-g", "daemon off;"]
