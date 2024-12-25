sed -i "s|INIT_DATABASE=.*|INIT_DATABASE=false|" .env

docker-compose pull

docker-compose down

docker-compose up -d