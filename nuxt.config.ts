export default defineNuxtConfig({
    css: [
        '@fontsource/sorts-mill-goudy/400.css',
        '@/assets/css/custom_properties.css'
    ],
    modules: ['nuxt-auth-utils'],
    runtimeConfig: {
        db: {
            host: '',
            port: '3306',
            user: '',
            password: '',
            database: ''
        },
        administratorEmail: '',
        administratorPassword: ''
    },
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true }
})
