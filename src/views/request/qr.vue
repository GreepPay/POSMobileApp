<template>
  <app-wrapper>
    <subpage-layout title="QR-Payment">
      <div
        class="w-full flex flex-col items-center justify-center px-4 space-y-4 h-full -mt-10"
      >
        <div class="w-full flex flex-col items-center justify-center space-y-4">
          <app-normal-text class="!text-gray-800 text-center">
            Amount Requested
          </app-normal-text>
          <app-header-text class="!text-3xl">
            ₺
            {{
              !Number.isNaN(parseFloat(amount))
                ? Logic.Common.convertToMoney(amount, false, "", false)
                : "0"
            }}
          </app-header-text>
        </div>
        <div class="w-full flex flex-col items-center justify-center space-y-3">
          <div
            class="w-[90%] h-[300px] px-2 py-2 border-[2px] border-gray-300 rounded-[12px]"
          >
            <div class="w-full h-full flex items-center justify-center">
              <app-qr-code v-if="qrCodeData" :data="qrCodeData" />
            </div>
          </div>

          <div class="w-[70%] flex flex-col items-center justify-center space-y-2">
            <app-normal-text class="!text-center !text-gray-800">
              Show QR code to customer to receive payment from them
            </app-normal-text>
          </div>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppHeaderText, AppNormalText, AppQrCode } from "@greep/ui-components";
import { ref } from "vue";
import { Logic } from "@greep/logic";
import { onMounted } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import { computed } from "vue";

export default defineComponent({
  name: "RequestQRPage",
  components: {
    AppHeaderText,
    AppNormalText,
    AppQrCode,
  },
  setup() {
    const amount = ref("0");

    const setAmount = () => {
      //  Get amount from query params
      const queryParams = Logic.Common.route?.query;
      if (queryParams) {
        amount.value = queryParams.amount as string;
      }
    };

    const qrCodeData = computed(() => {
      return JSON.stringify({
        amount: amount.value,
        currency: "TRY",
        uuid: "1234567890",
      });
    });

    onIonViewWillEnter(() => {
      setAmount();
    });

    onMounted(() => {
      setAmount();
    });

    return {
      amount,
      Logic,
      qrCodeData,
    };
  },
});
</script>
