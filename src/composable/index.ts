import { getPlatforms } from "@ionic/vue";
import { computed, reactive } from "vue";

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
