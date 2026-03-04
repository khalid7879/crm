#!/bin/sh

echo "🚀 Starting Laravel container..."

# -------------------------------------------------
# Wait for MySQL
# -------------------------------------------------
echo "⏳ Waiting for database..."
until php -r "
new PDO(
    'mysql:host='.\$_ENV['DB_HOST'].';dbname='.\$_ENV['DB_DATABASE'],
    \$_ENV['DB_USERNAME'],
    \$_ENV['DB_PASSWORD']
);" >/dev/null 2>&1; do
  sleep 2
done
echo "✅ Database connected"

# -------------------------------------------------
# Create .env if missing
# -------------------------------------------------
if [ ! -f .env ]; then
  echo "📄 Creating .env"
  cp .env.example .env
fi

# -------------------------------------------------
# Generate APP_KEY if missing
# -------------------------------------------------
if ! grep -q '^APP_KEY=base64:' .env; then
  echo "🔑 Generating APP_KEY"
  php artisan key:generate
fi

# -------------------------------------------------
# Fix permissions
# -------------------------------------------------
echo "🔐 Fixing permissions"
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# -------------------------------------------------
# Optimize Laravel
# -------------------------------------------------
echo "⚡ Optimizing Laravel"
php artisan optimize:clear
php artisan optimize

# -------------------------------------------------
# Migrate database
# -------------------------------------------------
echo "🗄️ Running migrations"
php artisan migrate --force || true

# -------------------------------------------------
# Seed tenants (optional)
# -------------------------------------------------
if [ "$RUN_TENANT_SEED" = "true" ]; then
  echo "🌱 Running tenant seeder"
  yes | php artisan tenant:seed || true
fi

echo "✅ Laravel ready"
exec "$@"
