import { idParamSchema, genreSchema } from '#server/schemas/administration'
import { genreService } from '#server/services/genreService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = validatedParams(event, idParamSchema)
    const body = await validatedBody(event, genreSchema)
    return { genre: await genreService.update(id, body.name) }
})
