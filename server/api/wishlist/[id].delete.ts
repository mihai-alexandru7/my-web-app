import { idParamSchema } from '#server/schemas/common'
import { wishlistService } from '#server/services/wishlistService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { id } = validatedParams(event, idParamSchema)
    await wishlistService.remove(user.id, id)
    return { ok: true }
})