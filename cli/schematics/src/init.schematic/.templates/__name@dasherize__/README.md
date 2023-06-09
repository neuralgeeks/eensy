# <%= dasherize(name) %> project

A microservice project using the [eensy](https://www.npmjs.com/package/eensy) library.

## Workspaces

This project uses [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to manage dependencies. Each service and contract is a workspace. Workspaces can be executed independently or together. Here are some useful commands:

To install all dependencies, run:

```bash
npm install
```

To install and dependency in a workspace, run:

```bash
npm install --save <package> -w <workspace>
```

### Running npm scripts

To run an npm script in a workspace, run:

```bash
npm run <script> -w <workspace>
```

This can be used to run any script in any workspace. For example, to run the `test` script in the `foo` service, run:

```bash
npm run test -w services/foo
```

This can be especially useful to run migrations in a workspace. For example, to run the `prisma-reset` script in the `foo` service, run:

```bash
npm run prisma-reset -w services/foo
```

## Services

The services are located in the `services` directory. Each service is a workspace. To run the `foo` service, run:

```bash
npm run start -w services/foo
```

Alternatively, you can run all services at once by running:

```bash
npm run start
```

It is important that each service requires to configure the environment before it can function properly. You can see the instructions for setting up each service in the `README.md` file in each service directory.

You can also exclude or include services by using the `-s` (for _include_) or `-e` (for _exclude_) flags. For example, to run **all services except** the sevices `foo` and `bar`, run:

```bash
npm run start -e foo bar
```

On the other hand, if you want to run **only the services** `foo` and `bar`, run:

```bash
npm run start -s foo bar
```

## Building services

You can build all services by running:

```bash
npm run build
```

## The configuration contract

The configuration contract is a workspace and is used to share configuration between services. Configuration properties are written in the [`properties`](./contracts/configuration/src/properties.ts) file.

The exported properties will be the result of serializing the properties file. For example, if the properties file looks like this:

```ts
export const properties = {
  foo: 'bar',
  baz: 'qux',
}
```

Then the exported properties will be:

```json
{
  "foo": "bar",
  "baz": "qux"
}
```

These properties are exported to a shared redis instance. Services can fetch the configuration properties by using the `ClusterConfiguration` class.

Each key in the properties file is a configuration property. Each property is stored in a redis hash, where the key is the name of the property and the value is the value of the property.

The hash name can be defined in the [`enviroment/index`](./contracts/configuration/environment/index.ts) file. By default, the hash name is `<project-name>.config`.

The dependant services are defined in the [`enviroment/index`](./contracts/configuration/environment/index.ts) file. By default, no service is dependant on the configuration properties.

To run the export script, run:

```bash
npm run export -w contracts/configuration
```

The export script will export the properties to the redis instance and will export to each dependant service:

- The hash name.
- The properties type interface.
- The `ClusterConfiguration` class.

Services can fetch the configuration properties by using the `ClusterConfiguration` class. For example, to fetch the `foo` property, run:

```ts
const clusterConfiguration = new ClusterConfiguration(ApplicationRedis)
const foo = await clusterConfiguration.getProperty('foo')
```

Where `ApplicationRedis` is a class that implements the following interface:

```ts
interface ApplicationRedis {
  client(): Promise<RedisClientType>
}
```

This will fetch the shared configuration property `foo` from the redis instance as long as the dependant service redis instance is connected to the shared redis instance.
