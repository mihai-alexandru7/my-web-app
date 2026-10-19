import { genreSchema } from '../../../schemas/administrator'
import { genreService } from '../../../services/genreService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const body = await readValidatedBody(event, genreSchema.parse)
    const genre = await genreService.create(body.name)
    setResponseStatus(event, 201)
    return { genre }
})
