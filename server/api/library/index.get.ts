import { libraryService } from '#server/services/libraryService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const books = await libraryService.list(user.id)
    return { books }
})