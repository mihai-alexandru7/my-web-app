export function formatDate(value: string | Date | null | undefined): string {
    if (!value) return '—'
    return new Intl.DateTimeFormat('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(value))
}

export function formatPrice(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '—'
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '—'
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON'
    }).format(num)
}
