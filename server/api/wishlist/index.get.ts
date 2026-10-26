import { wishlistService } from '#server/services/wishlistService'

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const items = await wishlistService.list(user.id)
    return { items }
})