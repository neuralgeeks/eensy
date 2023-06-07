# <%= dasherize(name) %> service

A service that runs on eensy.

# Enviroment setup:

Make sure you have node installed on your machine. You can install it from [here](https://nodejs.org/en/download/).

Alternatively, you can use [nvm](https://github.com/nvm-sh/nvm) to manage your node versions.

## Database

Make sure you have a database running locally. You can use docker or alternatively you can install a database provider (such as MySQL) locally and run it as a service.

Here is an example of how to run a MySQL database locally using docker:

```
docker run --name eensy-mysql -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 -d mysql:latest
```

Create a `test` and a `dev` database with the credentials you'd like. Make sure that you are using a provider that is supported by prisma. Here is a list of [supported providers](https://www.prisma.io/docs/reference/database-reference/supported-databases). If you decide to use a provider different of `mysql` make sure to update your `prisma/schema.prisma` file accordingly.

Keep your databases connection data on hand, it will be placed onto the `.env` file later.

## Redis

Make sure you have a redis server running locally. You can use docker or alternatively you can install redis locally and run it as a service.

Here is an example of how to run a redis server locally using docker:

```
docker run --name eensy-redis -p 6379:6379 -d redis:latest
```

Keep your redis connection data on hand, it will be placed onto the `.env` file later.

## Environment

Create your local `.env` and `.env.test` files from `.env.example`. These files hold security sensitive environment variables for your development and testing enviroments respectively.

Check the `environment/index.ts` file for the variables that are required to run the service.

If you are using an gateway, make sure to set the `SERVICE_SECRET` variable to the same value as the one on the gateway.

## Install dependencies

If you a re running this service in the same workspace as an eensy project, you can execute the following command to install the dependencies of all services at the same time **(recommended)**:

```
cd <PROJECT-ROOT> && npm install
```

If you are running this service standalone, you can install the dependencies by running:

```
npm install
```

## Execute migrations and seeders

To execute the migrations and seeders, run the following command:

```
npm run prisma-reset
```

This command will reset your database, apply the migrations, run the seeders and generate the prisma client.

Please make sure you have set the database credentials on the `.env` file before running this command. Make sure the database your are using exists and that the credentials are correct.

## Start the service

To start the service standalone, run the following command:

```
npm run start
```

# Development notes:

## Gateway usage

If you are using a gateway in your application, make sure to apply the `gateway-secret` middleware to your routes. This middleware will check for the `SERVICE_SECRET` variable on the request headers and will validate it against the one on the gateway. If the secrets don't match, the request will be rejected.

## Prisma cli commands

For more in depth visit the [prisma commands reference](https://www.prisma.io/docs/reference/api-reference/command-reference)

---

### Prisma generate

```
npx prisma generate
```

Generate the prisma client from the `schema.prisma`.

---

### Prisma migrate dev

```
npx prisma migrate dev --name [NAME]
```

Generates a migration from `schema.prisma` changes, it also applies the migration to the database.

---

```
npx prisma migrate dev
```

Updates your database using migrations during development and creates the database if it does not exist. (_this will also generate and run a migration if changes are made to the `schema.prisma` file_):

---

### Prisma migrate reset

```
npx prisma migrate reset
```

Deletes and recreates the database, or performs a 'soft reset' by removing all data, tables, indexes, and other artifacts.

---

### Prisma seeds

```
ts-node prisma/seeds
```

Will seed the database. Seeders are done via simple scripts. We maintain a `prisma/seeds` folder, an `prisma/seeds/index.ts` file sequentially runs all the seeds of the system.

# Tests

To run the tests, run the following command:

```
npm run test
```
