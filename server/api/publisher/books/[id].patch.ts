import { bookIdParamSchema, updateBookSchema } from '#server/schemas/publisher'
import { publisherBookService } from '#server/services/publisherBookService'
import { readBookUpload } from '#server/utils/multipart'

export default defineEventHandler(async (event) => {
    const publisher = await requireRole(event, 'publisher')
    const { id } = await getValidatedRouterParams(event, bookIdParamSchema.parse)

    const contentType = getRequestHeader(event, 'content-type') || ''

    if (contentType.includes('multipart/form-data')) {
        const { fields, files } = await readBookUpload(event)
        const input = validateInput(updateBookSchema, fields)
        return { book: await publisherBookService.update(publisher.id, id, input, files) }
    }

    const input = await readValidatedBody(event, updateBookSchema.parse)
    return { book: await publisherBookService.update(publisher.id, id, input) }
})
