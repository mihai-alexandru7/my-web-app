import { z } from 'zod'
import { idParamSchema, idSchema } from '#server/schemas/common'
import { collectionService } from '#server/services/collectionService'

const addBookSchema = z.object({
    bookId: idSchema
})

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { id } = validatedParams(event, idParamSchema)
    const { bookId } = await validatedBody(event, addBookSchema)
    await collectionService.addBook(user.id, id, bookId)
    return { ok: true }
})