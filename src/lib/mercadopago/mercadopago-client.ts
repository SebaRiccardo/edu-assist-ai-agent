import { MercadoPagoConfig } from 'mercadopago';

/**
 * MercadoPago Client Configuration
 * Initializes the MercadoPago SDK with access token and options
 */

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  throw new Error(
    'MERCADOPAGO_ACCESS_TOKEN is not defined in environment variables'
  );
}

export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
  },
});
