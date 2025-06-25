<template>
  <app-wrapper>
    <subpage-layout title="Collect Payment">
      <div
        class="w-full flex flex-col items-center justify-center px-4 pt-3 h-full -mt-[40%]"
      >
        <app-image-loader
          class="w-full rounded-[35px] flex flex-col relative justify-center items-center space-y-5 px-4 py-5 xs:!py-4 bg-[linear-gradient(359.13deg,#10BB76_25.37%,#008651_99.25%)]"
          :photoUrl="''"
        >
          <!-- Image bg -->
          <img
            src="/images/greep-transparent-logo.svg"
            class="h-full absolute w-full top-0 left-0 rounded-[35px] z-[1]"
          />

          <div
            class="w-full flex flex-col !space-y-1 justify-center items-center z-[2] py-4 pt-6"
          >
            <app-normal-text class="text-center !text-white">
              Enter Amount
            </app-normal-text>

            <app-header-text
              class="text-center !text-white !text-3xl !font-normal pt-1 pb-7"
            >
              {{ currentCurrency }}
              {{
                !Number.isNaN(parseFloat(amount))
                  ? Logic.Common.convertToMoney(amount, false, "", false)
                  : "0"
              }}
            </app-header-text>
          </div>
        </app-image-loader>

        <div class="w-full flex flex-col justify-center items-center pt-7">
          <app-keyboard v-model="amount" />
        </div>
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
            :class="`!py-4 `"
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
import {
  AppHeaderText,
  AppButton,
  AppKeyboard,
  AppNormalText,
  AppImageLoader,
} from "@greep/ui-components";
import { ref } from "vue";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";
import { onMounted } from "vue";
import { availableCurrencies, getBottomPadding } from "../../composable";
import { computed } from "vue";

export default defineComponent({
  name: "RequestPage",
  components: {
    AppHeaderText,
    AppButton,
    AppKeyboard,
    AppNormalText,
    AppImageLoader,
  },
  setup() {
    const amount = ref("0");

    const AuthUser = ref<User>(Logic.Auth.AuthUser);

    const continueToNext = () => {
      if (parseFloat(amount.value) > 0) {
        Logic.Common.GoToRoute(`/request/qr?amount=${amount.value}`);
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
      amount,
      Logic,
      continueToNext,
      AuthUser,
      availableCurrencies,
      currentCurrency,
      getBottomPadding,
    };
  },
});
</script>
