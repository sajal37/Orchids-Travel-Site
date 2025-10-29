# Contributing to TravelHub

First off, thank you for considering contributing to TravelHub! It's people like you that make TravelHub such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript and React styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code based on the Documentation Styleguide
* End all files with a newline

## Development Process

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Run tests** (`npm test`)
5. **Run linter** (`npm run lint`)
6. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
7. **Push to the branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

## Development Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

* Use TypeScript for all new code
* Prefer `interface` over `type` for object types
* Use descriptive variable names
* Add JSDoc comments for public APIs
* Use `const` by default, `let` when needed, never `var`

### React Styleguide

* Use functional components with hooks
* Use `"use client"` directive for client components
* Keep components small and focused
* Extract reusable logic into custom hooks
* Use proper TypeScript typing for props
* Follow the existing component structure

### Testing Styleguide

* Write tests for all new features
* Aim for at least 70% code coverage
* Use descriptive test names
* Follow the Arrange-Act-Assert pattern
* Mock external dependencies

## Project Structure

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/             # Utility functions
├── types/           # TypeScript type definitions
└── middleware.ts    # Next.js middleware
```

## AI Features Development

When working on AI features:

1. **Always implement preview mode first**
2. **Require human approval for all changes**
3. **Log all AI operations to audit trail**
4. **Implement rollback functionality**
5. **Validate and sanitize all inputs**
6. **Add safety checks for dangerous operations**

## Security Guidelines

* Never commit sensitive data (API keys, passwords)
* Always validate and sanitize user input
* Use parameterized queries to prevent SQL injection
* Implement rate limiting for API endpoints
* Follow OWASP security best practices
* Add security headers to all responses

## Documentation

* Update README.md if you change functionality
* Add JSDoc comments for new functions
* Update API documentation for new endpoints
* Include examples in documentation

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.