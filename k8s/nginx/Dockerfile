# Set the base image
FROM nginx:latest

# Set Timezone to Europe/Berlin
RUN rm /etc/localtime \
        && ln -s /usr/share/zoneinfo/Europe/Berlin /etc/localtime

# Expose http Port
EXPOSE 80

#copy sources
ADD dist /var/www/html/dist

# Add Config Files
ADD k8s/nginx/nginx.conf /etc/nginx
ADD k8s/nginx/default.conf /etc/nginx/conf.d
ADD k8s/nginx/buffers.conf /etc/nginx/conf.d
#ADD k8s/nginx/ssl/wildcard_selfsigned.crt /etc/ssl/certs/
#ADD k8s/nginx/ssl/wildcard_selfsigned.key /etc/ssl/private/
RUN mkdir -p /var/log/workpro/ && touch /var/log/workpro/frontend_server.log
RUN ln -sf /proc/1/fd/1 /var/log/workpro/frontend_server.log
