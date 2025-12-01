FROM php:8.2-apache-bookworm

WORKDIR /var/www/html

# Instalar dependencias del sistema y extensiones necesarias
RUN apt-get update && apt-get install -y \
        libicu-dev \
        libsqlite3-dev \
        git \
        unzip \
    && docker-php-ext-install intl pdo pdo_sqlite \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . /var/www/html

RUN composer install --no-interaction --no-dev --prefer-dist --optimize-autoloader || true

RUN chown -R www-data:www-data writable && \
    chmod -R 775 writable

RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

EXPOSE 80

CMD ["apache2-foreground"]



