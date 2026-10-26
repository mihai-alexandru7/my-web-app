import { idParamSchema } from '#server/schemas/common'
import { libraryService } from '#server/services/libraryService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { id } = validatedParams(event, idParamSchema)
    return libraryService.getBookProgress(user.id, id)
})