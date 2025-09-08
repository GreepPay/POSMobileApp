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


type SingleTransferResponse = {
  id: string;
  client_reference_id?: string;
  amount: string;
  currency: "usd" | "eur" | "mxn";
  on_behalf_of: string;
  developer_fee: string;
  source: {
    currency:
      | "dai"
      | "eur"
      | "eurc"
      | "mxn"
      | "pyusd"
      | "usd"
      | "usdb"
      | "usdc"
      | "usdt";
    payment_rail:
      | "ach"
      | "wire"
      | "ach_push"
      | "ach_same_day"
      | "arbitrum"
      | "avalanche_c_chain"
      | "base"
      | "bridge_wallet"
      | "ethereum"
      | "optimism"
      | "polygon"
      | "sepa"
      | "solana"
      | "spei"
      | "stellar"
      | "swift"
      | "tron";
    external_account_id?: string;
    omad?: string;
    imad?: string;
    bank_beneficiary_name?: string;
    bank_beneficiary_address?: string;
    bank_routing_number?: string;
    bank_name?: string;
    bridge_wallet_id?: string;
    description?: string;
    from_address?: string;
  };
  destination: {
    currency:
      | "dai"
      | "eur"
      | "eurc"
      | "mxn"
      | "pyusd"
      | "usd"
      | "usdb"
      | "usdc"
      | "usdt";
    payment_rail:
      | "ach"
      | "wire"
      | "ach_push"
      | "ach_same_day"
      | "arbitrum"
      | "avalanche_c_chain"
      | "base"
      | "ethereum"
      | "optimism"
      | "polygon"
      | "sepa"
      | "solana"
      | "spei"
      | "stellar"
      | "swift"
      | "tron";
    external_account_id?: string;
    bridge_wallet_id?: string;
    omad?: string;
    imad?: string;
    trace_number?: string;
    wire_message?: string;
    sepa_reference?: string;
    swift_reference?: string;
    swift_charges?: "our" | "sha";
    ach_reference?: string;
    uetr?: string;
    blockchain_memo?: string;
    to_address?: string;
  };
  state:
    | "awaiting_funds"
    | "in_review"
    | "funds_received"
    | "payment_submitted"
    | "payment_processed"
    | "canceled"
    | "error"
    | "undeliverable"
    | "returned"
    | "refunded";
  source_deposit_instructions?: {
    payment_rail:
      | "ach"
      | "wire"
      | "ach_push"
      | "ach_same_day"
      | "arbitrum"
      | "avalanche_c_chain"
      | "base"
      | "ethereum"
      | "optimism"
      | "polygon"
      | "solana"
      | "spei"
      | "stellar"
      | "sepa"
      | "swift"
      | "tron";
    amount: string;
    currency:
      | "usdb"
      | "usdc"
      | "usdt"
      | "dai"
      | "usd"
      | "pyusd"
      | "eur"
      | "eurc"
      | "mxn";
    from_address?: string;
    to_address?: string;
    deposit_message?: string;
    bank_name?: string;
    bank_address?: string;
    bank_routing_number?: string;
    bank_account_number?: string;
    bank_beneficiary_name?: string;
    bank_beneficiary_address?: string;
    iban?: string;
    bic?: string;
    account_holder_name?: string;
    blockchain_memo?: string;
  };
  receipt: {
    initial_amount: string;
    developer_fee: string;
    exchange_fee: string;
    subtotal_amount: string;
    remaining_prefunded_balance?: string;
    gas_fee?: string;
    final_amount?: string;
    source_tx_hash?: string;
    destination_tx_hash?: string;
    exchange_rate?: string;
    url?: string;
  };
  return_details?: {
    reason: string;
    refund_reference_id: string;
  };
  created_at: string;
  updated_at: string;
};

export { getTransaction, getPointTransaction, TransactionType, SingleTransferResponse };
