export interface Notification {
  id: number
  title: string
  content: string
  delivery_status: "pending" | "delivered" | "failed" | "sent"
  created_at: string
}

export interface MappedNotification {
  id: number
  type: string
  icon: string
  is_read: boolean
  title: string
  contents: string[]
  date: string
}
