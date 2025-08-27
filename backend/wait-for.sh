host="$1"
shift
cmd="$@"

echo "Waiting for Postgres at $host:5432..."

until nc -z "$host" 5432; do
  sleep 1
done

echo "Postgres is up - running migrations..."
bun run migrate

echo "Checking if database is already populated..."

DB_URL="postgres://myuser:mypassword@$host:5432/mydatabase"


COUNT=$(psql "$DB_URL" -tAc "SELECT COUNT(*) FROM points;" 2>/dev/null || echo 0)

if [ "$COUNT" -eq 0 ]; then
  echo "Database empty - running seed script..."
  bun run populate
else
  echo "Database already populated - skipping seed."
fi

echo "Starting app with: $cmd"
exec $cmd
