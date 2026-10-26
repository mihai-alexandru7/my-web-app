export default defineNuxtRouteMiddleware(() => {
    const { loggedIn, user } = useUserSession()

    if (!loggedIn.value) {
        return navigateTo('/account/sign-in')
    }

    if (user.value?.role !== 'reader') {
        return navigateTo('/')
    }
})