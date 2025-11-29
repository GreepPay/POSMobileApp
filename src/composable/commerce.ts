import { Logic } from "@greep/logic";
import { Order } from "@greep/logic/src/gql/graphql";
import { availableCurrencies } from ".";
import { capitalize } from "vue";

// Format currency

// Get item count from order
const getItemCount = (order: any) => {
  let itemLabel = "item";

  const firstProduct = order.sales?.[0]?.products?.[0];

  if (firstProduct?.type === "event") {
    itemLabel = "ticket";
  }

  try {
    let items: any[] = [];
    if (order.items && typeof order.items === "string") {
      items = JSON.parse(order.items);
    } else if (Array.isArray(order.items)) {
      items = order.items;
    }
    const count = items.length;
    return count === 1 ? `1 ${itemLabel}` : `${count} ${itemLabel}s`;
  } catch (e) {
    return "Unknown";
  }
};

// Get order type label
const getOrderTypeLabel = (order: any) => {
  return "Vendor Order";
};

// Get order status for UI
const getOrderStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "delivered":
      return "success";
    case "cancelled":
      return "failed";
    case "failed":
      return "failed";
    case "pending":
      return "pending";
    case "processing":
      return "pending";
    case "confirmed":
      return "success";
    case "accepted":
    default:
      return "pending";
  }
};

// Get order status label
const getOrderStatusLabel = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "Completed";
    case "delivered":
      return "Delivered";
    case "confirmed":
      return "Confirmed";
    case "accepted":
      return "Accepted";
    case "cancelled":
      return "Cancelled";
    case "failed":
      return "Failed";
    case "processing":
      return "Processing";
    case "pending":
    default:
      return "Pending";
  }
};

// Format order title - get product name from first sale's items
const formatOrderTitle = (order: any) => {
  try {
    // Try to get product name from sales array
    if (order.sales && Array.isArray(order.sales) && order.sales.length > 0) {
      const firstSale = order.sales[0];

      if (firstSale.items) {
        let saleItems: any[] = [];

        // Parse items if it's a string
        if (typeof firstSale.items === "string") {
          saleItems = JSON.parse(firstSale.items);
        } else if (Array.isArray(firstSale.items)) {
          saleItems = firstSale.items;
        }

        // Get first item's product name
        if (saleItems.length > 0) {
          const firstItem = saleItems[0];
          if (firstItem.name) {
            return firstItem.name;
          } else if (firstItem.product_name) {
            return firstItem.product_name;
          } else if (firstItem.productName) {
            return firstItem.productName;
          }
        }
      }
    }
  } catch (e) {
    console.error("Error in formatOrderTitle:", e);
  }

  // Fallback to order number
  if (order.orderNumber) {
    return `Order #${order.orderNumber}`;
  } else if (order.uuid) {
    return `Order #${order.uuid.slice(-8)}`;
  }
  return "Unknown Order";
};

// Get background color by status
const colorByStatusBg = (status: "success" | "failed" | "pending") => {
  if (status === "success") {
    return "#10BB76";
  } else if (status === "failed") {
    return "#FA1919";
  } else {
    return "#FFAA1F";
  }
};

const colorByStatus = (status: "success" | "failed" | "pending") => {
  if (status === "success") {
    return "#10BB76";
  } else if (status === "failed") {
    return "#FA1919";
  } else {
    return "#FF7B3B";
  }
};

export const getOrderDetails = (order: Order) => {
  let iconName = `commerce-order-${getOrderStatus(order.status)}`;
  let status = getOrderStatus(order.status);
  let statusColor = colorByStatus(getOrderStatus(order.status));

  let totalPrice = order.transaction?.amount || order.totalAmount;

  // Convert to current localcurrency
  if (Logic.Wallet.CurrentGlobalExchangeRate) {
    const rate = Logic.Wallet.CurrentGlobalExchangeRate?.mid;
    totalPrice = totalPrice * rate;
  }

  const currencyInfo = availableCurrencies?.find(
    (currencyBase) =>
      currencyBase.code.toUpperCase() ==
      Logic.Wallet.CurrentGlobalExchangeRate?.target?.toUpperCase()
  );

  const firstProduct = order.sales?.[0]?.products?.[0];

  if (firstProduct?.type == "event") {
    iconName = `ticket-in`;
    status = "Purchased";
    statusColor = colorByStatus("success");
  }

  if (firstProduct?.type == "digital" || firstProduct?.type == "physical") {
    if (status == "pending") {
      status = "Purchased";
      statusColor = colorByStatus("pending");
      iconName = `commerce-order-${getOrderStatus("pending")}`;
    } else {
      status = capitalize(order.status);
    }
  }

  return {
    uuid: order.uuid,
    title: formatOrderTitle(order),
    label: Logic.Common.fomartDate(order.createdAt, "MMM DD, hh:mm A"),
    status: status,
    icon: iconName,
    statusColor: statusColor,
    price: `${currencyInfo?.symbol || ""}${Logic.Common.convertToMoney(
      totalPrice,
      true,
      ""
    )}`,
    itemCount: getItemCount(order),
    data: order,
  };
};

export const goToOrder = (order: Order) => {
  if (order.uuid) {
    const firstProduct = order.sales?.[0]?.products?.[0];

    if (firstProduct?.type === "event") {
      // Always navigate to ticket order details
      Logic.Common.GoToRoute(`/events/${firstProduct.uuid}?tab=revenue`);
      return;
    }

    // Always navigate to P2P order details
    Logic.Common.GoToRoute(`/orders/${order.uuid}`);
  }
};
