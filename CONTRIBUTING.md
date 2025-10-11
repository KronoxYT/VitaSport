# Contributing to VitaSport

Thank you for your interest in contributing to VitaSport! This document provides guidelines and instructions for contributing to this project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/VitaSport.git`
3. Add the upstream repository: `git remote add upstream https://github.com/KronoxYT/VitaSport.git`
4. Create a new branch for your changes: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SQLite3

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp VitaSport-2.env .env
   # Edit .env with your configuration
   ```

3. Run database migrations:
   ```bash
   node src/database/migrate.js
   ```

4. Start the backend server:
   ```bash
   node src/server.js
   ```

5. For React frontend development:
   ```bash
   cd src/renderer/react-app
   npm install
   npm run dev
   ```

## How to Contribute

### Types of Contributions

- **Bug fixes**: Fix issues in the existing codebase
- **Features**: Add new functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Performance**: Optimize existing code

### Workflow

1. **Find or create an issue**: Check if an issue exists for what you want to work on, or create a new one
2. **Discuss**: Comment on the issue to discuss your approach
3. **Branch**: Create a feature branch from `master`
4. **Develop**: Make your changes following our code style guidelines
5. **Test**: Ensure all tests pass and add new tests if needed
6. **Commit**: Write clear, descriptive commit messages
7. **Pull Request**: Submit a PR with a detailed description

## Pull Request Process

1. **Update documentation**: Ensure any new features or changes are documented
2. **Run tests**: All tests must pass (`npm test`)
3. **Update README**: If your changes affect usage, update the README.md
4. **Link issues**: Reference any related issues in your PR description
5. **Request review**: Wait for a maintainer to review your PR
6. **Address feedback**: Make requested changes promptly
7. **Merge**: Once approved, a maintainer will merge your PR

### PR Title Format

Use conventional commits format:
- `feat: Add new feature`
- `fix: Fix bug in inventory controller`
- `docs: Update API documentation`
- `test: Add tests for sales controller`
- `refactor: Restructure user routes`
- `chore: Update dependencies`

## Code Style Guidelines

### JavaScript/Node.js
- Use ES6+ features where appropriate
- Follow consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add comments for complex logic
- Avoid deeply nested code

### File Organization
- **Controllers**: Business logic in `src/controllers/`
- **Routes**: API endpoints in `src/routes/`
- **Views**: Frontend views in `src/renderer/views/`
- **Tests**: API tests in `src/__tests__/`

### Example Structure

```javascript
// Controller example
const getSomething = async (req, res) => {
  try {
    const result = await database.query('...');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

- Place tests in `src/__tests__/`
- Use Jest framework
- Follow existing test patterns (see `product.api.test.js`)
- Include unit tests for new features
- Ensure API tests cover success and error cases

### Test Example

```javascript
describe('Resource API', () => {
  test('should return data', async () => {
    const response = await request(app).get('/api/resource');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to reproduce**: Detailed steps to reproduce the issue
3. **Expected behavior**: What you expected to happen
4. **Actual behavior**: What actually happened
5. **Environment**: OS, Node.js version, etc.
6. **Screenshots**: If applicable
7. **Logs**: Relevant error messages or logs

Use the bug report template when creating an issue.

## Suggesting Enhancements

When suggesting enhancements:

1. **Use case**: Explain why this enhancement would be useful
2. **Description**: Detailed description of the proposed feature
3. **Alternatives**: Any alternative solutions you've considered
4. **Examples**: Examples of similar features in other projects
5. **Implementation**: If possible, suggest how it could be implemented

Use the feature request template when creating an issue.

## Questions?

If you have questions:
- Check existing issues and documentation
- Create a new issue with the "question" label
- Be patient and respectful when awaiting responses

## License

By contributing to VitaSport, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to VitaSport! 🎉
