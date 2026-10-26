import { idParamSchema } from '#server/schemas/common.ts'
import { bookRepository } from '#server/repositories/bookRepository.ts'
import { sendStoredFile } from '#server/utils/fileStorage.ts'

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    const book = await bookRepository.findFilePaths(id)

    if (!book || !book.coverPath) {
        throw createError({ statusCode: 404, message: 'Cover image not found.' })
    }

    return sendStoredFile(event, book.coverPath, {
        cacheControl: 'public, max-age=86400, stale-while-revalidate=3600'
    })
})
