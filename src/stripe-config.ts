export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  mode: 'subscription' | 'payment';
  trialDays?: number;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SWTBdf8Xp78wBi',
    priceId: 'price_1RbQFSQTHGGahVKsS0UEd8FL',
    name: 'Plano Starter',
    description: 'Perfeito para começar sua jornada digital',
    price: 29.00,
    mode: 'subscription',
    trialDays: 7
  },
  {
    id: 'prod_SWTC2hzVqetn6Z',
    priceId: 'price_1RbQG6QTHGGahVKsXWCcnfoL',
    name: 'Plano Profissional',
    description: 'Para empresas em crescimento acelerado',
    price: 79.00,
    mode: 'subscription',
    trialDays: 7
  },
  {
    id: 'prod_SWTCM1UOvD3PP3',
    priceId: 'price_1RbQGWQTHGGahVKsta4XI5jF',
    name: 'Plano Enterprise',
    description: 'Solução completa para grandes empresas',
    price: 199.00,
    mode: 'subscription',
    trialDays: 7
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}