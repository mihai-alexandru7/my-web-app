import { idParamSchema } from '#server/schemas/administration'
import { genreService } from '#server/services/genreService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = validatedParams(event, idParamSchema)
    await genreService.remove(id)
    return { ok: true }
})
