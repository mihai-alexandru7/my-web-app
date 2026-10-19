import { genreService } from '../../services/genreService'

export default defineEventHandler(async () => {
    return { genres: await genreService.list() }
})
