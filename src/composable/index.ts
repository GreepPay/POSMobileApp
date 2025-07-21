import { Currency } from "@greep/ui-components/src/types";
import { getPlatforms } from "@ionic/vue";
import { computed, reactive } from "vue";

export const availableCurrencies = reactive([
  {
    code: "TRY",
    name: "Turkish Lira",
    symbol: "₺",
    loading: false,
  },
  {
    code: "USD",
    name: "United States Dollar",
    symbol: "$",
    loading: false,
  },
  {
    code: "USDC",
    name: "USDC",
    symbol: "$",
    loading: false,
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    loading: false,
  },
  {
    code: "GHS",
    name: "Ghanaian Cedis",
    symbol: "₵",
    loading: false,
  },
  {
    code: "XLM",
    name: "XLM",
    symbol: "XLM",
    loading: false,
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    loading: false,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    loading: false,
  },
]);

export const safeAreaInsetTop = computed(() => {
  // Replace this with your actual platform detection logic
  const isAndroid = getPlatforms()[0] === "android";

  const topInset = Number(
    String(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--safe-area-inset-top"
      )
    ).replace("px", "")
  );

  return isAndroid && topInset === 0 ? 20 : topInset;
});

export const safeAreaInsetBottom = computed(() => {
  // Replace this with your actual platform detection logic
  const isAndroid = getPlatforms()[0] === "android" || getPlatforms()[0] === "pwa";

  const bottomInset = Number(
    String(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--safe-area-inset-bottom"
      )
    ).replace("px", "")
  );

  return isAndroid && bottomInset === 0 ? 20 : bottomInset;
});

export const getBottomPadding = computed(() => {
  // Replace this with your actual platform detection logic
  const isAndroid = getPlatforms()[0] === "android";

  return isAndroid
    ? "padding-bottom: calc(env(safe-area-inset-bottom) + 20px) !important;"
    : "padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;";
});

export interface MessageInfo {
  id: string;
  text_content: string;
  user_uuid: string;
  type: "text" | "info";
  info_icon?: string;
  user_name?: string;
  media?: {
    type: "image";
    url: string;
  };
  actions?: {
    label: string;
    type: "success" | "info" | "danger" | "warning" | "primary";
    message: string;
    value: string;
    handler: () => void;
  }[];
}

export const withdrawalAvailableCurrencies = reactive<Currency[]>([
  {
    code: "TRY",
    name: "Turkish Lira (₺)",
    symbol: "₺",
    loading: false,
    icon_extension: "svg",
    country_code: "TR",
    allow_p2p: true,
  },
  {
    code: "USD",
    name: "United States Dollar ($)",
    symbol: "$",
    loading: false,
    icon_extension: "svg",
    country_code: "US",
    allow_p2p: true,
  },
  {
    code: "EUR",
    name: "Euro (€)",
    symbol: "€",
    loading: false,
    icon_extension: "svg",
    country_code: "EU",
    allow_p2p: true,
  },
  {
    code: "USDC",
    name: "USDC ($)",
    symbol: "$",
    loading: false,
    icon_extension: "svg",
    country_code: "US",
    allow_p2p: false,
  },
  {
    code: "EURC",
    name: "EURC (€)",
    symbol: "€",
    loading: false,
    icon_extension: "png",
    country_code: "EU",
    allow_p2p: false,
  },
  {
    code: "USDT",
    name: "USDT ($)",
    symbol: "$",
    loading: false,
    icon_extension: "svg",
    country_code: "US",
    allow_p2p: false,
  },
  // {
  //   code: "BTC",
  //   name: "BTC",
  //   symbol: "₿",
  //   loading: false,
  //   icon_extension: "svg",
  //   country_code: "US"
  // },
  // {
  //   code: "ETH",
  //   name: "ETH",
  //   symbol: "Ξ",
  //   loading: false,
  //   icon_extension: "png",
  //   country_code: "US"
  // },
  {
    code: "NGN",
    name: "Nigerian Naira (₦)",
    symbol: "₦",
    loading: false,
    icon_extension: "svg",
    country_code: "NG",
    allow_p2p: false,
    payout_fees: [
      {
        type: "fixed",
        min: 100,
        value: 100,
        method: "bank_transfer",
      },
    ],
  },
  // {
  //   code: "GHS",
  //   name: "Ghanaian Cedis (₵)",
  //   symbol: "₵",
  //   loading: false,
  //   icon_extension: "svg",
  //   country_code: "GH",
  //   allow_p2p: false,
  // },
  {
    code: "KES",
    name: "Kenyan Shilling (KES)",
    symbol: "KES",
    loading: false,
    icon_extension: "png",
    country_code: "KE",
    allow_p2p: false,
    payout_fees: [
      {
        type: "fixed",
        min: 200,
        value: 0.5,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "UGX",
    name: "Ugandan Shilling",
    symbol: "USh",
    country_code: "UG",
    loading: false,
    allow_p2p: false,
    payout_fees: [
      {
        type: "percentage",
        min: 5000,
        value: 0.5,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 1,
        value: 1.5,
        method: "momo",
      },
    ],
  },
  {
    code: "ZAR",
    name: "South African Rand (R)",
    symbol: "R",
    loading: false,
    icon_extension: "svg",
    country_code: "ZA",
    allow_p2p: false,
    payout_fees: [
      {
        type: "percentage",
        min: 20,
        value: 0.5,
        method: "bank_transfer",
      },
    ],
  },
  {
    code: "RWF",
    name: "Rwandan Franc",
    symbol: "RF",
    country_code: "RW",
    loading: false,
    icon_extension: "png",
    allow_p2p: false,
    payout_fees: [
      {
        type: "percentage",
        min: 1000,
        value: 0.5,
        method: "bank_transfer",
      },
    ],
  },
  {
    code: "ZMW",
    name: "Zambian Kwacha",
    symbol: "ZK",
    country_code: "ZM",
    loading: false,
    allow_p2p: false,
    payout_fees: [
      {
        type: "percentage",
        min: 100,
        value: 0.5,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 1,
        value: 1.5,
        method: "momo",
      },
    ],
  },
  {
    code: "BWP",
    name: "Botswana Pula",
    symbol: "P",
    country_code: "BW",
    loading: false,
    icon_extension: "png",
    allow_p2p: false,
    payout_fees: [
      {
        type: "percentage",
        min: 10,
        value: 0.5,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 1,
        value: 2.2,
        method: "momo",
      }
    ],
  },
  {
    code: "XAF",
    name: "Cameroon CFA Franc",
    symbol: "FCFA",
    country_code: "CM",
    loading: false,
    icon_extension: "png",
    allow_p2p: false,
    payout_fees: [
      {
        type: "percentage",
        min: 1,
        value: 1.5,
        method: "momo",
      },
    ],
  },
  {
    code: "MWK",
    name: "Malawian Kwacha",
    symbol: "MK",
    country_code: "MW",
    loading: false,
    icon_extension: "png",
    allow_p2p: false,
    payout_fees: [
      {
        type: "percentage",
        min: 750,
        value: 0.5,
        method: "bank_transfer",
      },
       {
        type: "percentage",
        min: 1,
        value: 1,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Togo CFA Franc",
    symbol: "CFA",
    country_code: "TG",
    loading: false,
    icon_extension: "png",
    use_country_code: true,
    allow_p2p: false,
    payout_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2.25,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Côte d'Ivoire CFA Franc",
    symbol: "CFA",
    country_code: "CI",
    loading: false,
    icon_extension: "png",
    use_country_code: true,
    allow_p2p: false,
    payout_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2.25,
        method: "momo",
      },
    ],
  },
]);
