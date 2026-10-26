import { collectionBookParamSchema } from '#server/schemas/library'
import { collectionService } from '#server/services/collectionService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { id, bookId } = validatedParams(event, collectionBookParamSchema)
    await collectionService.removeBook(user.id, id, bookId)
    return { ok: true }
})