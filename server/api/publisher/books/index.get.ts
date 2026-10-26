import { publisherBookListQuerySchema } from '#server/schemas/publisher'
import { publisherBookService } from '#server/services/publisherBookService'

export default defineEventHandler(async (event) => {
    const publisher = await requireRole(event, 'publisher')
    const query = await getValidatedQuery(event, publisherBookListQuerySchema.parse)
    return publisherBookService.list(publisher.id, query)
})
