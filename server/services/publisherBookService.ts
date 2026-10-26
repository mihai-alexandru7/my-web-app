import { bookRepository } from '#server/repositories/bookRepository'
import { languageRepository } from '#server/repositories/languageRepository'
import { publisherBookRepository } from '#server/repositories/publisherBookRepository'
import type { BookColumns } from '#server/repositories/publisherBookRepository'
import { getDatabase } from '#server/utils/database'
import type { Executor } from '#server/utils/database'
import { assertValidUpload, removeStoredFiles, storeUpload } from '#server/utils/fileStorage'
import type { UploadKind } from '#server/utils/fileStorage'
import { isDuplicateEntry } from '#server/utils/mysqlErrors'
import type { BookUploadFiles } from '#server/utils/multipart'
import type { CreateBookInput, PublisherBookListQuery, UpdateBookInput } from '#server/schemas/publisher'

const unique = <T>(values: T[]) => [...new Set(values)]

function rethrowDuplicateIsbn(error: unknown): never {
    if (isDuplicateEntry(error)) {
        throw createError({ statusCode: 409, message: 'A book with this ISBN already exists.' })
    }
    throw error
}

async function assertReferencesExist(
    refs: { languageId?: number; genreIds?: number[]; categoryIds?: number[] },
    executor: Executor = getDatabase()
) {
    if (refs.languageId !== undefined && !(await languageRepository.findById(refs.languageId, executor))) {
        throw createError({statusCode: 400, message: 'Unknown language.' })
    }
    if (refs.genreIds?.length) {
        const ids = unique(refs.genreIds)
        if ((await publisherBookRepository.countGenres(ids, executor)) !== ids.length) {
            throw createError({ statusCode: 400, message: 'One or more genres do not exist.' })
        }
    }
    if (refs.categoryIds?.length) {
        const ids = unique(refs.categoryIds)
        if ((await publisherBookRepository.countCategories(ids, executor)) !== ids.length) {
            throw createError({ statusCode: 400, message: 'One or more categories do not exist.' })
        }
    }
}

async function resolveAuthorIds(
    names: string[],
    executor: Executor = getDatabase()
): Promise<number[]> {
    const seen = new Set<string>()
    const ids: number[] = []
    for (const name of names) {
        const key = name.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        const existing = await publisherBookRepository.findAuthorIdByName(name, executor)
        ids.push(existing ?? await publisherBookRepository.createAuthor(name, executor))
    }
    return ids
}

