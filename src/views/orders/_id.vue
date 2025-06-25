<template>
  <app-wrapper>
    <subpage-layout title="Order Details" :hasBottomButton="true">
      <div class="w-full flex flex-col justify-start pt-1">
        <!-- Order ID -->
        <div class="w-full flex flex-col px-4">
          <app-image-loader
            class="w-full h-fit rounded-[12px] flex flex-col overflow-x-hidden overflow-y-hidden justify-center items-center px-4 py-5 !bg-[linear-gradient(to_bottom,#10BB76,#00683F)] relative"
            photo-url=""
          >
            <img
              class="absolute top-0 left-0 w-full"
              src="/images/greep-transparent-logo.svg"
            />

            <div class="w-full flex flex-row items-center justify-between z-10">
              <app-normal-text class="!text-white">
                Order Number
              </app-normal-text>

              <app-normal-text class="!text-white !font-semibold !text-sm">
                {{ orderData.uniqueReference }}
              </app-normal-text>
            </div>
          </app-image-loader>
        </div>

        <!-- P2P Chat -->
        <div
          class="w-full flex flex-row items-center mt-4 py-4 px-4 !border-t-[12px] !border-b-[12px] border-[#F0F3F6]"
          @click="Logic.Common.GoToRoute('/chat/1')"
        >
          <div class="w-[48px] mr-3">
            <div class="w-[48px]">
              <app-image-loader
                :photoUrl="orderData.p2p_chat.logo"
                class="h-[48px] w-[48px] rounded-full"
              />
            </div>
          </div>
          <div class="w-full flex flex-col">
            <div class="w-full flex flex-row justify-between item-center">
              <app-normal-text
                class="!text-left !text-black !font-[500] !text-sm mb-[1px]"
              >
                {{ orderData.p2p_chat.title }}
              </app-normal-text>

              <app-normal-text class="!text-right !text-[#999999] mb-[1px]">
                {{ orderData.p2p_chat.time }}
              </app-normal-text>
            </div>

            <div class="w-full flex flex-row items-center justify-between">
              <app-normal-text class="!text-left !text-[#999999]">
                {{ orderData.p2p_chat.last_message }}
              </app-normal-text>

              <div
                class="h-[24px] w-[24px] rounded-full flex items-center justify-center"
                :style="`background-color: ${colorByStatus(
                  'success'
                )} !important;`"
              >
                <app-normal-text class="!text-[#ffffff] !font-[500]">
                  {{ orderData.p2p_chat.unread }}
                </app-normal-text>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer -->
        <div class="w-full flex flex-row items-center py-4 px-4">
          <div
            class="w-full flex flex-row items-center px-4 py-4 border-[1.5px] border-[#F0F3F6] rounded-[12px]"
          >
            <div class="w-[48px] mr-3">
              <div class="w-[48px]">
                <app-image-loader
                  :photoUrl="orderData.customer.profile_image"
                  class="h-[48px] w-[48px] rounded-full"
                />
              </div>
            </div>
            <div class="w-full flex flex-col">
              <div class="w-full flex flex-row justify-between item-center">
                <app-normal-text
                  class="!text-left !text-black !font-[500] !text-sm mb-[1px]"
                >
                  {{ orderData.customer.name }}
                </app-normal-text>
              </div>

              <div class="w-full flex flex-row items-center justify-between">
                <app-normal-text class="!text-left !text-[#999999]">
                  {{ orderData.customer.type }}
                </app-normal-text>
              </div>
            </div>
          </div>
        </div>

        <!-- Details -->
        <template v-for="(details, index) in orderData.data" :key="index">
          <div class="w-full flex flex-col px-4 mb-4">
            <app-details :details="details" :isVertical="false" />
          </div>
        </template>

        <div class="pb-[200px]"></div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 flex flex-col"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div
          class="w-full flex flex-col pb-4"
          v-if="currentPageContent === 'waiting'"
        >
          <app-countdown-timer
            :customText="`You must accept in`"
            custom-class="!py-5"
            :duration="600"
          />
        </div>
        <div class="w-full grid grid-cols-12 gap-4">
          <div class="col-span-6 flex flex-col">
            <app-button
              variant="primary-white"
              :class="`!py-4 !border-red !text-red !border-[1.5px]`"
              outlined
            >
              Decline
            </app-button>
          </div>
          <div class="col-span-6 flex flex-col">
            <app-button variant="secondary" :class="`!py-4`">
              {{ mainButtonLabel }}
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
  AppNormalText,
  AppImageLoader,
  AppButton,
  AppDetails,
  AppCountdownTimer,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { getBottomPadding } from "../../composable";

export default defineComponent({
  name: "OrderDetailsPage",
  components: {
    AppNormalText,
    AppImageLoader,
    AppButton,
    AppDetails,
    AppCountdownTimer,
  },
  setup() {
    const colorByStatus = (status: "success" | "failed" | "pending") => {
      if (status === "success") {
        return "#10BB76";
      } else if (status === "failed") {
        return "#FA1919";
      } else {
        return "#FFAA1F";
      }
    };

    const currentPageContent = ref("waiting");

    const mainButtonLabel = ref("Accept");

    const orderData = reactive({
      uniqueReference: "#TRD00001",
      p2p_chat: {
        logo: "/images/icons/logo-chat.png",
        title: "P2P Trade Chat",
        last_message: "Raymond: I am on my way",
        unread: 1,
        time: "17:22",
      },
      customer: {
        profile_image: "/images/temps/customer.png",
        name: "Raymond Akinola",
        type: "Customer",
      },
      data: [
        [
          {
            title: "Order",
            content: "80 USDC to ₺3240",
          },
        ],
        [
          {
            title: "Time Ordered",
            content: `<span class="flex flex-row items-center">
             <span> 13:55 </span>
              <span class="h-[4px] w-[4px] rounded-full !bg-black mx-[5px]"> </span>
             <span> Mar 12 </span>
            </span>`,
          },
          {
            title: "Order Status",
            content: `<span class="flex flex-row items-center">
             <span style="color:${colorByStatus(
               "pending"
             )};" class="mr-1"> Pending </span>
             <span class="h-[12px] w-[12px] rounded-full" style="background-color:${colorByStatus(
               "pending"
             )};"></span>
            </span>`,
          },
        ],
        [
          {
            title: "You buy",
            content: "80 USDC",
          },
          {
            title: "You give",
            content: "₺ 3240",
          },
          {
            title: "Payment Type",
            content: "Cash",
          },
          {
            title: "Payout Option",
            content: "In-Person Pickup",
          },
        ],
      ],
    });

    return {
      Logic,
      orderData,
      getBottomPadding,
      colorByStatus,
      currentPageContent,
      mainButtonLabel,
    };
  },
  data() {
    return {
      parentRefs: [],
    };
  },
  mounted() {
    const parentRefs: any = this.$refs;
    this.parentRefs = parentRefs;
  },
});
</script>
