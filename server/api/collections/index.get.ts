import { collectionService } from '#server/services/collectionService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const collections = await collectionService.list(user.id)
    return { collections }
})