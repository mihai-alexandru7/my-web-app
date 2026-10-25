import { z } from 'zod'

const email = z.email('Invalid email address.')

const password = z.string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(128, 'Password is too long.')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
    .regex(/\d/, 'Password must contain at least one digit.')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.')

const name = z.string().trim()
    .min(1, 'This field is required.')
    .max(100)

const base = z.object({
    email,
    password,
})

export const signUpSchema = z.discriminatedUnion(
    'role',
    [
        base.extend({
            role: z.literal('reader'),
            firstName: name,
            lastName: name,
        }),
        base.extend({
            role: z.literal('publisher'),
            publisherName: z.string().trim().min(2, 'Publisher name is too short.').max(200),
            publisherDescription: z.string().trim().max(2000).optional()
        })
    ]
)

export const signInSchema = z.object({
    email,
    password: z.string()
        .min(1, 'Please enter your password.')
        .max(128)
})

export const updateProfileSchema = z.object({
    firstName: name.optional(),
    lastName: name.optional(),
    publisherName: z.string().trim().min(2).max(200).optional(),
    publisherDescription: z.string().trim().max(2000).optional(),
})

export const changeEmailSchema = z.object({
    newEmail: email,
    password: z.string().min(1, 'Password is required to confirm change.')
})

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required.'),
        newPassword: password,
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: 'New password must be different from current password.',
        path: ['newPassword']
    })

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>