import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { CardToken, MercadoPagoConfig, Payment, PaymentMethod, Preference } from "mercadopago";

const app = express();

const client = new MercadoPagoConfig({
  accessToken: process.env.ML_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    // idempotencyKey: 'abc' //  Idempotency Is for retrying requests without accidentally performing the same operation twice
  },
});

const mockCreditCard = {
  site_id: 'MLB',
  card_number: '5031433215406351',
  expiration_year: '2025',
  expiration_month: '11',
  security_code: '123',
  cardholder: {
    identification: { type: 'CPF', number: '01234567890' },
    name: 'APRO'
  }
}

const payment = new Payment(client);
const paymentMethod = new PaymentMethod(client);
const cardToken = new CardToken(client);
const preference = new Preference(client);

app.get("/", (req, res) => {
  res.send({ message: "Mercado Pago Integration" });
});

// Status info
// https://www.mercadopago.com.br/developers/en/docs/checkout-api/response-handling/collection-results

// Generete Card Token
// https://www.mercadopago.com.br/developers/en/docs/checkout-api/integration-test/test-cards
app.get("/card_token", async (req, res) => {
  try {
    const token = await cardToken.create({ body: mockCreditCard });
    res.send(token);
  } catch (error) {
    res.send({ error });
  }
});

// Get payment methods
// https://www.mercadopago.com.br/developers/en/reference/payment_methods/_payment_methods/get
app.get("/payment_methods", async (req, res) => {
  try {
    const response = await paymentMethod.get();
    res.send(response);
  } catch (error) {
    res.send({ error });
  }
});

// Checkout preference
// https://www.mercadopago.com.br/developers/en/reference/preferences/_checkout_preferences/post
app.get("/preference", async (req, res) => {
  const preferenceBody = {
    external_reference: crypto.randomUUID(),
    payer: { email: "test_user_123@testuser.com" },
    notification_url: "https://webhook.site/123-abc", // https://webhook.site/ can be used to get IPN notification locally 
    items: [
      {
        id: crypto.randomUUID(),
        currency_id: "BRL",
        title: "Product description",
        unit_price: Number(58.8),
        quantity: 1,
      },
    ],
  };
  try {
    const response = await preference.create({ body: preferenceBody });
    res.send({
      id: response.id,
      external_reference: response.external_reference,
      link: response.init_point,
    });
  } catch (error) {
    res.send({ error });    
  }
});

// Get preference by ID
// https://www.mercadopago.com.br/developers/en/reference/preferences/_checkout_preferences_id/get
app.get("/preference/:preferenceId", async (req, res) => {
  const { preferenceId } = req.params;
  try {
    const response = await preference.get({ preferenceId });
    res.send({
      id: response.id,
      external_reference: response.external_reference,
      link: response.init_point,
    });
  } catch
  (error) {
    res.send({ error });
  }
});

// Payment
// https://www.mercadopago.com.br/developers/en/reference/payments/_payments/post
app.get("/payment", async (req, res) => {
  const token = await cardToken.create({ body: mockCreditCard });

  const paymentBody = {
    description: "Cart description",
    external_reference: crypto.randomUUID(),
    installments: 1,
    notification_url: "https://webhook.site/123-abc", // https://webhook.site/ can be used to get IPN notification locally 
    payer: { email: "test_user_123@testuser.com" },
    // payment_method_id: "pix",
    payment_method_id: "master",
    token: token.id, // Token card identifier (mandatory for credit card). Example: payment_method_id = visa, master, etc.
    transaction_amount: Number(58.8),
  };

  try {
    const response = await payment.create({ body: paymentBody });
    res.send({
      id: response.id,
      external_reference: response.external_reference,
      status: response.status,
      pix: response.point_of_interaction?.transaction_data?.ticket_url || 'N/A',
    });
  } catch (error) {
    res.send({ error });
  }
});

// Get payment by ID
// https://www.mercadopago.com.br/developers/en/reference/payments/_payments_id/get
app.get("/payment/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await payment.get({ id });
    res.send({
      id: response.id,
      external_reference: response.external_reference,
      status: response.status,
      pix: response.point_of_interaction?.transaction_data?.ticket_url || 'N/A',
    });
  } catch (error) {
    res.send({ error });
  }
});

// Cancel payment by ID
// https://www.mercadopago.com/developers/en/reference/payments/_payments_id/put
// status = cancelled
app.post("/cancel_payment/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await payment.cancel({ id });
    res.send(response);
  } catch (error) {
    res.send({ error });
  }
});

// Notification - IPN
// https://www.mercadopago.com.br/developers/en/docs/checkout-api/additional-content/your-integrations/notifications/ipn
app.post("/notification", async (req, res) => {
  console.log({ message: "Notification received", body: req.body })
  // Info from req.body
  // {
  //   "action": "payment.created",
  //   "api_version": "v1",
  //   "data": {
  //     "id": "1323479563"
  //   },
  //   "date_created": "2024-05-28T20:42:45Z",
  //   "id": 113614395815,
  //   "live_mode": false,
  //   "type": "payment",
  //   "user_id": "234420836"
  // }
  res.send("OK");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
