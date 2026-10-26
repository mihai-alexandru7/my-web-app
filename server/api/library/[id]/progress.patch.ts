import { idParamSchema } from '#server/schemas/common'
import { updateProgressSchema } from '#server/schemas/library'
import { libraryService } from '#server/services/libraryService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { id } = validatedParams(event, idParamSchema)
    const { lastPosition } = await validatedBody(event, updateProgressSchema)
    await libraryService.updateProgress(user.id, id, lastPosition)
    return { ok: true }
})