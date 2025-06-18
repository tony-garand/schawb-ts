---
sidebar_position: 10
---

# Contributing

Thank you for your interest in contributing to **schwab-ts**! This guide will help you get started with development and submitting contributions.

## Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **TypeScript** knowledge (the project is written in TypeScript)

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/schwab-ts.git
   cd schwab-ts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up development environment**
   ```bash
   # Install development dependencies
   npm install -D typescript @types/node jest @types/jest ts-jest eslint prettier
   ```

4. **Create a development branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Code Style

We use **ESLint** and **Prettier** for code formatting and linting:

```bash
# Check for linting issues
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Format code with Prettier
npm run format
```

### TypeScript Configuration

The project uses strict TypeScript settings. Make sure your code:

- Has proper type annotations
- Doesn't use `any` unless absolutely necessary
- Follows TypeScript best practices
- Passes the TypeScript compiler

```bash
# Check TypeScript compilation
npx tsc --noEmit
```

### Testing

We use **Jest** for testing. Write tests for new features and ensure existing tests pass:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Example Test Structure

```typescript
// src/client/__tests__/client.test.ts
import { Client } from '../client';

describe('Client', () => {
  let client: Client;

  beforeEach(() => {
    client = new Client('test-api-key', {} as any);
  });

  describe('get_accounts', () => {
    it('should return accounts successfully', async () => {
      // Test implementation
    });

    it('should handle errors gracefully', async () => {
      // Error handling test
    });
  });
});
```

## Contribution Guidelines

### Before You Start

1. **Check existing issues** - Your feature might already be requested
2. **Discuss major changes** - Open an issue to discuss significant changes
3. **Follow the coding standards** - Use the established patterns and conventions

### What We're Looking For

- **Bug fixes** - Fix issues and improve reliability
- **New features** - Add functionality that's useful to the community
- **Documentation** - Improve docs, add examples, fix typos
- **Tests** - Add test coverage for existing or new functionality
- **Performance improvements** - Optimize code and reduce resource usage

### What We're NOT Looking For

- **Breaking changes** without discussion
- **Major refactoring** without clear benefits
- **Dependencies** that significantly increase bundle size
- **Features** that are too specific to individual use cases

## Making Changes

### Code Structure

```
src/
├── auth.ts              # Authentication logic
├── client/              # HTTP client implementation
│   ├── base.ts          # Base client class
│   ├── synchronous.ts   # Synchronous client
│   └── asynchronous.ts  # Asynchronous client
├── streaming.ts         # WebSocket streaming
├── orders/              # Order management
│   ├── common.ts        # Common order types
│   ├── equities.ts      # Equity order templates
│   └── options.ts       # Options order templates
└── utils.ts             # Utility functions
```

### Adding New Features

1. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Implement your changes**
   - Follow the existing code patterns
   - Add proper TypeScript types
   - Include JSDoc comments for public APIs

3. **Add tests**
   - Write unit tests for new functionality
   - Ensure good test coverage
   - Test both success and error cases

4. **Update documentation**
   - Add JSDoc comments
   - Update relevant documentation files
   - Add examples if applicable

### Example: Adding a New API Method

```typescript
// src/client/synchronous.ts
export class Client extends BaseClient {
  /**
   * Get account balances for a specific account
   * @param accountHash - The account hash
   * @returns Promise resolving to account balances
   */
  async get_account_balances(accountHash: string): Promise<AccountBalances> {
    const response = await this._getRequest(
      `/trader/v1/accounts/${accountHash}`,
      { fields: 'balances' }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get account balances: ${response.statusText}`);
    }
    
    return response.data;
  }
}
```

## Documentation

### Updating Documentation

When adding new features, update the relevant documentation:

1. **API Documentation** - Add JSDoc comments to all public methods
2. **README** - Update if adding major features
3. **Examples** - Add examples in the `examples/` directory
4. **Docusaurus Docs** - Update relevant `.md` files in `docs-docusaurus/docs/`

### Running Documentation Locally

```bash
# Start Docusaurus development server
npm run docs:dev

# Build documentation
npm run docs:build
```

## Submitting Your Contribution

### Before Submitting

1. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run format
   ```

2. **Update documentation**
   - Add JSDoc comments
   - Update relevant docs
   - Add examples if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new API method for account balances"
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Process

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Use the PR template
   - Describe your changes clearly
   - Link any related issues
   - Include screenshots if UI changes

3. **PR Review Process**
   - Automated tests must pass
   - Code review by maintainers
   - Documentation review
   - Final approval and merge

## Development Tools

### VS Code Setup

Recommended extensions:
- **TypeScript and JavaScript Language Features**
- **ESLint**
- **Prettier**
- **Jest Runner**

### Debugging

```bash
# Run with debug logging
DEBUG=schwab-ts:* npm start

# Run tests with debug output
npm test -- --verbose
```

### Local Development

```bash
# Link the package locally for testing
npm link

# In another project
npm link schwab-ts
```

## Getting Help

### Questions and Discussion

- **[Discord Server](https://discord.gg/M3vjtHj)** - Real-time discussion
- **[GitHub Discussions](https://github.com/tony-garand/schwab-ts/discussions)** - Q&A and ideas
- **[GitHub Issues](https://github.com/tony-garand/schwab-ts/issues)** - Bug reports

### Development Resources

- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript documentation
- **[Jest Documentation](https://jestjs.io/docs/getting-started)** - Testing framework
- **[ESLint Rules](https://eslint.org/docs/rules/)** - Linting rules reference

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read our [Code of Conduct](https://github.com/tony-garand/schwab-ts/blob/main/CODE_OF_CONDUCT.md) to understand our community standards.

## License

By contributing to **schwab-ts**, you agree that your contributions will be licensed under the same license as the project.

## Thank You!

Thank you for contributing to **schwab-ts**! Your contributions help make this library better for everyone in the trading community.

## Next Steps

- **[Getting Started](./getting-started.md)** - Set up your environment
- **[Authentication](./auth.md)** - Learn about OAuth flow
- **[Client Usage](./client.md)** - Explore the API
- **[Streaming Data](./streaming.md)** - Set up real-time data 