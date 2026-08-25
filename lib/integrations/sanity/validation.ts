import { z } from 'zod'

export const productSchema = z.object({
  _id: z.string(),
  title: z.string(),
  slug: z.object({ current: z.string() }),
  sku: z.string().optional(),
  price: z.number().optional(),
  photos: z.array(z.string()).min(1),
  model3dUrl: z.string().optional(),
  description: z.string().optional(),
  category: z.object({ title: z.string() }).nullable().optional(),
})

export const productListSchema = z.array(productSchema)
