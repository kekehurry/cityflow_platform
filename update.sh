# Detect OS and set sed command accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    SED_COMMAND="sed -i ''"
else
    SED_COMMAND="sed -i"
fi


$SED_COMMAND "s|INIT_DATABASE=.*|INIT_DATABASE=false|" .env

docker-compose pull

docker-compose down

docker-compose up -d