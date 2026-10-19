import { languageService } from '../../services/languageService'

export default defineEventHandler(async () => {
    return { languages: await languageService.list() }
})
