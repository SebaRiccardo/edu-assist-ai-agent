import { MercadoPagoConfig } from 'mercadopago';

/**
 * MercadoPago Client Configuration
 * Initializes the MercadoPago SDK with access token and options
 */

export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  },
});
