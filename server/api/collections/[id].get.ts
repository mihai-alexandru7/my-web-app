import { idParamSchema } from '#server/schemas/common'
import { collectionService } from '#server/services/collectionService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { id } = validatedParams(event, idParamSchema)
    return { collection: await collectionService.getDetail(user.id, id) }
})