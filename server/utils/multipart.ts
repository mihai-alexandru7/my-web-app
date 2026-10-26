import type { H3Event } from 'h3'
import type { UploadKind } from '#server/utils/fileStorage'
import { maxUploadRequestBytes } from '#server/utils/fileStorage'

export type UploadedFile = { data: Buffer }
export type BookUploadFiles = Partial<Record<UploadKind, UploadedFile>>

const fileFields: Record<string, UploadKind> = {
    file: 'book',
    cover: 'cover',
    sample: 'sample'
}

export async function readBookUpload(event: H3Event) {
    const contentLength = Number(getRequestHeader(event, 'content-length') ?? 0)
    if (contentLength > maxUploadRequestBytes) {
        throw createError({ statusCode: 413, message: 'The upload is too large.' })
    }

    const parts = await readMultipartFormData(event)
    if (!parts) {
        throw createError({ statusCode: 400, message: 'Expected a multipart/form-data body.' })
    }

    const fields: Record<string, string | string[]> = Object.create(null)
    const files: BookUploadFiles = {}

    for (const part of parts) {
        if (!part.name) continue
        const name = part.name.replace(/\[\]$/, '')

        if (part.filename !== undefined) {
            const kind = fileFields[name]
            if (kind && part.data.length > 0) files[kind] = { data: part.data }
            continue
        }

        const value = part.data.toString('utf8')
        const existing = fields[name]
        if (existing === undefined) fields[name] = value
        else fields[name] = Array.isArray(existing) ? [...existing, value] : [existing, value]
    }

    return { fields, files }
}
