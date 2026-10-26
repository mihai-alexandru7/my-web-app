import { z } from 'zod'
import { idSchema } from '#server/schemas/common'
import { cartService } from '#server/services/cartService'

const addToCartSchema = z.object({
    bookId: idSchema
})

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { bookId } = await validatedBody(event, addToCartSchema)
    await cartService.add(user.id, bookId)
    setResponseStatus(event, 201)
    return { ok: true }
})