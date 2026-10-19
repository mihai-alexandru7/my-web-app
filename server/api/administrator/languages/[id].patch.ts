import { idParamSchema, languageUpdateSchema } from '../../../schemas/administrator'
import { languageService } from '../../../services/languageService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    const body = await readValidatedBody(event, languageUpdateSchema.parse)
    return { language: await languageService.update(id, body) }
})
