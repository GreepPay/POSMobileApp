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
  const isAndroid = getPlatforms()[0] === "android";

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
    type: "success" | "info" | "danger" | "warning";
    message: string;
  }[];
}

export const withdrawalAvailableCurrencies = reactive([
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
  },
  {
    code: "GHS",
    name: "Ghanaian Cedis (₵)",
    symbol: "₵",
    loading: false,
    icon_extension: "svg",
    country_code: "GH",
    allow_p2p: false,
  },
  {
    code: "KES",
    name: "Kenyan Shilling (KES)",
    symbol: "KES",
    loading: false,
    icon_extension: "png",
    country_code: "KE",
    allow_p2p: false,
  },
  {
    code: "ZAR",
    name: "South African Rand (R)",
    symbol: "R",
    loading: false,
    icon_extension: "svg",
    country_code: "ZA",
    allow_p2p: false,
  },
]);
