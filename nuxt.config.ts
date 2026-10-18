export default defineNuxtConfig({
  modules: ['nuxt-auth-utils'],
  runtimeConfig: {
    db: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'db',
    },
    administratorEmail: '',
    administratorPassword: '',
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})
