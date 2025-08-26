host="$1"
shift
cmd="$@"

echo "Waiting for Postgres at $host:5432..."

until nc -z "$host" 5432; do
  sleep 1
done

echo "Postgres is up - running migrations..."
bun run migrate

echo "Running seed script..."
bun run populate

echo "Starting app with: $cmd"
exec $cmd