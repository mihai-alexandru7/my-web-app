import { idParamSchema } from '#server/schemas/common'
import { bookRepository } from '#server/repositories/bookRepository'
import { canViewBookAsset } from '#server/utils/bookAccess'
import { sendStoredFile } from '#server/utils/fileStorage'

export default defineEventHandler(async (event) => {
    const { id } = validatedParams(event, idParamSchema)
    const book = await bookRepository.findFilePaths(id)

    if (!book || !book.coverPath || !(await canViewBookAsset(event, book))) {
        throw createError({ statusCode: 404, message: 'Cover image not found.' })
    }

    return sendStoredFile(event, book.coverPath, {
        // Always revalidate (cheap 304 thanks to the ETag) so a new cover shows up immediately.
        cacheControl: book.status === 'approved' ? 'public, no-cache' : 'private, no-cache'
    })
})
