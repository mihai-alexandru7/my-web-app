import { idParamSchema } from '#server/schemas/common'
import { bookRepository } from '#server/repositories/bookRepository'
import { canViewBookAsset } from '#server/utils/bookAccess'
import { extname } from 'node:path'
import { sendStoredFile } from '#server/utils/fileStorage'

export default defineEventHandler(async (event) => {
    const { id } = validatedParams(event, idParamSchema)
    const book = await bookRepository.findFilePaths(id)

    if (!book || !book.samplePath || !(await canViewBookAsset(event, book))) {
        throw createError({ statusCode: 404, message: 'Free sample not available for this book.' })
    }

    return sendStoredFile(event, book.samplePath, {
        cacheControl: book.status === 'approved' ? 'public, no-cache' : 'private, no-cache',
        disposition: `inline; filename="sample-${id}${extname(book.samplePath)}"`
    })
})
