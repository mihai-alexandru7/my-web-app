import { genreService } from '#server/services/genreService'

export default defineEventHandler(async () => {
    return { genres: await genreService.list() }
})
