
## Requirements

- Git
- NodeJS >= v18.16.0
- PostgresDB
- Nats

## Setup

- ##### Install Dependencies
  ```
  yarn install
  ```

- ##### Run locally:

    1. copy .env.example to .env
    2. edit .env, change seed and add bucket details
    3. yarn install
    4. yarn infra:local or install PostgresDB and Nats broker locally and add them to .env
    5. yarn serve:agent


## Usage via Postman
  1. Import swagger collection from the repo
