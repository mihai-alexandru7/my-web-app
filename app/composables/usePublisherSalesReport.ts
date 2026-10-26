import type { SalesReportData } from '@/types/publisher'

export function usePublisherSalesReport() {
  const from = ref('')
  const to = ref('')

  const query = computed(() => ({
    from: from.value || undefined,
    to: to.value || undefined,
  }))

  const { data, pending } = useFetch<{ report: SalesReportData }>('/api/publisher/sales-report', { query })
  const report = computed(() => data.value?.report)

  return { from, to, report, pending }
}