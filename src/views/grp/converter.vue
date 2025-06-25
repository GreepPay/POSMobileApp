<template>
  <app-wrapper>
    <subpage-layout :title="pageTitle" :hideBackBtn="hideBackBtn">
      <div
        class="w-full flex flex-col items-center justify-start px-4 h-full pt-1"
      >
        <!-- Confirmation details starts -->
        <template v-if="currentPageContent == 'conversion'">
          <amount-card is-wrapper class="rounded-[40px]">
            <div
              class="w-full flex flex-row !space-x-1 justify-between z-[2] items-center"
            >
              <app-normal-text class="text-left !text-white !text-sm">
                Balance
              </app-normal-text>

              <div class="flex flex-row space-x-1 items-center justify-end">
                <app-normal-text class="!text-white font-[500] !text-xl"
                  >1000</app-normal-text
                >
                <app-icon name="grp-logo-white" custom-class="!h-[28px]" />
              </div>
            </div>
          </amount-card>

          <div
            class="w-full border-[1.5px] border-[#E0E2E4] rounded-[32px] flex flex-col relative mt-5"
          >
            <div
              class="px-4 py-4 flex flex-row justify-between items-center border-b-[1.5px] border-[#E0E2E4]"
            >
              <app-icon name="grp-black" custom-class="!h-[35px]" />

              <div class="flex justify-end flex-row">
                <app-normal-text class="!text-black font-[500] !text-base"
                  >GRP
                </app-normal-text>

                <app-content-editable
                  defaultValue=""
                  placeholder="0"
                  class="!font-[500] !text-base text-black min-w-[10px] pl-1"
                  v-model="grp_amount"
                  type="tel"
                />
              </div>
            </div>

            <div
              class="absolute w-full h-[40px] flex flex-col px-5 left-0 bottom-[35%] justify-center"
            >
              <app-icon
                name="switch-currency"
                custom-class="!h-[32px] bg-white"
              />
            </div>

            <div class="px-4 py-4 flex flex-row justify-between items-center">
              <app-image-loader
                :photo-url="`/images/icons/flags/usd.svg`"
                class="h-[35px] w-[35px] rounded-full"
              />

              <app-normal-text class="!text-black font-[500] !text-base"
                >$
                {{
                  Logic.Common.convertToMoney(
                    parseFloat(grp_amount.toString()) / 100 || 0,
                    true,
                    ""
                  )
                }}</app-normal-text
              >
            </div>
          </div>
        </template>
        <!-- Confirmation details end -->

        <!-- Processing -->
        <template v-if="currentPageContent == 'processing'">
          <amount-card is-wrapper>
            <div
              class="w-full flex flex-col !space-y-1 justify-center items-center z-[2] py-3"
            >
              <app-normal-text class="text-center !text-white">
                Amount
              </app-normal-text>

              <app-header-text
                class="text-center !text-white !text-3xl !font-normal pt-1"
              >
                {{ "$" }}
                {{ Logic.Common.convertToMoney(100, false, "", false) }}
              </app-header-text>
            </div>
          </amount-card>

          <div
            class="w-full flex flex-col space-y-2 items-center justify-center pt-3"
          >
            <app-normal-text class="text-center">
              Your payment is on the way!
            </app-normal-text>

            <div
              class="px-2 py-2 rounded-full bg-primary flex flex-row items-center space-x-1 mb-2"
            >
              <app-icon name="white-check" custom-class="!h-[30px]" />

              <app-normal-text class="text-center !text-white !text-sm pr-2">
                Requested
              </app-normal-text>
            </div>

            <div class="h-[75px] w-[7px] rounded-[6px] bg-[#F0F3F6]"></div>

            <div
              class="px-2 py-2 rounded-full bg-transparent border-[1.5px] border-[#E0E2E4] flex flex-row items-center space-x-1 mb-2"
            >
              <app-icon name="pending-action" custom-class="!h-[30px]" />

              <app-normal-text
                class="text-center !text-veryLightGray !text-sm pr-2"
              >
                Sent
              </app-normal-text>
            </div>
          </div>
        </template>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 flex flex-col space-y-3"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div
          class="w-full flex flex-col"
          v-if="currentPageContent === 'processing'"
        >
          <app-button
            variant="secondary"
            :class="`!py-4 !bg-[#F0F3F6] !text-veryLightGray !border-transparent`"
            @click="continueToNext"
          >
            Please wait for 9:53
          </app-button>
        </div>

        <div
          class="w-full flex flex-col"
          v-if="currentPageContent === 'conversion'"
        >
          <app-button
            variant="secondary"
            :class="`!py-4 !bg-[#F0F3F6] !text-veryLightGray !border-transparent flex flex-row justify-between items-center`"
            @click="continueToNext"
          >
            <app-normal-text class="!text-left !text-veryLightGray">
              Rate
            </app-normal-text>

            <app-normal-text class="!text-right !text-gray-600 !font-[500]">
              $ 1 = 100 GRP
            </app-normal-text>
          </app-button>
        </div>

        <div class="w-full flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4`"
            @click="continueToNext"
          >
            {{ mainButtonLabel }}
          </app-button>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppButton,
  AppNormalText,
  AppImageLoader,
  AppHeaderText,
  AppIcon,
  AppContentEditable,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { ref } from "vue";
import AmountCard from "../../components/Common/AmountCard.vue";
import { getBottomPadding } from "../../composable";

export default defineComponent({
  name: "ConvertGRPTokenPage",
  components: {
    AppButton,
    AppNormalText,
    AppImageLoader,
    AppHeaderText,
    AppIcon,
    AmountCard,
    AppContentEditable,
  },
  setup() {
    const hideBackBtn = ref(false);

    const currentPageContent = ref("conversion");
    const mainButtonLabel = ref("Redeem");
    const pageTitle = ref("GRP Converter");

    const grp_amount = ref(0);

    const continueToNext = () => {
      if (currentPageContent.value === "conversion") {
        currentPageContent.value = "processing";
        pageTitle.value = "Processing";
        mainButtonLabel.value = "Profile";
        hideBackBtn.value = true;
      } else {
        currentPageContent.value = "conversion";
        mainButtonLabel.value = "Redeem";
        pageTitle.value = "GRP Converter";
        hideBackBtn.value = false;
      }
    };

    return {
      Logic,
      continueToNext,
      hideBackBtn,
      currentPageContent,
      mainButtonLabel,
      pageTitle,
      grp_amount,
      getBottomPadding,
    };
  },
});
</script>
