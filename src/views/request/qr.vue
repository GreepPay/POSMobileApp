<template>
  <app-wrapper>
    <subpage-layout title="Pay with GreepPay">
      <div class="w-full flex flex-col px-4 pb-3" id="qrPaymentContent">
        <div class="w-full flex flex-col items-center pt-2 justify-center">
          <div class="!w-[70%] h-[220px] xs:h-[220px]">
            <div class="w-full h-full flex items-center justify-center py-3">
              <app-qr-code v-if="qrCodeData" :data="qrCodeData" />
            </div>
          </div>
        </div>
        <app-image-loader
          class="w-full h-fit !mt-3 rounded-[12px] flex flex-col relative justify-center items-center px-4 py-3 xs:!py-4 bg-[linear-gradient(359.13deg,#0D965E_25.37%,#00683F_99.25%)]"
          :photoUrl="''"
        >
          <!-- Image bg -->
          <img
            src="/images/greep-transparent-logo.svg"
            class="h-full absolute w-full top-0 left-0 rounded-[35px] z-[1]"
          />

          <div
            class="w-full flex flex-col !space-y-1 justify-center items-center z-[2] py-2"
          >
            <app-normal-text class="text-center !text-white">
              Amount
            </app-normal-text>

            <app-header-text
              class="text-center !text-white !text-3xl !font-[50] pt-1"
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

        <div class="w-full flex flex-col pt-3">
          <div
            class="w-full px-4 !py-4 border-[1.5px] border-[#F0F3F6] rounded-[12px] items-center justify-between !flex !flex-row"
          >
            <app-normal-text class="!text-[#616161]"> Note </app-normal-text>

            <app-normal-text class="!text-[#050709] !font-semibold">
              {{ narration }}
            </app-normal-text>
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
        <div class="col-span-12 flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4 !border-[#E0E2E4]`"
            outlined
            @click="downloadReceipt('image', 'qrPaymentContent')"
          >
            <div class="flex flex-row justify-center items-center">
              <app-icon name="send-green" class="h-[20px]" />
              <span class="!text-[#17A068] pl-2 !text-sm">Share</span>
            </div>
          </app-button>
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
  import { downloadReceipt } from "../../composable/common"

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
      const narration = ref("")

      const setAmount = () => {
        //  Get amount from query params
        const queryParams = Logic.Common.route?.query
        if (queryParams) {
          amount.value = queryParams.amount as string
          narration.value =
            (queryParams.narration as string) || "Payment Request"
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
        narration,
        downloadReceipt,
      }
    },
  })
</script>
