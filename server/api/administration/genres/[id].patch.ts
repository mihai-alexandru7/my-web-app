import { idParamSchema, genreSchema } from '#server/schemas/administration'
import { genreService } from '#server/services/genreService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    const body = await readValidatedBody(event, genreSchema.parse)
    return { genre: await genreService.update(id, body.name) }
})
