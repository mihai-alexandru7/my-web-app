import { languageSchema } from '../../../schemas/administrator'
import { languageService } from '../../../services/languageService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const body = await readValidatedBody(event, languageSchema.parse)
    const language = await languageService.create(body)
    setResponseStatus(event, 201)
    return { language }
})
