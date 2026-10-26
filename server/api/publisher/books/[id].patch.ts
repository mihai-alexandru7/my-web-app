import { bookIdParamSchema, updateBookSchema, updateBookFieldsSchema } from '#server/schemas/publisher'
import { publisherBookService } from '#server/services/publisherBookService'
import { readBookUpload } from '#server/utils/multipart'
import { validatedParams, validatedBody } from '#server/utils/validation'

export default defineEventHandler(async (event) => {
    const publisher = await requireRole(event, 'publisher')
    const { id } = validatedParams(event, bookIdParamSchema)

    const contentType = getRequestHeader(event, 'content-type') || ''

    if (contentType.includes('multipart/form-data')) {
        const { fields, files } = await readBookUpload(event)

        const hasFields = Object.keys(fields).length > 0
        const hasFiles = Object.keys(files).length > 0

        if (!hasFields && !hasFiles) {
            throw createError({ statusCode: 400, message: 'Provide at least one field or file to update.' })
        }

        const input = validateInput(updateBookFieldsSchema, fields)
        return { book: await publisherBookService.update(publisher.id, id, input, files) }
    }

    const input = await validatedBody(event, updateBookSchema)
    return { book: await publisherBookService.update(publisher.id, id, input) }
})
