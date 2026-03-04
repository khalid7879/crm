# =====================================
# STAGE 1: Composer Dependencies
# =====================================
FROM composer:2.7 AS builder

WORKDIR /app

COPY composer.json composer.lock ./

# Install ALL deps (Faker needed for tenant seeding)
RUN composer install \
    --prefer-dist \
    --optimize-autoloader \
    --no-interaction \
    --no-scripts

COPY . .

# =====================================
# STAGE 2: PHP Runtime
# =====================================
FROM php:8.2-fpm-alpine

WORKDIR /var/www

RUN apk add --no-cache \
    bash \
    curl \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    mysql-client \
 && docker-php-ext-install \
    pdo \
    pdo_mysql \
    intl \
    zip \
    opcache

# PHP OPCache (performance)
RUN echo "opcache.enable=1" > /usr/local/etc/php/conf.d/opcache.ini \
 && echo "opcache.enable_cli=1" >> /usr/local/etc/php/conf.d/opcache.ini \
 && echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini \
 && echo "opcache.max_accelerated_files=20000" >> /usr/local/etc/php/conf.d/opcache.ini \
 && echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini
 
# PHP memory limit
RUN echo "memory_limit=1024M" > /usr/local/etc/php/conf.d/memory.ini


COPY --from=builder /app /var/www
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh \
 && chown -R www-data:www-data /var/www

USER www-data

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]

