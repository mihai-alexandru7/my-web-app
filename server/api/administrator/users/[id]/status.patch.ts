import { idParamSchema, userStatusSchema } from '#server/schemas/administrator.ts'
import { userManagementService } from '#server/services/userManagementService.ts'

export default defineEventHandler(async (event) => {
    const admin = await requireRole(event, 'administrator')
    const { id } = await getValidatedRouterParams(event, idParamSchema.parse)
    const { isActive } = await readValidatedBody(event, userStatusSchema.parse)
    return { user: await userManagementService.setActive(id, isActive, admin.id) }
})
