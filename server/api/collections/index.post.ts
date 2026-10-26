import { collectionSchema } from '#server/schemas/library'
import { collectionService } from '#server/services/collectionService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const body = await validatedBody(event, collectionSchema)
    const collection = await collectionService.create(user.id, body)
    setResponseStatus(event, 201)
    return { collection }
})