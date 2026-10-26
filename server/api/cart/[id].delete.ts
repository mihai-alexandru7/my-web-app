import { idParamSchema } from '#server/schemas/common'
import { cartService } from '#server/services/cartService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { id } = validatedParams(event, idParamSchema)
    await cartService.remove(user.id, id)
    return { ok: true }
})