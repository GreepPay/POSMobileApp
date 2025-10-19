<template>
  <app-wrapper>
    <subpage-layout title="Request Money">
      <div class="w-full flex flex-col items-center justify-start">
        <payment-with-suggestions
          ref="paymentWidgetComp"
          v-model:payment-data="paymentData"
          currencySwitchLabel="Select currency to accept payment"
        />
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div class="w-full flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4 ${
              paymentData?.amount ? 'opacity-100' : 'opacity-50'
            }`"
            @click="continueToNext"
            >Next</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppButton } from "@greep/ui-components";
import { ref } from "vue";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";
import { onMounted } from "vue";
import { availableCurrencies, getBottomPadding } from "../../composable";
import { computed } from "vue";
import { Currency } from "@greep/ui-components/src/types";
import PaymentWithSuggestions from "../../components/Core/PaymentWithSuggestions.vue";
import { onIonViewWillEnter } from "@ionic/vue";

export default defineComponent({
  name: "RequestPage",
  components: {
    AppButton,
    PaymentWithSuggestions,
  },
  setup() {
    const AuthUser = ref<User>(Logic.Auth.AuthUser);

    const paymentData = ref<{
      amount: number;
      currency: string;
      fee: number;
      totalAmount: number;
      narration: string;
      isValid: boolean;
      businessUUID: string | null;
      selectedCurrencyData: Currency;
      countryCode: string;
    }>();
    const paymentWidgetComp = ref<any>(null);

    onIonViewWillEnter(() => {
      paymentWidgetComp.value?.runOnIonViewEnter();
    });

    const continueToNext = () => {
      if ((paymentData.value?.amount || 0) > 0) {
        Logic.Common.GoToRoute(
          `/request/qr?amount=${paymentData.value?.amount}&currency=${
            paymentData?.value?.currency
          }&narration=${paymentData.value?.narration || ""}&country_code=${
            paymentData.value?.countryCode
          }`
        );
      }
    };

    const currentCurrency = computed(() => {
      return availableCurrencies.filter(
        (item) => item.code == AuthUser.value?.businesses[0]?.default_currency
      )[0]?.symbol;
    });

    onMounted(() => {
      Logic.Auth.watchProperty("AuthUser", AuthUser);
    });

    return {
      Logic,
      continueToNext,
      AuthUser,
      availableCurrencies,
      currentCurrency,
      getBottomPadding,
      paymentWidgetComp,
      paymentData,
    };
  },
});
</script>
