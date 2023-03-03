# sword-be-challenge

# How to start

1 - Create a .env file in the root directory with the variables provided in the .env example.

** With Docker **
2 - Install docker: https://docs.docker.com/get-docker/
3 - Run the following commands, under the root directory
docker build -t nodeapp .
docker-compose up --build --force-recreate
4 - Run the following command, under the root directory, to create the app tables
npx sequelize-cli db:migrate
