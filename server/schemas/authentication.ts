import { z } from 'zod'

const email = z.string().trim().toLowerCase().email('Invalid email address.').max(255)

const password = z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(128, 'Password is too long.')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
    .regex(/\d/, 'Password must contain at least one digit.')

const name = z.string().trim().min(1, 'This field is required.').max(100)

const base = z.object({
    email,
    password,
    firstName: name,
    lastName: name,
})

export const registerSchema = z.discriminatedUnion('role', [
    base.extend({ role: z.literal('reader') }),
    base.extend({
        role: z.literal('publisher'),
        publisherName: z.string().trim().min(2, 'Publisher name is too short.').max(200),
        publisherDescription: z.string().trim().max(2000).optional(),
    }),
])

export const loginSchema = z.object({
    email,
    password: z.string().min(1, 'Please enter your password.').max(128),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
