# wallet-keeper
 Secure store for private keys that are stored and transferred using encryption.

## Installation

```yarn install```

or

```npm install```


## Setup

Create config.json and add the following:
##### Note - Your encryption key must be exactly 32 characters long.
```json
{
    "PORT": 5669,
    "ENCRYPTION_KEY": "Your-Unique-Encryption-Key"
}
```
##### Optionally add ENCRYPTION_IV to config.json. If not provided, IV is preset. - IV must be exactly 16 characters long.

## Usage

```yarn start```

or

```node index```

## API

### GET /wallet/:address

#### Returns
```json
{
    "address": "0x"
}
```

### POST /wallet - include content-type: application/json header.

Creates a new wallet and returns the encrypted private key for the given address in plain text.
##### note - does accept pneumaticon phrases.
##### Can send a encrypted private key from @ideadesignmedia/encryption{encrypt} function using the same unique encryption key used by the server.
#### Request Body JSON
```json
{
    "privateKey": "0x0000000000000000000000000000000000000000000000000000000000000000"
}
```

#### Returns
```json
{
    "address": "0x0000000000000000000000000000000000000000"
}
```

### GET /data/:address

Returns the data stored for the given address.

### POST /data - include content-type: application/json header.

Stores data for the given address is seperate from the wallet data.
##### this is to store wallet data that is not encrypted with the encryption key used by the server.
```json
{
    "address": "0x00000000",
    "privateKey": "0afdjl"
}
```

#### Returns
```json
{
    "address": "0x00000000"
}
```