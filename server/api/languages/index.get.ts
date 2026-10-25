import { languageService } from '#server/services/languageService'

export default defineEventHandler(async () => {
    return { languages: await languageService.list() }
})
