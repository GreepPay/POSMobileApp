<template>
  <app-wrapper>
    <subpage-layout title="Payment Methods">
      <div class="w-full flex flex-col justify-start h-full pt-1">
        <div
          class="w-full flex flex-col items-center justify-start px-4 h-full pt-4"
        >
          <!-- Add new payment method button -->
          <div class="w-full flex flex-col pb-4">
            <div
              @click="goToAddPaymentMethod"
              class="w-full flex flex-row space-x-1 px-3 py-3 border-[1.5px] rounded-[12px] items-center border-[#0A141E]"
            >
              <app-icon name="black-plus" custom-class="h-[24px]" />

              <app-normal-text class="!text-left">
                Add Payment Method
              </app-normal-text>
            </div>
          </div>

          <!-- Empty state -->
          <template v-if="!paymentMethods || paymentMethods.length === 0">
            <div class="w-full flex flex-col items-center justify-center py-20">
              <app-normal-text class="text-gray-500 text-center mb-2">
                No payment methods added yet
              </app-normal-text>
            </div>
          </template>

          <!-- Payment methods list -->
          <template v-else>
            <template v-for="(method, index) in paymentMethods" :key="index">
              <div
                class="w-full flex flex-row items-center justify-between mb-5 p-4 border border-gray-200 rounded-lg"
              >
                <div class="w-full flex flex-row space-x-3 items-start">
                  <app-icon name="wallet-grey" custom-class="h-[24px] mt-1" />

                  <div class="flex flex-col space-y-1">
                    <app-normal-text class="!text-left font-semibold">
                      {{ method.account_name }}
                    </app-normal-text>
                    <app-normal-text class="!text-left text-sm text-gray-600">
                      {{ method.bank_name }}
                    </app-normal-text>
                    <app-normal-text class="!text-left text-sm text-gray-500">
                      {{ method.account_number }} • {{ method.currency }}
                    </app-normal-text>
                  </div>
                </div>

                <div class="flex flex-row space-x-3">
                  <div
                    @click="goToEditPaymentMethod(method.uuid)"
                    class="cursor-pointer"
                  >
                    <app-icon
                      name="edit"
                      custom-class="h-[20px] text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppNormalText, AppIcon } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import { onIonViewDidEnter } from "@ionic/vue";
import { onMounted } from "vue";

export default defineComponent({
  name: "PaymentMethodsPage",
  components: {
    AppNormalText,
    AppIcon,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "ManyP2pPaymentMethods",
        method: "GetMyP2pPaymentMethods",
        params: [20, 1],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
    ],
  },
  setup() {
    const PaymentMethods = ref<any>(Logic.Wallet.ManyP2pPaymentMethods);

    const paymentMethods = reactive<any[]>(
      Logic.Wallet.ManyP2pPaymentMethods?.data || []
    );

    const paginatorInfo = ref<any>(
      Logic.Wallet.ManyP2pPaymentMethods?.paginatorInfo || {}
    );

    const refreshData = async () => {
      try {
        await Logic.Wallet.GetMyP2pPaymentMethods(20, 1);
        paymentMethods.splice(
          0,
          paymentMethods.length,
          ...(Logic.Wallet.ManyP2pPaymentMethods?.data || [])
        );
        paginatorInfo.value =
          Logic.Wallet.ManyP2pPaymentMethods?.paginatorInfo || {};
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };

    refreshData();

    onIonViewDidEnter(() => {
      refreshData();
    });

    const goToAddPaymentMethod = () => {
      Logic.Common.GoToRoute("/profile/payment-methods/add");
    };

    const goToEditPaymentMethod = (uuid: string) => {
      if (uuid) {
        Logic.Common.GoToRoute(`/profile/payment-methods/add?uuid=${uuid}`);
      }
    };

    onMounted(() => {
      Logic.Wallet.watchProperty("ManyP2pPaymentMethods", PaymentMethods);
    });

    return {
      Logic,
      paymentMethods,
      goToAddPaymentMethod,
      goToEditPaymentMethod,
    };
  },
});
</script>
