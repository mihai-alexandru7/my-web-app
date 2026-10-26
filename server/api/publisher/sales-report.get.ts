import { salesReportQuerySchema } from '#server/schemas/publisher'
import { salesReportService } from '#server/services/salesReportService'

export default defineEventHandler(async (event) => {
    const publisher = await requireRole(event, 'publisher')
    const query = await getValidatedQuery(event, salesReportQuerySchema.parse)
    return { report: await salesReportService.get(publisher.id, query) }
})
