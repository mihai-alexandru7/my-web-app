import { bookstoreQuerySchema } from '#server/schemas/bookstore'
import { bookstoreService } from '#server/services/bookstoreService'

export default defineEventHandler(async (event) => {
    const query = validatedQuery(event, bookstoreQuerySchema)
    return bookstoreService.list(query)
})