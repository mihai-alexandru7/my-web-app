import { idParamSchema } from '../../../schemas/administrator'
import { languageService } from '../../../services/languageService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    await languageService.remove(id)
    return { ok: true }
})
