# Contributing to SDC-v3

Thank you for considering contributing to SDC-v3! This project is open to contributions from anyone interested in improving it.

## Getting Started

To get started, follow these steps:

1. Fork the repository and clone it to your local machine.
1. Install the necessary dependencies using `npm install`.
1. Check the `docs/local-db-setup.md` instructions to setup the CockroachDB database.
1. Create a new branch for your changes using `git checkout -b new-branch-name`.
1. Make your changes and commit them using `git commit` Push your changes to your fork using `git push origin new-branch-name`.
1. Open a pull request on the main repository.

## Guidelines

Here are a few guidelines to follow when contributing:

- **Create a new branch for each contribution.** This makes it easier to keep track of changes and to merge them later.
- **Make sure your code is well-documented.** Comment your code and add documentation where necessary.
- **Follow the code style of the project.** Take a look at the existing code and try to match its style as closely as possible.
- **Test your changes.** Make sure your changes don't break existing functionality and that they work as expected.
- **Be respectful.** Remember that this is an open-source project and that everyone is here to learn and improve.

## Contributing

To contribute to this project, follow these steps:

1. Fork this repository by clicking the "Fork" button at the top of the repository page.
2. Clone the forked repository to your local machine using the command `git clone <forked-repo-url>`.
2. Setup the dev database based on instructions present on `docs/local-db-setup.md`.
3. Create a new branch for your changes using the command `git checkout -b <new-branch-name>`.
4. Make the necessary changes to the code, and make sure they follow the project's coding style and conventions.
5. Commit your changes with a descriptive commit message using the `command git commit -m "Descriptive commit message"`.
6. Push your changes to your forked repository using the command `git push origin <new-branch-name>`.
7. Create a pull request by clicking the "New pull request" button on the forked repository page.
8. Wait for the project maintainers to review your pull request and provide feedback.
9. Make any necessary changes based on the feedback, and push them to your branch.
10. Repeat steps 8 and 9 until your pull request is accepted and merged into the main repository.

To link a pull request from a forked repository to the original repository's issue, you can use a special syntax in the pull request's description or comments. Here are the steps to do this:

1. In the pull request's description or comments, type `Fixes #<issue-number>`, where `issue-number` is the number of the issue in the original repository that the pull request is related to.
2. Make sure the issue number is preceded by the `#` symbol. For example, if the issue number is `123`, you would type `Fixes #123`.
3. When you submit the pull request, GitHub will automatically link the pull request to the issue in the original repository.
4. The pull request will also appear in the `Pull requests` tab of the original repository's issue.
5. Here's an example of what the syntax would look like in a pull request comment:

```
This PR is for this issue and fixes #123
```

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/). By participating, you are expected to uphold this code. Please report any unacceptable behavior to the project maintainers at [simon.hlywa@gmail.com or kole.audu@gmail.com].

## Technologies

This project uses the following technologies:

- Next.js: a React framework for building server-side rendered applications
- tRPC: a TypeScript-first RPC framework for building APIs with strongly-typed contracts
- Tailwind CSS: a utility-first CSS framework for rapidly building custom user interfaces
- Axios: a Promise-based HTTP client for making API requests
- date-fns: a library for working with dates and times in JavaScript
- NextAuth.js: an authentication library for Next.js applications
- react-hook-form: a library for building forms in React
- zod: a TypeScript-first schema validation library

### Documentation

Here are the links to the official documentation for each technology:

- [Next.js](https://nextjs.org/docs/getting-started)
- [tRPC](https://trpc.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Axios](https://axios-http.com/docs/intro)
- [date-fns](https://date-fns.org/docs/)
- [NextAuth.js](https://next-auth.js.org/getting-started/introduction)
- [react-hook-form](https://react-hook-form.com/get-started/)
- [zod](https://zod.dev/)

## Feedback

If you have any feedback, questions or suggestions, feel free to create a new issue or contact the project maintainers at [foresthpark@gmail.com](mailto:foresthpark@gmail.com).

Thank you for your contributions!


## Licensing
<a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/">Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License</a>.
