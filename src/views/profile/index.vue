<template>
  <app-wrapper>
    <subpage-layout title="Profile">
      <div class="w-full flex flex-col justify-start px-4 h-full pt-1">
        <!-- Profile Information -->
        <amount-card is-wrapper>
          <div class="w-full flex flex-row space-x-2 justify-center z-4 py-5">
            <div class="w-[96px]">
              <app-image-loader
                :photo-url="
                  AuthUser?.profile?.profile_picture ||
                  '/images/profile-image.svg'
                "
                custom-class="!h-[96px] !w-[96px]"
              />
            </div>
            <div class="w-full flex flex-col space-y-[1px] z-1">
              <app-normal-text
                class="!text-white font-semibold !text-left !text-base"
                >{{ AuthUser.first_name }}
                {{ AuthUser.last_name }}</app-normal-text
              >
              <app-normal-text class="font-light !text-left !text-white">{{
                AuthUser.profile?.business?.business_name
              }}</app-normal-text>

              <div class="pt-3">
                <div
                  class="px-2 py-2 space-x-2 items-center bg-[#0A141E]/35 flex flex-row rounded-full w-fit"
                  @click="Logic.Common.GoToRoute('/grp')"
                >
                  <div class="flex flex-row space-x-1 items-center">
                    <app-icon name="grp-logo-white" custom-class="!h-[24px]" />

                    <app-normal-text class="!text-white font-[500] !text-sm">{{
                      Logic.Common.convertToMoney(
                        AuthUser.wallet?.point_balance,
                        true,
                        ""
                      )
                    }}</app-normal-text>
                  </div>

                  <app-icon name="arrow-right-white" custom-class="!h-[20px]" />
                </div>
              </div>
            </div>
          </div>
        </amount-card>

        <!-- Profile items -->
        <div class="flex flex-col pt-6">
          <div
            class="w-full px-3 flex flex-row space-x-4 mb-3 items-center py-2 pb-4 border-b-[1px] border-[#E0E2E4]"
            v-for="(item, index) in profileItems"
            :key="index"
            @click="Logic.Common.GoToRoute(item.route)"
          >
            <app-icon :name="item.logo" :custom-class="`${item.logo_size}`" />
            <app-normal-text class="!text-black !text-sm">{{
              item.title
            }}</app-normal-text>
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
            :class="`!py-4 !border-red !text-red !border-[1.5px] hover:!bg-red/20 `"
            outlined
            @click="Logic.Auth.SignOut()"
            >Log Out</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import {
  AppButton,
  AppImageLoader,
  AppNormalText,
  AppIcon,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import AmountCard from "../../components/Common/AmountCard.vue";
import { User } from "@greep/logic/src/gql/graphql";
import { ref } from "vue";
import { onMounted } from "vue";

export default defineComponent({
  name: "ProfilePage",
  components: {
    AppButton,
    AmountCard,
    AppImageLoader,
    AppNormalText,
    AppIcon,
  },
  setup() {
    const AuthUser = ref<User>(Logic.Auth.AuthUser);

    const profileItems = reactive([
      {
        title: "Personal Info",
        logo: "personal-info",
        logo_size: "!h-[22px]",
        route: "/profile/info",
      },
      {
        title: "Default Currency",
        logo: "default-currency",
        logo_size: "!h-[22px]",
        route: "/profile/currency",
      },
      {
        title: "Withdrawal Accounts",
        logo: "withdrawal-accounts",
        logo_size: "!h-[20px]",
        route: "/profile/accounts",
      },
      {
        title: "Login Settings",
        logo: "settings",
        logo_size: "!h-[22px]",
        route: "/profile/settings",
      },
    ]);

    onMounted(() => {
      Logic.Auth.watchProperty("AuthUser", AuthUser);
    });

    return {
      Logic,
      profileItems,
      AuthUser,
    };
  },
});
</script>
