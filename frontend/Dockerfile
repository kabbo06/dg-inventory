# Use the unprivileged version of Nginx for better security (standard for K8s)
FROM nginxinc/nginx-unprivileged:alpine

# Switch to root temporarily to perform clean-up and set permissions
USER root

# SECURITY: Remove default Nginx config and any existing static files
RUN rm /etc/nginx/conf.d/default.conf && \
    rm -rf /usr/share/nginx/html/*

# Copy your custom universal Nginx gateway configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy your interactive frontend application (Updated for MongoDB _id)
COPY index.html /usr/share/nginx/html/index.html

# SECURITY: Ensure the nginx user owns the web content and config
RUN chown -R nginx:nginx /usr/share/nginx/html /etc/nginx/conf.d

# Switch back to the non-privileged user (UID 101)
USER nginx

# Port 8080 is the standard for unprivileged Nginx
EXPOSE 8080

# Run Nginx in the foreground so Docker can track the process
CMD ["nginx", "-g", "daemon off;"]
