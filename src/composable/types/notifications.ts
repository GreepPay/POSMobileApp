export interface Notification {
  id: number
  title: string
  content: string
  delivery_status: "pending" | "delivered" | "failed" | "sent"
  created_at: string
}

export interface MappedNotification {
  icon: string
  title: string
  contents: string[]
  date: string
}
