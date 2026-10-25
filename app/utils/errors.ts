type Issue = { message?: string; path?: (string | number)[] }

interface ApiErrorLike {
    data?: { message?: string; statusMessage?: string; data?: unknown }
    message?: string
}

export function getErrorMessage(error: unknown): string {
    const e = error as ApiErrorLike
    const details = e?.data?.data as { issues?: Issue[] } | Issue[] | undefined
    const issues = Array.isArray(details) ? details : details?.issues

    return (
        issues?.[0]?.message ||
        e?.data?.message ||
        e?.data?.statusMessage ||
        e?.message ||
        'Something went wrong. Please try again.'
    )
}

export function getFieldErrors(error: unknown): Record<string, string> {
    const e = error as ApiErrorLike
    const details = e?.data?.data as { issues?: Issue[] } | Issue[] | undefined
    const issues = Array.isArray(details) ? details : details?.issues
    const map: Record<string, string> = {}

    if (Array.isArray(issues)) {
        for (const issue of issues) {
            const field = issue.path?.[0]
            if (field && typeof field === 'string' && issue.message && !map[field]) {
                map[field] = issue.message
            }
        }
    }
    return map
}
