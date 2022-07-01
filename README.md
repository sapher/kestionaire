## Kestionaire

Utility for the generation of .env file by answering questions from a file.

This tool use [inquirer](https://www.npmjs.com/package/inquirer) as a backend.

## Usage

**Configuration**

You need to create a file that contain configuration provided by inquirer under the `Question` section.

```yaml
output: .env
questions:
  - name: "name"
    message: "What is your name ?"
```

**Run**

```shell
npx kestionaire `kestion.yml`
```

## Configuration

You can use any configuration provided by inquirer under the `Question` section.

## Missing features

- Handling more file format for input files
- Handling of external calls
