import { idParamSchema } from '#server/schemas/common'
import { collectionSchema } from '#server/schemas/library'
import { collectionService } from '#server/services/collectionService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { id } = validatedParams(event, idParamSchema)
    const body = await validatedBody(event, collectionSchema)
    return { collection: await collectionService.update(user.id, id, body) }
})