# Setting up CockroachDB instance with Docker Compose

## Prerequisites
Before getting started, ensure that you have the following prerequisites installed on your machine:
- Docker: Visit the official Docker website ([https://www.docker.com/](https://www.docker.com/)) and download the appropriate Docker version for your operating system.
- Docker Compose: Docker Compose should be included in the Docker installation for macOS and Windows. For Linux, follow the official Docker Compose installation guide ([https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)) to install it separately if needed.

## Instructions

### macOS

1. Open a terminal.

2. Navigate to the `sdc` project directory where you'll find the `docker-compose.dev.yml` file.

3. Run the following command to start the CockroachDB container:

    ```shell
    docker compose -f docker-compose.dev.yml -up -d
    ```

4. Wait for Docker to download the CockraochDB image and start the container. You can check the container status by running the command:

    ```shell
    docker compose -f docker-compose.dev.yml ps
    ```

    You should see an output similar to the following:

    ```shell
    NAME                COMMAND                        SERVICE             STATUS              PORTS
    sdc-v3      "docker-entrypoint.s…"   cockroachdb/cockroach         running             0.0.0.0:8080->8080/tcp,0.0.0.0:26257->26257/tcp
    ```

5. Once the container is up and running, you can connect to the CockroachDB instance using a client tool of your choice. Here's an example using the `sql` command-line client within the comtainer:

    ```shell
    ./cockroach sql --insecure
    ```

You will be prompted to enter the password. Enter `sdc_password`.

6. Congratulations! You are now connected to the CockroachDB instance and ready to work with the `sdc` database.

### Windows

1. Open a Command Prompt or PowerShell.

2. Navigate to the `sdc` project directory where you'll find the `docker-compose.dev.yml` file.

3. Run the following command to start the CockroachDB container:

    ```shell
    docker compose -f docker-compose.dev.yml -up -d
    ```

4. Wait for Docker to download the CockroachDB image and start the container. You can check the container status by running the command:

    ```shell
    docker compose -f docker-compose.dev.yml ps
    ```


### Linux

See macOS instructions above.

## Connecting sdc website to the DB

Update the values of `DATABASE_URL` in your `.env` file to the following:

```
DATABASE_URL='postgresql://root@localhost:26257/sdc?application_name=%24+cockroach+sql&connect_timeout=15&sslmode=disable'

```

Then run prisma client generation, run migrations and seed the db to apply schema changes to the newly created DB to begin development

```shell
npx prisma generate 

npx prisma migrate dev

npx prisma db seed
```
