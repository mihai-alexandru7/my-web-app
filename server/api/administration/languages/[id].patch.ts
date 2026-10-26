import { idParamSchema, languageUpdateSchema } from '#server/schemas/administration'
import { languageService } from '#server/services/languageService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = validatedParams(event, idParamSchema)
    const body = await validatedBody(event, languageUpdateSchema)
    return { language: await languageService.update(id, body) }
})
