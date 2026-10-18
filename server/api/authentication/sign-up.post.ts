import { registerSchema } from '../../schemas/authentication'
import { authenticationService } from '../../services/authenticationService'

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, registerSchema.parse)
    const user = await authenticationService.register(body)
    await setUserSession(event, { user })
    setResponseStatus(event, 201)
    return { user }
})
