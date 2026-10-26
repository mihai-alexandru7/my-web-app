import { genreSchema } from '#server/schemas/administration'
import { genreService } from '#server/services/genreService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const body = await validatedBody(event, genreSchema)
    const genre = await genreService.create(body.name)
    setResponseStatus(event, 201)
    return { genre }
})
