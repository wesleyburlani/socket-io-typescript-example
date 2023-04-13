# SocketIO Typescript Implementation
> A Typescript implementation of SocketIO communication using socket-controllers and Redis as adapter making it possible to scale horizontally

This repository implements 3 components for an entire Socket IO communication:

* server
* client
* a load balancer to spawn servers and simulate horizontal scalability

## Getting Started

To start using this repository the first thing you need to do is to copy and contents of the file `.env.example` and save it on a file `.env`.

Then, since we are going to spawn more than 1 server, we need to use an adapter to save the session information, so that the servers can be synced with each other. To do so, this repository uses a Redis instance. To start a Redis instance you can simply run:

```sh
docker compose up
```

after that, you will be able to start the servers. To spawn multiple servers with a load-balancer simulator you can simply run:

```sh
npm run load-balancer
```

this script will start multiple servers and keep track of all the server's logs, logging it on the process stdout with a prefix that identifies the original server that printed the log. 

The set the number of servers that you want to spawn, you can change the value of the environment variable `NUMBER_OF_SERVERS_TO_SPAWN` on the `.env` file.

then, you can start the client instance: 

```sh
# do not emit a `save` event after connecting
npm run client

# emits a `save` event after connecting
npm run client:with-save-event
```

Each client will :

1. try to connect to the server with an expired token
2. receive an error
3. refresh the JWT token and connect with a valid token
4. if the environment variable `EMIT_EVENT` is `true` it will send a `save` event to the server
5. the server will reply with a `save_success` event for all the connected sockets that are owned by the same user.

