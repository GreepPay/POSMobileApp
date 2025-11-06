<template>
  <app-wrapper>
    <subpage-layout title="Send Money">
      <div class="w-full flex flex-col items-center" >
        <payment-with-suggestions
          ref="paymentWidgetComp"
           v-model:payment-data="paymentData"
        />

        <!-- Bottom button -->
        <div
          class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
          style="
            padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
          "
        >
          <div class="w-full flex flex-col">
            <app-button
              @click="continueToNext"
              :custom-class="`!py-4 ${
                paymentData?.isValid ? 'opacity-100' : 'opacity-50'
              }`"
              variant="secondary"
            >
              Next
            </app-button>
          </div>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  AppButton,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { onMounted } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import { Currency } from "@greep/ui-components/src/types";
import PaymentWithSuggestions from "../../components/Core/PaymentWithSuggestions.vue";

export default defineComponent({
  name: "SendMoneyPayPage",
  components: {
    AppButton,
    PaymentWithSuggestions
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "CurrentGlobalExchangeRate",
        method: "GetGlobalExchangeRate",
        params: [],
        requireAuth: true,
        ignoreProperty: false,
      },
    ],
  },
  setup() {
    const AuthUser = ref(Logic.Auth.AuthUser);
    const paymentData = ref<{
      amount: number;
      currency: string;
      fee: number;
      totalAmount: number;
      narration: string;
      isValid: boolean;
      businessUUID: string | null;
      selectedCurrencyData: Currency;
    }>();

    const paymentWidgetComp = ref<any>(null);

    const continueToNext = () => {
      localStorage.setItem(
        "CurrentPaymentData",
        JSON.stringify(paymentData.value)
      );

      if (!paymentData.value?.isValid) {
        return;
      }

      Logic.Common.GoToRoute(
        `/send/method?currency=${
          paymentData.value?.selectedCurrencyData?.code
        }&amount=${paymentData.value?.amount || 0}&business=${
          paymentData.value?.businessUUID || ""
        }&country=${
          paymentData.value.selectedCurrencyData?.country_code || ""
        }&narration=${paymentData.value?.narration || ""}`
      );
    };

    onIonViewWillEnter(() => {
      paymentWidgetComp.value?.runOnIonViewEnter();
    });

    onMounted(() => {
      Logic.Auth.watchProperty("AuthUser", AuthUser);
    });

    return {
      Logic,
      continueToNext,
      paymentData,
      paymentWidgetComp,
    };
  },
});
</script>
