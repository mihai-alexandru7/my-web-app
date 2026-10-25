import { idParamSchema, languageUpdateSchema } from '#server/schemas/administration'
import { languageService } from '#server/services/languageService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    const body = await readValidatedBody(event, languageUpdateSchema.parse)
    return { language: await languageService.update(id, body) }
})
