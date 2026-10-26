import { cartService } from '#server/services/cartService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    return cartService.list(user.id)
})