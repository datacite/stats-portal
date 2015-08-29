FROM datacite1/nginx

EXPOSE 80

VOLUME [ "/var/log/nginx/" ]
VOLUME [ "/var/www/website/resolution-report/" ]

COPY static /var/www/website
