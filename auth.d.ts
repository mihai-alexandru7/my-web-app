import 'nuxt-auth-utils'

declare module '#auth-utils' {
    interface User {
        id: number
        email: string
        firstName: string
        lastName: string
        role: 'reader' | 'publisher' | 'administrator'
    }
}

export {}
