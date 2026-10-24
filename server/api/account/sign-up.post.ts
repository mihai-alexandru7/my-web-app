import { signUpSchema } from '#server/schemas/account'
import { accountService } from '#server/services/accountService'

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, signUpSchema.parse)
    const user = await accountService.signUp(body)
    await setUserSession(event, { user })
    setResponseStatus(event, 201)
    return { user }
})
