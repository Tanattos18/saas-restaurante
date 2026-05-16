import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  position: z.number().int().optional().default(0),
  active: z.boolean().optional().default(true),
  showInQRCode: z.boolean().optional().default(true),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional().nullable(),
  price: z.number().positive('Preço deve ser positivo'),
  promoPrice: z.number().positive('Preço promocional deve ser positivo').optional().nullable(),
  categoryId: z.string(),
  image: z.string().url('URL inválida').optional().nullable(),
  active: z.boolean().optional().default(true),
  showInQRCode: z.boolean().optional().default(true),
  preparationTime: z.number().int().min(0).optional().default(0),
  calories: z.number().int().optional().nullable(),
  isVegan: z.boolean().optional().default(false),
  isGlutenFree: z.boolean().optional().default(false),
  stock: z.number().int().min(0).optional().nullable(),
  minStock: z.number().int().min(0).optional().default(5),
  position: z.number().int().optional().default(0),
})

export const stockUpdateSchema = z.object({
  quantity: z.number(),
  reason: z.string().min(3),
})

export const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1, 'Lista de IDs não pode estar vazia'),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type ProductInput = z.infer<typeof productSchema>
export type StockUpdateInput = z.infer<typeof stockUpdateSchema>
