import { idParamSchema } from '#server/schemas/common'
import { reviewService } from '#server/services/reviewService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { id } = validatedParams(event, idParamSchema)
    const review = await reviewService.getUserReview(user.id, id)
    return { review }
})