import { idParamSchema } from '#server/schemas/common.ts'
import { bookRepository } from '#server/repositories/bookRepository.ts'
import { sendStoredFile } from '#server/utils/fileStorage.ts'

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    const book = await bookRepository.findFilePaths(id)

    if (!book || !book.samplePath) {
        throw createError({ statusCode: 404, message: 'Free sample not available for this book.' })
    }

    return sendStoredFile(event, book.samplePath, {
        disposition: `inline; filename="sample-${id}"`
    })
})
