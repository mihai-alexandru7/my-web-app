import { idParamSchema } from '#server/schemas/administration'
import { userManagementService } from '#server/services/userManagementService'

export default defineEventHandler(async (event) => {
    await requireRole(event, 'administrator')
    const { id } = validatedParams(event, idParamSchema)
    return { user: await userManagementService.getDetail(id) }
})
