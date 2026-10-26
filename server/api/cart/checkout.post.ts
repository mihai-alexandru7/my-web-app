import { z } from 'zod'
import { cartService } from '#server/services/cartService'

const checkoutSchema = z.object({
    paymentMethod: z.string().trim().min(1).default('card')
}).default({ paymentMethod: 'card' })

export default defineEventHandler(async (event) => {
    const user = await requireActiveUser(event)
    const { paymentMethod } = await validatedBody(event, checkoutSchema)
    const order = await cartService.checkout(user.id, paymentMethod)
    setResponseStatus(event, 201)
    return { order }
})