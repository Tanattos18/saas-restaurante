import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória'),
  tenantSlug: z
    .string()
    .min(1, 'Restaurante é obrigatório'),
})

export const registerSchema = z.object({
  tenantName: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres'),
  tenantSlug: z
    .string()
    .min(3, 'Slug deve ter no mínimo 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  ownerEmail: z
    .string()
    .email('Email inválido'),
  ownerPassword: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
  ownerName: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
