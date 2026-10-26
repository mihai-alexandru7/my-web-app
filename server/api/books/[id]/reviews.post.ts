import { idParamSchema } from '#server/schemas/common'
import { reviewSchema } from '#server/schemas/library'
import { reviewService } from '#server/services/reviewService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { id } = validatedParams(event, idParamSchema)
    const body = await validatedBody(event, reviewSchema)
    await reviewService.addOrUpdate(user.id, id, body)
    return { ok: true }
})