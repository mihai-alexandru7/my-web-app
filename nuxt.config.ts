export default defineNuxtConfig({
  modules: ['nuxt-auth-utils'],
  runtimeConfig: {
    db: {
      host: '',
      port: '3306',
      user: '',
      password: '',
      database: '',
    },
    administratorEmail: '',
    administratorPassword: ''
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
