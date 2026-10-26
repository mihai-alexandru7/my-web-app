import { languageSchema } from '#server/schemas/administration'
import { languageService } from '#server/services/languageService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const body = await validatedBody(event, languageSchema)
    const language = await languageService.create(body)
    setResponseStatus(event, 201)
    return { language }
})
