import { Logic } from "@greep/logic"
import { Notification } from "@greep/logic/src/gql/graphql"
import { MappedNotification } from "./types"

const mapNotificationsToUI = (
  notification: Notification
): MappedNotification => {
  let icon = "notify/info"
  const { delivery_status, id, type, title, content, created_at, is_read } =
    notification

  {
    if (delivery_status === "delivered" || delivery_status === "sent") {
      icon = "notify/success"
    } else if (delivery_status === "failed") {
      icon = "notify/error"
    }

    if (is_read) icon = `${icon}-read`
  }

  return {
    id,
    type,
    icon,
    is_read,
    title: title,
    contents: [content],
    date: Logic.Common.fomartDate(created_at, "DD MMMM YYYY") || "Today",
  }
}

const isIdInArray = (id: number, ids: number[]): boolean => {
  return ids.includes(id)
}

//
export { mapNotificationsToUI, isIdInArray }
