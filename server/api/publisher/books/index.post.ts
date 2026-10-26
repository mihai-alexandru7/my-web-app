import { createBookSchema } from '#server/schemas/publisher'
import { publisherBookService } from '#server/services/publisherBookService'

export default defineEventHandler(async (event) => {
    const publisher = await requireRole(event, 'publisher')
    const { fields, files } = await readBookUpload(event)
    const input = validateInput(createBookSchema, fields)
    const book = await publisherBookService.create(publisher.id, input, files)
    setResponseStatus(event, 201)
    return { book }
})
