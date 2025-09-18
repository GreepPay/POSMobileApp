import { Logic } from "@greep/logic"
import { Notification } from "@greep/logic/src/gql/graphql"
import { MappedNotification } from "./types"

const mapNotificationsToUI = (
  notification: Notification
): MappedNotification => {
  let icon = "notify-info"

  if (
    notification.delivery_status === "delivered" ||
    notification.delivery_status === "sent"
  ) {
    icon = "notify-success"
  } else if (notification.delivery_status === "failed") {
    icon = "notify-error"
  }

  return {
    icon,
    title: notification.title,
    contents: [notification.content],
    date:
      Logic.Common.fomartDate(notification.created_at, "DD MMMM YYYY") ||
      "Today",
  }
}

//
export { mapNotificationsToUI }
