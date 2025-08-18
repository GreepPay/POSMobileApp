<template>
  <app-wrapper>
    <subpage-layout title="Make Payment" :hasExtraTopContent="true">
      <template #extra-top-content>
        <div class="flex justify-end flex-row items-center">
          <app-icon name="share" :customClass="'h-[22px]'" />
        </div>
      </template>

      <div
        class="w-full flex flex-col items-center justify-center px-4 h-full -mt-[35%]"
      >
        <app-image-loader
          class="w-full h-fit rounded-[32px] flex flex-col relative justify-center items-center space-y-5 px-4 py-5 xs:!py-4 bg-[linear-gradient(359.13deg,#10BB76_25.37%,#008651_99.25%)]"
          :photoUrl="''"
        >
          <!-- Image bg -->
          <img
            src="/images/greep-transparent-logo.svg"
            class="h-full absolute w-full top-0 left-0 rounded-[35px] z-[1]"
          />

          <div
            class="w-full flex flex-col !space-y-1 justify-center items-center z-[2] py-3 !pt-2"
          >
            <app-normal-text class="text-center !text-white">
              Amount
            </app-normal-text>

            <app-header-text
              class="text-center !text-white !text-3xl !font-normal pt-1 pb-3"
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

        <div class="w-full flex flex-col items-center justify-center !pt-7">
          <app-normal-text class="text-center font-semibold !text-base z-30">
            Scan QR code to pay
          </app-normal-text>
          <div class="!h-[20px]"></div>
          <div class="w-[90%] h-[300px] xs:h-[250px] mt-3">
            <div class="w-full h-full flex items-center justify-center">
              <app-qr-code v-if="qrCodeData" :data="qrCodeData" />
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 grid-cols-12 grid gap-3"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div class="col-span-4 flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4 !border-red !text-red !border-[1.5px] hover:!bg-red/20 `"
            @click="Logic.Common.GoToRoute('/')"
            outlined
            >Cancel</app-button
          >
        </div>

        <div class="col-span-8 flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4 `"
            @click="Logic.Common.goBack()"
            >New Request</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import {
    AppHeaderText,
    AppNormalText,
    AppQrCode,
    AppButton,
    AppImageLoader,
    AppIcon,
  } from "@greep/ui-components"
  import { ref } from "vue"
  import { Logic } from "@greep/logic"
  import { onMounted } from "vue"
  import { onIonViewWillEnter } from "@ionic/vue"
  import { computed } from "vue"
  import { User } from "@greep/logic/src/gql/graphql"
  import { availableCurrencies, getBottomPadding } from "../../composable"

  export default defineComponent({
    name: "RequestQRPage",
    components: {
      AppHeaderText,
      AppNormalText,
      AppQrCode,
      AppButton,
      AppImageLoader,
      AppIcon,
    },
    setup() {
      const amount = ref("0")

      const AuthUser = ref<User>(Logic.Auth.AuthUser)

      const setAmount = () => {
        //  Get amount from query params
        const queryParams = Logic.Common.route?.query
        if (queryParams) {
          amount.value = queryParams.amount as string
        }
      }

      const qrCodeData = computed(() => {
        return JSON.stringify({
          amount: amount.value,
          currency: AuthUser.value?.businesses[0]?.default_currency || "TRY",
          uuid: AuthUser.value?.uuid || "",
        })
      })

      const currentCurrency = computed(() => {
        return availableCurrencies.filter(
          (item) => item.code == AuthUser.value?.businesses[0]?.default_currency
        )[0]?.symbol
      })

      const continueToNext = () => {
        // Navigate to the next page
        // Logic.Common.navigate("/request/qr");
      }

      onIonViewWillEnter(() => {
        setAmount()
      })

      onMounted(() => {
        setAmount()
        Logic.Auth.watchProperty("AuthUser", AuthUser)
      })

      return {
        amount,
        Logic,
        qrCodeData,
        continueToNext,
        currentCurrency,
        getBottomPadding,
      }
    },
  })
</script>
