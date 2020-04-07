FROM mongo
ENV TIME_ZONE=EST
RUN echo ${TIME_ZONE} >/etc/timezone && \
    ln -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata
RUN echo "Timezone: $TIME_ZONE  => Current Time: `date`"
