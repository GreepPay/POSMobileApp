<template>
  <app-wrapper>
    <div
      :class="`w-full flex flex-col lg:text-sm mdlg:text-[12px] text-xs h-screen overflow-y-hidden !font-inter bg-white`"
      style="
        padding-top: calc(env(safe-area-inset-top) + 16px) !important;
        padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
      "
    >
      <div class="w-full flex h-full flex-col justify-between">
        <div class="w-full flex flex-col items-center justify-center px-4">
          <app-image-loader
            photo-url="/images/onboard-image.png"
            class="h-[300px] w-full relative rounded-[16px] !object-bottom"
          >
            <div
              class="flex flex-col justify-end absolute top-0 left-0 w-full h-full px-4 py-4 rounded-[16px]"
              style="
                background: linear-gradient(
                  180deg,
                  rgba(0, 0, 0, 0) 50%,
                  rgba(0, 0, 0, 0.75) 100%
                );
              "
            >
              <div
                class="w-full flex flex-row flex-nowrap scrollbar-hide overflow-x-hidden bg-white rounded-[16px] px-4 py-4"
              >
                <div
                  v-for="(currency, index) in localCountryWithLogo"
                  class="flex flex-row items-center pr-3"
                >
                  <app-image-loader
                    :photo-url="`/images/icons/flags/${currency.country_code?.toLocaleLowerCase()}.svg`"
                    class="size-8 rounded-full border-[1px] border-gray-200 object-cover"
                  />
                </div>
              </div>
            </div>
          </app-image-loader>

          <div class="w-full flex flex-col items-center justify-center mt-6">
            <app-header-text class="text-center !font-extrabold !text-3xl">
              CATER FOR
              <span class="text-[#00683f]">CROSS BORDER </span>
              CUSTOMERS
            </app-header-text>

            <div class="w-full flex flex-col items-center justify-center mt-2">
              <ul class="prose prose-sm !text-sm !text-[#616161] pl-3">
                <li class="!text-center">
                  <app-normal-text class="!text-[#616161] !item-center">
                    Africans can now pay you directly.
                  </app-normal-text>
                </li>
                <li class="!text-center">
                  <app-normal-text class="!text-[#616161] !item-center">
                    List and sell items and services.
                  </app-normal-text>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div
          class="w-full flex flex-col items-center justify-center px-4 space-y-4"
        >
          <app-button
            class="w-full py-4"
            style="
              background: linear-gradient(
                269.64deg,
                #0d965e 0.31%,
                #00683f 89.75%
              ) !important;
            "
            @click="Logic.Common.GoToRoute('/auth/signup')"
            variant="primary"
          >
            Get Started
          </app-button>

          <app-button
            class="w-full py-4"
            @click="Logic.Common.GoToRoute('/auth/login')"
            variant="primary"
            outlined
          >
            Sign In
          </app-button>
        </div>
      </div>
    </div>
  </app-wrapper>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  onUnmounted,
  computed,
  watch,
} from "vue";
import {
  AppNormalText,
  AppHeaderText,
  AppButton,
  AppImageLoader,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { SwiperSlide } from "swiper/vue";
import {
  availableCurrencies,
  safeAreaInsetBottom,
  safeAreaInsetTop,
} from "../../composable";
import { getPlatforms, isPlatform } from "@ionic/vue";

export default defineComponent({
  components: {
    AppImageLoader,
    SwiperSlide,
    AppButton,
    AppHeaderText,
    AppNormalText,
  },
  name: "StartWelcomePage",
  layout: "Onboarding",
  middlewares: {},
  setup() {
    // constants
    const slides = [
      {
        title: `Use Multiple Core Services`,
        description: `Shop from markets and restaurants with instant delivery, Send items anywhere, and Discover events with easy ticket access—all in one app.`,
        image: `/images/onboarding/slide-1.png`,
        btnText: "Next",
      },
      {
        title: `Rank Up And Earn Rewards`,
        description: `Climb up the weekly and monthly leaderboards with your activity on the app and earn GRP Tokens that you can trade for payment discount coupons.`,
        image: `/images/onboarding/slide-2.png`,
        btnText: "Next",
      },
      {
        title: `Easy Payment With Wallet`,
        description: `Fund your wallet to make payments on the go, or better still – integrate your GreepPay account to make payments in your home currency.`,
        image: `/images/onboarding/slide-3.png`,
        btnText: "Get Started",
      },
    ];

    //
    const slidePosition = ref(0);
    const currentSlidePosition = ref(0);
    const totalSlides = ref(3);
    const innerHeight = ref(window.innerHeight);

    //
    const mobileFullHeight = computed(() => {
      return { height: `${innerHeight.value}px` };
    });
    const paddings = computed(() => {
      const platformIsIOS = isPlatform("ios") || getPlatforms().includes("ios");

      if (platformIsIOS) {
        return {
          paddingTop: `padding-top: calc(env(safe-area-inset-top) + 16px) !important;`,
          paddingBottom: `padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;`,
        };
      }
      return {
        paddingTop: `padding-top: calc(${safeAreaInsetTop.value}px + 16px);`,
        paddingBottom: `padding-bottom: calc(${safeAreaInsetBottom.value}px + 16px);`,
      };
    });

    //
    const updateHeight = () => (innerHeight.value = window.innerHeight);
    const handleNext = () => {
      const isLastSlide = currentSlidePosition.value === slides.length - 1;
      if (!isLastSlide) currentSlidePosition.value += 1;
      else Logic.Common.GoToRoute("/auth/signup");
    };

    const localCountryWithLogo = computed(() => {
      return availableCurrencies.filter(
        (item) => !item.is_foreign_currency && !item.is_crypto
      );
    });

    //
    watch(slidePosition, () => {
      currentSlidePosition.value = slidePosition.value;
    });
    onMounted(() => {
      updateHeight();
      window.addEventListener("resize", updateHeight);
      localStorage.clear();
    });
    onUnmounted(() => {
      window.removeEventListener("resize", updateHeight);
    });

    return {
      Logic,
      slides,
      slidePosition,
      currentSlidePosition,
      totalSlides,
      safeAreaInsetTop,
      safeAreaInsetBottom,
      mobileFullHeight,
      paddings,
      handleNext,
      localCountryWithLogo,
    };
  },
});
</script>
