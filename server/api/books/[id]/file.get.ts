import { extname } from 'node:path'
import { idParamSchema } from '#server/schemas/common'
import { bookRepository } from '#server/repositories/bookRepository'
import { sendStoredFile } from '#server/utils/fileStorage'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { id } = validatedParams(event, idParamSchema)

    const book = await bookRepository.findFilePaths(id)
    if (!book) {
        throw createError({ statusCode: 404, message: 'Book not found.' })
    }

    const isOwnerPublisher = user.role === 'publisher' && book.publisherId === user.id
    const isAdmin = user.role === 'administrator'
    const isBuyer = !isAdmin && !isOwnerPublisher && await bookRepository.hasPurchased(user.id, id)

    if (!isAdmin && !isOwnerPublisher && !isBuyer) {
        throw createError({
            statusCode: 403,
            message: 'You must purchase this book before you can access its contents.'
        })
    }

    return sendStoredFile(event, book.filePath, {
        cacheControl: 'private, no-store',
        disposition: `inline; filename="${encodeURIComponent(book.title)}${extname(book.filePath)}"`
    })
})
