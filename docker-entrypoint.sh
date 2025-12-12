#!/bin/sh
set -e

# wait-for (optional) or simple retry logic could be added here
echo "Running prisma migrate deploy..."
npx prisma migrate deploy

echo "Starting app..."
exec "$@"
