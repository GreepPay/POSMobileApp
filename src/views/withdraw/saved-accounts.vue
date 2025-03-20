<template>
  <app-wrapper>
    <subpage-layout title="Choose Account">
      <div
        class="w-full flex flex-col items-center justify-start px-4 h-full pt-1"
      >
        <template v-for="(account, index) in allAccounts" :key="index">
          <div
            class="w-full flex flex-row items-center justify-between mb-5"
            @click="selectedAccount = account.key"
          >
            <div class="w-full flex flex-row space-x-2 items-center">
              <app-image-loader
                :photo-url="account.logo"
                class="!h-[40px] w-[40px] rounded-full"
              />

              <app-normal-text class="!text-left">{{
                account.title
              }}</app-normal-text>
            </div>

            <div class="flex flex-row justify-end">
              <app-icon
                :name="`${
                  selectedAccount == account.key ? 'selected' : 'not-selected'
                }`"
                class="h-[24px]"
              />
            </div>
          </div>
        </template>

        <div class="w-full flex flex-col">
          <div
            @click="Logic.Common.GoToRoute('/banks/add')"
            class="w-full flex flex-row space-x-1 px-3 py-3 border-[1.5px] rounded-[12px] items-center border-[#0A141E]"
          >
            <app-icon name="black-plus" custom-class="h-[24px]" />

            <app-normal-text class="!text-left"> New Account </app-normal-text>
          </div>
        </div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        style="
          padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
        "
      >
        <div class="w-full flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4`"
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
  AppButton,
  AppIcon,
  AppNormalText,
  AppImageLoader,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";

export default defineComponent({
  name: "SavedAccountsPage",
  components: {
    AppButton,
    AppIcon,
    AppNormalText,
    AppImageLoader,
  },
  setup() {
    const selectedAccount = ref<string>("gtbank");

    const allAccounts = reactive([
      {
        title: "GTBank (******4416)",
        key: "gtbank",
        logo: `/images/temps/gt_bank.png`,
      },
      {
        title: "Kuda (******1208)",
        key: "kuda",
        logo: `/images/temps/kuda_bank.png`,
      },
    ]);

    const continueToNext = () => {
      Logic.Common.GoToRoute("/withdraw/confirm");
    };

    return {
      allAccounts,
      Logic,
      selectedAccount,
      continueToNext,
    };
  },
});
</script>
