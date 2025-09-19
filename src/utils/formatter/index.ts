import { QueryGetNotificationsWhereColumn } from "@greep/logic/src/gql/graphql"
import { notificationsTabs } from "../../db"

export const buildNotificationWhereQuery = (tabKey?: string): any => {
  if (!tabKey || tabKey === "all") {
    return {
      OR: notificationsTabs.map((tab) => ({
        column: QueryGetNotificationsWhereColumn.Category,
        operator: "EQ",
        value: tab.key,
      })),
    }
  }

  return {
    AND: [
      {
        column: QueryGetNotificationsWhereColumn.Category,
        operator: "EQ",
        value: tabKey,
      },
    ],
  }
}
