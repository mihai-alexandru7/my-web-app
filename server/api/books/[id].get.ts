import { idParamSchema } from '#server/schemas/common'
import { bookstoreService } from '#server/services/bookstoreService'

export default defineEventHandler(async (event) => {
    const { id } = validatedParams(event, idParamSchema)
    const { user } = await getUserSession(event)
    const book = await bookstoreService.getDetail(id, user?.id)
    return { book }
})