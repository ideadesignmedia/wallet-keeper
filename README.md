# wallet-keeper
 Secure store for private keys that are stored and transferred using encryption.

## Installation

```yarn install```

or

```npm install```


## Setup

```create config.json and add the following```

```json
{
    "PORT": 5669,
    "ENCRYPTION_KEY": "Your-Unique-Encryption-Key"
}
```

## Usage

```yarn start```

or

```node index```

## API

### GET /wallet/:address

Returns the encrypted private key for the given address in plain text.
##### Decrypt using the @ideadesignmedia/helpers{decrypt} function using the same unique encryption key.

### POST /wallet - include content-type: application/json header.

Creates a new wallet and returns the encrypted private key for the given address in plain text.
##### note - does accept pneumaticon phrases.
#### Request Body JSON
```json
{
    "privateKey": "0x000000000000000000000000000000000000000000000000000000000000"
}
```

#### Returns
```json
{
    "address": "0x0000000000000000000000000000000000000000"
}
```