export const publisherBookService = {
    async list(publisherId: number, query: PublisherBookListQuery) {
        const { page, pageSize, ...filter } = query
        const [items, total] = await Promise.all([
            publisherBookRepository.list(publisherId, filter, { limit: pageSize, offset: (page - 1) * pageSize }),
            publisherBookRepository.count(publisherId, filter)
        ])
        return { items, total, page, pageSize }
    },

    async getDetail(publisherId: number, id: number) {
        const detail = await bookRepository.findDetailById(id)
        if (!detail || detail.publisherId !== publisherId) {
            throw createError({ statusCode: 404, message: 'Book not found.' })
        }
        const { reviewedBy: _reviewedBy, ...book } = detail
        return book
    },

    async create(publisherId: number, input: CreateBookInput, files: BookUploadFiles) {
        if (!files.book) {
            throw createError({ statusCode: 400, message: 'The book file is required.' })
        }
        for (const kind of Object.keys(files) as UploadKind[]) {
            assertValidUpload(kind, files[kind]!.data)
        }
        await assertReferencesExist(input, getDatabase())

        const stored: string[] = []
        try {
            const filePath = await storeUpload('book', files.book.data)
            stored.push(filePath)
            const coverPath = files.cover
                ? await storeUpload('cover', files.cover.data)
                : undefined
            if (coverPath) stored.push(coverPath)
            const samplePath = files.sample
                ? await storeUpload('sample', files.sample.data)
                : undefined
            if (samplePath) stored.push(samplePath)

            const bookId = await getDatabase().transaction(async (transaction) => {
                const id = await publisherBookRepository.insert(
                    {
                        publisherId,
                        languageId: input.languageId,
                        title: input.title,
                        description: input.description,
                        price: input.price,
                        filePath,
                        coverPath,
                        samplePath,
                        isbn: input.isbn,
                        publishedYear: input.publishedYear
                    },
                    transaction
                )
                await publisherBookRepository.replaceAuthors(id, await resolveAuthorIds(input.authors, transaction), transaction)
                await publisherBookRepository.replaceGenres(id, unique(input.genreIds), transaction)
                await publisherBookRepository.replaceCategories(id, unique(input.categoryIds), transaction)
                return id
            })

            return await this.getDetail(publisherId, bookId)
        } catch (error) {
            await removeStoredFiles(stored)
            return rethrowDuplicateIsbn(error)
        }
    },

    async update(publisherId: number, id: number, input: UpdateBookInput, files?: BookUploadFiles) {
        const newlyStored: string[] = []
        const toDeleteOld: string[] = []

        try {
            const newFilePaths: { filePath?: string; coverPath?: string; samplePath?: string } = {}
            if (files?.book) {
                assertValidUpload('book', files.book.data)
                newFilePaths.filePath = await storeUpload('book', files.book.data)
                newlyStored.push(newFilePaths.filePath)
            }
            if (files?.cover) {
                assertValidUpload('cover', files.cover.data)
                newFilePaths.coverPath = await storeUpload('cover', files.cover.data)
                newlyStored.push(newFilePaths.coverPath)
            }
            if (files?.sample) {
                assertValidUpload('sample', files.sample.data)
                newFilePaths.samplePath = await storeUpload('sample', files.sample.data)
                newlyStored.push(newFilePaths.samplePath)
            }

            await getDatabase().transaction(async (transaction) => {
                const current = await publisherBookRepository.findOwnedForUpdate(id, publisherId, transaction)
                if (!current) {
                    throw createError({ statusCode: 404, message: 'Book not found.' })
                }
                if (current.status === 'withdrawn') {
                    throw createError({ statusCode: 409, message: 'Withdrawn books cannot be edited.' })
                }
                await assertReferencesExist(input, transaction)

                const columns: BookColumns = { updatedAt: new Date() }
                if (input.title !== undefined) columns.title = input.title
                if (input.description !== undefined) columns.description = input.description
                if (input.price !== undefined) columns.price = input.price
                if (input.languageId !== undefined) columns.languageId = input.languageId
                if (input.isbn !== undefined) columns.isbn = input.isbn
                if (input.publishedYear !== undefined) columns.publishedYear = input.publishedYear

                if (newFilePaths.filePath) {
                    columns.filePath = newFilePaths.filePath
                    toDeleteOld.push(current.filePath)
                }
                if (newFilePaths.coverPath) {
                    columns.coverPath = newFilePaths.coverPath
                    if (current.coverPath) toDeleteOld.push(current.coverPath)
                }
                if (newFilePaths.samplePath) {
                    columns.samplePath = newFilePaths.samplePath
                    if (current.samplePath) toDeleteOld.push(current.samplePath)
                }

                if (current.status === 'rejected') {
                    Object.assign(columns, { status: 'pending', rejectionReason: null, reviewedBy: null, reviewedAt: null })
                }
                await publisherBookRepository.update(id, columns, transaction)

                if (input.authors) {
                    await publisherBookRepository.replaceAuthors(id, await resolveAuthorIds(input.authors, transaction), transaction)
                }
                if (input.genreIds) await publisherBookRepository.replaceGenres(id, unique(input.genreIds), transaction)
                if (input.categoryIds) await publisherBookRepository.replaceCategories(id, unique(input.categoryIds), transaction)
            })

            await removeStoredFiles(toDeleteOld)
        } catch (error) {
            await removeStoredFiles(newlyStored)
            rethrowDuplicateIsbn(error)
        }

        return this.getDetail(publisherId, id)
    },

    async withdraw(publisherId: number, id: number) {
        const withdrawn = await getDatabase().transaction(async (transaction) => {
            const updated = await publisherBookRepository.withdrawIfActive(id, publisherId, transaction)
            if (updated) {
                await bookRepository.removeFromCarts(id, transaction)
                await bookRepository.removeFromWishlists(id, transaction)
            }
            return updated
        })
        if (withdrawn) return { id, status: 'withdrawn' as const }

        const current = await publisherBookRepository.findOwnedStatus(id, publisherId)
        if (!current) {
            throw createError({ statusCode: 404, message: 'Book not found.' })
        }
        throw createError({ statusCode: 409, message: `Only pending or approved books can be withdrawn (current status: ${current}).`, })
    }
}
