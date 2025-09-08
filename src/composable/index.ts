import { Currency } from "@greep/ui-components/src/types"
import { getPlatforms } from "@ionic/vue"
import { computed, reactive, ref } from "vue"


export const showUpdateAppModal = ref(false);

export const checkAppVersion = (currentVersion: string) => {
  const savedVersion = parseFloat(localStorage.getItem("app_version") || "1.0");
  const appVersion = parseFloat(currentVersion || "1.0");

  if (appVersion > savedVersion) {
    showUpdateAppModal.value = true;
  }

}

export const updateApp = async () => {
  window.location.href =
    window.location.pathname + "?reload=" + new Date().getTime();
}

export const availableCurrencies = reactive<Currency[]>([
  {
    code: "NGN",
    name: "Nigerian Naira",
    country_name: "Nigeria",
    symbol: "₦",
    country_code: "NG",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 55,
        value: 0.5,
        method: "bank_transfer",
      },
    ],
    payout_fees: [
      {
        type: "fixed",
        min: 100,
        value: 100,
        method: "bank_transfer",
      },
    ],
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    country_name: "Kenya",
    symbol: "KSh",
    country_code: "KE",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
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
    country_name: "Uganda",
    symbol: "USh",
    country_code: "UG",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 1,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 1,
        value: 1.5,
        method: "momo",
      },
    ],
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
    code: "GHS",
    name: "Ghanaian Cedi",
    country_name: "Ghana",
    symbol: "₵",
    country_code: "GH",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "ZAR",
    name: "South African Rand",
    country_name: "South Africa",
    symbol: "R",
    country_code: "ZA",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "bank_transfer",
      },
    ],
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
    country_name: "Rwanda",
    symbol: "RF",
    country_code: "RW",
    loading: false,
    use_country_code: true,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 1,
        method: "bank_transfer",
      },
    ],
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
    code: "XAF",
    name: "Cameroon CFA Franc",
    country_name: "Cameroon",
    symbol: "FCFA",
    country_code: "CM",
    loading: false,
    use_country_code: true,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 1.75,
        method: "momo",
      },
    ],
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
    code: "XAF",
    name: "Central African Republic CFA Franc",
    country_name: "Central African Republic",
    symbol: "FCFA",
    country_code: "CF",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XAF",
    name: "Chad CFA Franc",
    country_name: "Chad",
    symbol: "FCFA",
    country_code: "TD",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XAF",
    name: "Republic of the Congo CFA Franc",
    country_name: "Republic of the Congo",
    symbol: "FCFA",
    country_code: "CG",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XAF",
    name: "Equatorial Guinea CFA Franc",
    country_name: "Equatorial Guinea",
    symbol: "FCFA",
    country_code: "GQ",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XAF",
    name: "Gabon CFA Franc",
    country_name: "Gabon",
    symbol: "FCFA",
    country_code: "GA",
    loading: false,
    use_country_code: true,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Benin Franc",
    country_name: "Benin",
    symbol: "FCFA",
    country_code: "BJ",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Burkina Faso Franc",
    country_name: "Burkina Faso",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "BF",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Guinea Franc",
    country_name: "Republic of Guinea",
    symbol: "FCFA",
    use_country_code: true,
    country_code: "GN",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Côte d'Ivoire Franc",
    country_name: "Côte d'Ivoire",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "CI",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Mali Franc",
    country_name: "Mali",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "ML",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Mauritania Franc",
    country_name: "Mauritania",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "MR",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Niger Franc",
    country_name: "Niger",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "NE",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Senegal Franc",
    country_name: "Senegal",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "SN",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Togo Franc",
    country_name: "Togo",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "TG",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "TZS",
    name: "Tanzanian Shilling",
    use_country_code: true,
    symbol: "TSh",
    country_name: "Tanzania",
    country_code: "TZ",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 1,
        method: "bank_transfer",
      },
    ],
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
    code: "MWK",
    name: "Malawian Kwacha",
    country_name: 'Malawi',
    use_country_code: true,
    symbol: "MK",
    country_code: "MW",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 750,
        value: 1,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 750,
        value: 2,
        method: "momo",
      },
    ],
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
    code: "XLM",
    name: "Stellar Lumens",
    symbol: "XLM",
    country_code: "US",
    loading: false,
    is_crypto: true,
  },
  {
    code: "TRY",
    name: "Turkish Lira (₺)",
    symbol: "₺",
    loading: false,
    icon_extension: "svg",
    country_code: "TR",
    allow_p2p: true,
    is_foreign_currency: true,
  },
  {
    code: "USD",
    name: "United States Dollar ($)",
    symbol: "$",
    loading: false,
    icon_extension: "svg",
    country_code: "US",
    allow_p2p: false,
    is_foreign_currency: true,
  },
  {
    code: "EUR",
    name: "Euro (€)",
    symbol: "€",
    loading: false,
    icon_extension: "svg",
    country_code: "EU",
    allow_p2p: false,
    is_foreign_currency: true,
  },
  {
    code: "USDC",
    name: "USDC ($)",
    symbol: "$",
    loading: false,
    icon_extension: "svg",
    can_accept_deposit: true,
    country_code: "US",
    allow_p2p: false,
    is_crypto: true,
  },
  {
    code: "EURC",
    name: "EURC (€)",
    symbol: "€",
    loading: false,
    icon_extension: "png",
    country_code: "EU",
    allow_p2p: false,
    is_crypto: true,
  },
  {
    code: "USDT",
    name: "USDT ($)",
    symbol: "$",
    loading: false,
    icon_extension: "svg",
    can_accept_deposit: true,
    country_code: "US",
    allow_p2p: false,
    is_crypto: true,
  },
  {
    code: "BTC",
    name: "BTC",
    symbol: "₿",
    loading: false,
    icon_extension: "svg",
    country_code: "US",
    is_crypto: true,
  },
  {
    code: "ETH",
    name: "ETH",
    symbol: "Ξ",
    loading: false,
    icon_extension: "png",
    country_code: "US",
    is_crypto: true,
  },
]);


