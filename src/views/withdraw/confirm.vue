<template>
  <app-wrapper>
    <subpage-layout :title="pageTitle" :hideBackBtn="hideBackBtn">
      <div
        class="w-full flex flex-col items-center justify-start px-4 h-full pt-1 space-y-3"
      >
        <!-- Confirmation details starts -->
        <template v-if="currentPageContent == 'confirmation_info'">
          <app-image-loader
            class="w-full h-fit rounded-[16px] flex flex-col relative justify-start items-start space-y-5 px-4 py-5 xs:!py-4 bg-[linear-gradient(359.13deg,#10BB76_25.37%,#008651_99.25%)]"
            :photoUrl="''"
          >
            <!-- Image bg -->
            <img
              src="/images/greep-transparent-logo.svg"
              class="h-full absolute w-full top-0 left-0 rounded-[35px] z-[1]"
            />

            <div
              class="w-full flex flex-col !space-y-1 justify-center items-start z-[2]"
            >
              <app-normal-text class="text-center !text-white">
                Amount To Withdraw
              </app-normal-text>

              <app-header-text
                class="text-center !text-white !text-xl !font-normal pt-1"
              >
                {{ "$" }}
                {{ Logic.Common.convertToMoney(100, false, "", false) }}
              </app-header-text>
            </div>
          </app-image-loader>

          <app-details :details="confirmationDetails" />
        </template>
        <!-- Confirmation details end -->

        <!-- Processing -->
        <template v-if="currentPageContent == 'processing'">
          <app-image-loader
            class="w-full h-fit rounded-[32px] flex flex-col relative justify-start items-start space-y-5 px-4 py-6 xs:!py-4 bg-[linear-gradient(359.13deg,#10BB76_25.37%,#008651_99.25%)]"
            :photoUrl="''"
          >
            <!-- Image bg -->
            <img
              src="/images/greep-transparent-logo.svg"
              class="h-full absolute w-full top-0 left-0 rounded-[35px] z-[1]"
            />

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
          </app-image-loader>

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
        style="
          padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
        "
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
  AppDetails,
  AppImageLoader,
  AppHeaderText,
  AppIcon,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";

export default defineComponent({
  name: "ConfirmWithdrawPage",
  components: {
    AppButton,
    AppNormalText,
    AppDetails,
    AppImageLoader,
    AppHeaderText,
    AppIcon,
  },
  setup() {
    const hideBackBtn = ref(false);

    const currentPageContent = ref("confirmation_info");
    const mainButtonLabel = ref("Confirm");
    const pageTitle = ref("Confirm Details");

    const confirmationDetails = reactive([
      {
        title: "Bank Name",
        content: "Capital One",
      },
      {
        title: "Account Holder Name",
        content: "Timmy Salami",
      },
      {
        title: "Account Number",
        content: "4833241496",
      },
      {
        title: "Amount",
        content: "$ 100.00",
      },
      {
        title: "Fee",
        content: "$ 5.00",
      },
    ]);

    const continueToNext = () => {
      if (currentPageContent.value === "confirmation_info") {
        currentPageContent.value = "processing";
        pageTitle.value = "Processing";
        mainButtonLabel.value = "Home";
        hideBackBtn.value = true;
      } else {
        currentPageContent.value = "confirmation_info";
        mainButtonLabel.value = "Confirm";
        pageTitle.value = "Confirm Details";
        hideBackBtn.value = false;
      }
    };

    return {
      Logic,
      continueToNext,
      confirmationDetails,
      hideBackBtn,
      currentPageContent,
      mainButtonLabel,
      pageTitle,
    };
  },
});
</script>
