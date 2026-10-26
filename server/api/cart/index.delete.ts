import { cartService } from '#server/services/cartService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    await cartService.clear(user.id)
    return { ok: true }
})