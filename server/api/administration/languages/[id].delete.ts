import { idParamSchema } from '#server/schemas/administration'
import { languageService } from '#server/services/languageService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = validatedParams(event, idParamSchema)
    await languageService.remove(id)
    return { ok: true }
})
