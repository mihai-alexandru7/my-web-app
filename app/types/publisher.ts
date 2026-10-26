export type BookStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

export interface NamedItem {
  id: number
  name: string
}

export interface PublisherBookRow {
  id: number
  title: string
  price: string
  status: BookStatus
  coverPath: string | null
  isbn: string | null
  rejectionReason: string | null
  createdAt: string
}

export interface BookToEdit {
  id: number
  title: string
  description: string | null
  price: string
  isbn: string | null
  publishedYear: number | null
  language: { code: string; name: string }
  authors: NamedItem[]
  genres: NamedItem[]
  categories: NamedItem[]
}

export interface SalesReportData {
  summary: { unitsSold: number; orders: number; revenue: string }
  books: {
    bookId: number
    title: string
    status: string
    currentPrice: string
    unitsSold: number
    revenue: string
  }[]
  months: { month: string; unitsSold: number; revenue: string }[]
}

export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'right'
  width?: string
}