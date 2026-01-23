# Use the unprivileged version of Nginx for better security
FROM nginxinc/nginx-unprivileged:alpine

# Define a Build Argument (Sets a default if none is provided)
ARG SERVER_NAME=prod.inventory.normalsite.com

# Convert to Environment Variable (Nginx entrypoint uses this)
ENV SERVER_NAME=${SERVER_NAME}

# Switch to root to set up the environment
USER root

# SECURITY: Clean up existing default files
RUN rm /etc/nginx/conf.d/default.conf && \
    rm -rf /usr/share/nginx/html/*

# CRITICAL CHANGE: Copy to /templates with .template extension
# This tells the Nginx script to perform the variable substitution
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy your frontend static files
COPY index.html /usr/share/nginx/html/index.html

# SECURITY: Set ownership so the 'nginx' user can read the files
RUN chown -R nginx:nginx /usr/share/nginx/html /etc/nginx/templates

# Switch back to the non-privileged user (UID 101)
USER nginx

# Standard port for unprivileged Nginx
EXPOSE 8080

# The entrypoint script will now process the template before starting Nginx
CMD ["nginx", "-g", "daemon off;"]
