import { Logic } from "@greep/logic";
import { PointTransaction, Transaction } from "@greep/logic/src/gql/graphql";

enum TransactionType {
  Sent = "sent",
  Received = "received",
  Added = "added",
  Redeemed = "redeemed",
}

const getTransaction = (
  data: Transaction,
  selectedCurrency: string,
  currencySymbol: string
) => {
  let typeName: TransactionType = TransactionType.Added;

  if (data.dr_or_cr == "credit" && data.description == "Wallet Topup") {
    typeName = TransactionType.Added;
  } else if (data.dr_or_cr == "debit") {
    typeName = TransactionType.Sent;
  }

  return {
    id: data.uuid,
    amount:
      data.amount *
      (selectedCurrency == "USDC"
        ? 1
        : Logic.Wallet.CurrentGlobalExchangeRate?.mid || 1),
    title: data.description,
    transactionType: data.dr_or_cr as "credit" | "debit",
    date: Logic.Common.momentInstance(data.updated_at).format("YYYY-MM-DD"),
    type: typeName,
    currencySymbol: currencySymbol || "",
    subAmount: `USDC ${Logic.Common.convertToMoney(data.amount, true, "")}`,
    transaction_group: "normal",
    real_date: data.updated_at
  };
};

const getPointTransaction = (
  data: PointTransaction,
  currencySymbol: string
) => {
  let typeName: TransactionType = TransactionType.Added;

  if (data.dr_or_cr == "credit") {
    typeName = TransactionType.Redeemed;
  } else if (data.dr_or_cr == "debit") {
    typeName = TransactionType.Redeemed;
  }

  return {
    id: data.uuid,
    amount: data.amount,
    title: data.description,
    transactionType: data.dr_or_cr as "credit" | "debit",
    date: Logic.Common.momentInstance(data.updated_at).format("YYYY-MM-DD"),
    type: typeName,
    currencySymbol: currencySymbol || "",
    subAmount: `GRP Coin`,
    transaction_group: "point",
    real_date: data.updated_at
  };
};

export { getTransaction, getPointTransaction, TransactionType };
