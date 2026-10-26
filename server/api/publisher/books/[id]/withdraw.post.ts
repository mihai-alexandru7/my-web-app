import { bookIdParamSchema } from '#server/schemas/publisher'
import { publisherBookService } from '#server/services/publisherBookService'

export default defineEventHandler(async (event) => {
    const publisher = await requireRole(event, 'publisher')
    const { id } = await getValidatedRouterParams(event, bookIdParamSchema.parse)
    return { book: await publisherBookService.withdraw(publisher.id, id) }
})
