<h1 align="center">Eensy</h1>
<p>
  <a href="https://www.npmjs.com/package/eensy" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/eensy.framework.svg">
  </a>
  <a href="https://github.com/neuralgeeks/eensy/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/neuralgeeks/eensy/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/neuralgeeks/eensy" />
  </a>
  <a href="https://github.com/neuralgeeks/eensy/blob/master/CODE_OF_CONDUCT.md" target="_blank">
    <img alt="Contributor Covenant" src="https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg" />
  </a>
</p>

> A ligthweight, opinionated, and easy to use typescript library for microservice backend applications based on express.

```ts
class UserController extends Controller {
  async index(req: Request) {
    await IndexValidator(req)
    const all = await userRepository.all()

    return { data: collection(UserTransform, all) }
  }

  async show(req: Request) {
    const validated = await ReferenceValidator(req)
    const user = await userRepository.show(validated.id)
    if (!user) throw ResourceNotFoundError()

    return { data: UserTransform(user) }
  }

  async store(req: Request) {
    const validated = await StoreValidator(req)
    const user = await userRepository.create(validated as User)
    return { status: 201, data: UserTransform(user) }
  }

  async update(req: Request) {
    const validated = await UpdateValidator(req)
    await ExistsValidator(req)

    const user = await userRepository.update(validated.id, validated.fields)
    return { status: 202, data: UserTransform(user) }
  }

  async destroy(req: Request) {
    const validated = await ReferenceValidator(req)
    await ExistsValidator(req)

    await userRepository.delete(validated.id)
    return { status: 202 }
  }
}
```

## Install and use

This library comes with a built-in cli to help you get started.

```sh
npm i -g eensy
eensy.cli init
```

The CLI will promt some questions to generate the base project for you. Once the CLI command has finished, execute the following to start your project:

```sh
cd PROJECT_NAME
npm start
```

More information and guides are included on the generated project's README.md file.

## Features

- ⚙️ **Built-in CLI:** Uses templates and schematics to greatly speed up development.
- 🚀 **Minimal setup:** Requires minimal configuration to start developing features.
- 🎯 **Prisma integration:** Built-in integration with [Prisma](https://www.prisma.io/) for efficient database development.
- 🏢 **Stable project structure:** Provides a well-defined and stable structure for your project.
- 🔌 **Microservice oriented:** Encourages the development of microservice oriented applications, providing a simple and easy to use API for inter-service communication via HTTP and queues.
- 🔒 **JWT authentication:** Built-in support for [JWT](https://jwt.io/) authentication.
- ✅ **Validator pattern:** Out-of-the-box usage of the validator pattern.
- ➡️ **Functional syntax:** Functional syntax for declaring routes and middlewar chains.
- 🧹 **Clean and simple syntax:** Offers a clean and simple syntax for easy development.
- ⏰ **Job scheduler:** Built-in job scheduler for task management.
- 🐮 **Bull queue integration:** Integration with Bull queue for background jobs and distributed processing.
- 📡 **Socket.io integration:** High-level API for broadcasting with [Socket.io](https://socket.io/), including built-in support for broadcast channels and personal channels.
- 💾 **Repository pattern:** Adoption of the repository pattern for efficient database access.
- 🔁 **Distributed transactions:** Built-in support for 2PC (two-phase commit) distributed transactions with utilities for quickly implementing atomic operations.

## CLI usage

You can ask for help with:

```sh
eensy.cli -h
```

The CLI currently has 3 generation features: **project generation** _(aka. Init)_, **service generation** and **resource generation** _(aka. RESTful entity generation)_.

### Project generation

This command inits a project. Some promts will be shown so that the CLI knows how to generate the best base project.

```sh
eensy.cli init
```

### Service generation

This command generates a service inside a project. It will generate all the folder and file structure that you need to start using a new service in your project.

```sh
eensy.cli generate:service
```

### Resource generation

This command generates a RESTful resource inside a project. You can select the service that will serve the new resource. You can also choose which parts of the resource files you want to generate, by default _the controller_, _the model_, _the repository_, _the REST validators_, _the routes file_, _the transform_ and _the testing specs_ are generated.

```sh
eensy.cli generate:resource
```

## About schematics

The built-in CLI of this project uses [Angular schematics](https://www.npmjs.com/package/@angular-devkit/schematics) as the core of file system manipulation. Please show support to the awesome [Angular.io](https://angular.io/) community for making such reliable scaffolding library.

## Author

👤 **Joao Pinto @ neuralgeeks**

- Website: https://neuralgeeks.com/
- Github: [@neuralgeeks](https://github.com/neuralgeeks)
- Instagram: [@neuralgeeks](https://instagram.com/neuralgeeks)

## Show your support

Give a ⭐️ if this project helped you!

## 🤝 Contributing

Since eensy is a small library, we are not accepting any contributions at the moment. However, you can still contribute by reporting bugs, suggesting features, and sharing your ideas. Issues and pull requests are welcome!

## 📝 License

Copyright © 2020 [neuralgeeks](https://github.com/neuralgeeks).<br />
This project is [MIT](https://github.com/neuralgeeks/eensy/blob/master/LICENSE) licensed.
