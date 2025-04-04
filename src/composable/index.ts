import { reactive } from "vue";

export const availableCurrencies = reactive([
  {
    code: "TRY",
    name: "Turkish Lira",
    symbol: "₺",
  },
  {
    code: "USD",
    name: "United States Dollar",
    symbol: "$",
  },
  {
    code: "USDC",
    name: "USDC",
    symbol: "$",
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
  },
  {
    code: "GHS",
    name: "Ghanaian Cedis",
    symbol: "₵",
  },
  {
    code: "XLM",
    name: "XLM",
    symbol: "XLM",
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
  },
]);
