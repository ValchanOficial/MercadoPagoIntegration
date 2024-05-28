# Mercado Pago Integration

The code is written in JavaScript using Node.js and Express.JS, and it demonstrates basic operations such as generating card tokens and managing payments and preferences.

Before running this project, ensure you have the following installed:
    - Node.js (version 20 or higher)
    - npm or yarn

Additionally, you will need a Mercado Pago account to obtain your ML_ACCESS_TOKEN.

Mercado Pago Docs: [https://www.mercadopago.com.br/developers/en/reference](https://www.mercadopago.com.br/developers/en/reference)

## Installation

Clone the repository:

    ```sh
    git clone https://github.com/your-repo/mercadopago-integration.git
    cd mercadopago-integration
    ```

Install the dependencies:

    ```sh
    npm install
    ```

Create a .env file in the root directory and add your MercadoPago access token:

    ```
    ML_ACCESS_TOKEN=your_access_token_here
    ```

## Running the Server

To start the server, run:

    ```sh
    npm start
    ```

The server will be running on `http://localhost:3000`.

## API Endpoints

- GET /
Returns a simple message indicating the API is working.

- GET /card_token
Generates a card token using mock credit card details.

- GET /payment_methods
Consult all the available payment methods and obtain a list with the details of each one and its properties.

- GET /preference
Generate a preference with the information of a product or service and obtain the necessary URL to start the payment flow.

- GET /preference/:preferenceId
Retrieves preference details by its ID.

- GET /payment
Creates a payment using the mock credit card and card token.

- GET /payment/:id
Retrieves payment details by its ID.

- POST /cancel_payment/:id
Cancels a payment by its ID.

- POST /notification
Handles incoming notifications from Mercado Pago.

## Testing

To test the endpoints, you can use tools like Postman or curl.
For example, to get a card token:

    ```sh
    curl http://localhost:3000/card_token
    ```
