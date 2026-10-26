import { z } from 'zod'
import { idSchema } from '#server/schemas/common'
import { wishlistService } from '#server/services/wishlistService'

const addWishlistSchema = z.object({
    bookId: idSchema
})

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { bookId } = await validatedBody(event, addWishlistSchema)
    await wishlistService.add(user.id, bookId)
    setResponseStatus(event, 201)
    return { ok: true }
})