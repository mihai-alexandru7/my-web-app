import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, join, resolve, sep } from 'node:path'
import type { H3Event } from 'h3'

export type UploadKind = 'book' | 'cover' | 'sample'
export type FileFormat = 'pdf' | 'epub' | 'jpg' | 'png' | 'webp'

const MB = 1024 * 1024

export const uploadRules: Record<UploadKind, { directory: string; maxBytes: number; formats: FileFormat[]; label: string }> = {
    book: { directory: 'books', maxBytes: 50 * MB, formats: ['epub', 'pdf'], label: 'Book file' },
    sample: { directory: 'samples', maxBytes: 10 * MB, formats: ['epub', 'pdf'], label: 'Sample file' },
    cover: { directory: 'covers', maxBytes: 5 * MB, formats: ['jpg', 'png', 'webp'], label: 'Cover image' }
}

export const maxUploadRequestBytes =
    Object.values(uploadRules).reduce((sum, rule) => sum + rule.maxBytes, 0) + MB

const storageRoot = () => resolve(process.env.UPLOAD_DIR || join(process.cwd(), 'storage'))

function detectFormat(data: Buffer): FileFormat | null {
    if (data.subarray(0, 5).toString('latin1') === '%PDF-') return 'pdf'
    if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'jpg'
    if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
    if (data.subarray(0, 4).toString('latin1') === 'RIFF' && data.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp'
    if (data.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) && data.subarray(0, 200).includes('application/epub+zip')) return 'epub'
    return null
}

export function getMimeType(filePath: string): string {
    const ext = extname(filePath).toLowerCase().replace('.', '')
    switch (ext) {
        case 'pdf': return 'application/pdf'
        case 'epub': return 'application/epub+zip'
        case 'jpg':
        case 'jpeg': return 'image/jpeg'
        case 'png': return 'image/png'
        case 'webp': return 'image/webp'
        default: return 'application/octet-stream'
    }
}

export function assertValidUpload(kind: UploadKind, data: Buffer): FileFormat {
    const rule = uploadRules[kind]
    if (data.length === 0) {
        throw createError({ statusCode: 400, message: `${rule.label} is empty.` })
    }
    if (data.length > rule.maxBytes) {
        throw createError({ statusCode: 413, message: `${rule.label} is too large (max ${rule.maxBytes / MB} MB).` })
    }
    const format = detectFormat(data)
    if (!format || !rule.formats.includes(format)) {
        throw createError({
            statusCode: 415,
            message: `${rule.label} must be one of: ${rule.formats.join(', ')}.`
        })
    }
    return format
}

export async function storeUpload(kind: UploadKind, data: Buffer): Promise<string> {
    const format = assertValidUpload(kind, data)
    const relativePath = `${uploadRules[kind].directory}/${randomUUID()}.${format}`
    const absolutePath = join(storageRoot(), relativePath)
    await mkdir(dirname(absolutePath), { recursive: true })
    await writeFile(absolutePath, data, { flag: 'wx' })
    return relativePath
}

export async function removeStoredFiles(relativePaths: string[]): Promise<void> {
    await Promise.all(
        relativePaths
            .filter(Boolean)
            .map((path) => rm(resolveStoredPath(path), { force: true }).catch(() => undefined)),
    )
}

export function resolveStoredPath(relativePath: string): string {
    const root = storageRoot()
    const absolutePath = resolve(root, relativePath)
    if (!absolutePath.startsWith(root + sep)) {
        throw createError({ statusCode: 400, message: 'Invalid file path.' })
    }
    return absolutePath
}

export async function sendStoredFile(event: H3Event, relativePath: string, options?: { cacheControl?: string; disposition?: string }) {
    const absolutePath = resolveStoredPath(relativePath)
    try {
        const fileStat = await stat(absolutePath)
        const mime = getMimeType(relativePath)

        setHeader(event, 'Content-Type', mime)
        setHeader(event, 'Content-Length', fileStat.size)
        if (options?.cacheControl) {
            setHeader(event, 'Cache-Control', options.cacheControl)
        }
        if (options?.disposition) {
            setHeader(event, 'Content-Disposition', options.disposition)
        }

        return sendStream(event, createReadStream(absolutePath))
    } catch {
        throw createError({ statusCode: 404, message: 'File not found on disk.' })
    }
}
