function unwrap(error: any) {
    return error?.cause?.code ? error.cause : error
}

export function isDuplicateEntry(error: any): boolean {
    return unwrap(error)?.code === 'ER_DUP_ENTRY'
}

export function isForeignKeyViolation(error: any): boolean {
    const code = unwrap(error)?.code
    return code === 'ER_ROW_IS_REFERENCED_2' || code === 'ER_ROW_IS_REFERENCED'
}
