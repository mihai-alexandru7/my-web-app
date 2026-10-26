import { bookstoreService } from '#server/services/bookstoreService'

export default defineEventHandler(async () => {
    return bookstoreService.getFeatured()
})