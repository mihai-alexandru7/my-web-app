import { loginSchema } from '../../schemas/authentication'
import { authenticationService } from '../../services/authenticationService'

export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, loginSchema.parse)
    const user = await authenticationService.login(body)
    await setUserSession(event, { user })
    return { user }
})
