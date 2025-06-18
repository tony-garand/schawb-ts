# Schwab TypeScript Client

A TypeScript client for the Schwab API, providing a modern and type-safe way to interact with Schwab's trading platform.

## Features

- Full TypeScript support with type definitions
- Modern async/await API
- WebSocket streaming support
- OAuth2 authentication
- Comprehensive error handling
- Built-in logging and debugging utilities

## Installation

```bash
npm install schwab-ts
```

## Usage

```typescript
import { easyClient } from 'schwab-ts';

async function main() {
  const client = await easyClient(
    'YOUR_API_KEY',
    'YOUR_APP_SECRET',
    'https://127.0.0.1:8182',
    './token.json'
  );

  // Use the client to interact with Schwab's API
  const account = await client.getAccount();
  console.log('Account:', account);
}

main().catch(console.error);
```

## Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/schwab-ts.git
cd schwab-ts
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run tests:
```bash
npm test
```

5. Lint the code:
```bash
npm run lint
```

6. Format the code:
```bash
npm run format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original Python client by [schwab-py](https://github.com/tony-garand/schwab-py)
- TypeScript conversion and improvements by Anthony Garand