export const depositCryptoAndNetworkMap = {
  "USDC": [
    // {
    //   title: "Stellar",
    //   key: "stellar"
    // },
    {
      title: "Arbitrum",
      key: "arbitrum"
    },
    {
      title: "Avalanche C-Chain",
      key: "avalanche_c_chain"
    },
    {
      title: "Base",
      key: "base"
    },
    {
      title: "Ethereum",
      key: "ethereum"
    },
    {
      title: "Optimism",
      key: "optimism"
    },
    {
      title: "Polygon",
      key: "polygon"
    },
    {
      title: "Solana",
      key: "solana"
    }
  ],
  "USDT": [
    {
      title: "Tron",
      key: "tron"
    },
    {
      title: "Ethereum",
      key: "ethereum"
    },
  ]
}

export const safeAreaInsetTop = computed(() => {
  // Replace this with your actual platform detection logic
  const isAndroid = getPlatforms()[0] === "android"

  const topInset = Number(
    String(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--safe-area-inset-top"
      )
    ).replace("px", "")
  )

  return isAndroid && topInset === 0 ? 20 : topInset
})

export const safeAreaInsetBottom = computed(() => {
  // Replace this with your actual platform detection logic
  const isAndroid =
    getPlatforms()[0] === "android" || getPlatforms()[0] === "pwa"

  const bottomInset = Number(
    String(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--safe-area-inset-bottom"
      )
    ).replace("px", "")
  )

  return isAndroid && bottomInset === 0 ? 20 : bottomInset
})

export const getBottomPadding = computed(() => {
  // Replace this with your actual platform detection logic
  const isAndroid = getPlatforms()[0] === "android"

  return isAndroid
    ? "padding-bottom: calc(env(safe-area-inset-bottom) + 20px) !important;"
    : "padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;"
})

export interface MessageInfo {
  id: string
  text_content: string
  user_uuid: string
  type: "text" | "info"
  info_icon?: string
  user_name?: string
  media?: {
    type: "image"
    url: string
  }
  actions?: {
    label: string
    type: "success" | "info" | "danger" | "warning" | "primary"
    message: string
    value: string
    handler: () => void
  }[]
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
      },
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
])



// Helper to round to nearest significant digit (10, 100, 1000, etc.)
export function roundToNearestSignificant(num: number) {
  if (num === 0) return 0;
  const exponent = Math.floor(Math.log10(num));
  const base = Math.pow(10, exponent);
  return Math.round(num / base) * base;
}