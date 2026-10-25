import { idParamSchema } from '#server/schemas/administration'
import { genreService } from '#server/services/genreService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    await genreService.remove(id)
    return { ok: true }
})
