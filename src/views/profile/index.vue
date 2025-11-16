<template>
  <app-wrapper>
    <subpage-layout title="Profile">
      <div class="w-full flex flex-col justify-start px-4 h-full pt-1">
        <!-- Profile Information -->
        <amount-card is-wrapper>
          <div class="w-full flex flex-row space-x-2 justify-center z-4 py-5">
            <div class="w-[96px]">
              <app-image-loader :photo-url="Logic.Auth.GetDefaultBusiness()?.logo ||
                '/images/profile-image.svg'
                " custom-class="!h-[96px] !w-[96px] rounded-full" />
            </div>
            <div class="w-full flex flex-col space-y-[1px] z-1">
              <app-normal-text class="!text-white font-semibold !text-left !text-base">
                {{ AuthUser.first_name }}
                {{ AuthUser.last_name }}</app-normal-text>
              <app-normal-text class="font-light !text-left !text-white">{{
                Logic.Auth.GetDefaultBusiness()?.business_name
                }}</app-normal-text>

              <div class="pt-3">
                <div class="px-2 py-2 space-x-2 items-center bg-[#0A141E]/35 flex flex-row rounded-full w-fit"
                  @click="Logic.Common.GoToRoute('/grp')">
                  <div class="flex flex-row space-x-1 items-center">
                    <app-icon name="grp-logo-white" custom-class="!h-[24px]" />

                    <app-normal-text class="!text-white font-[500] !text-sm">{{
                      Logic.Common.convertToMoney(
                        AuthUser.wallet?.point_balance,
                        true,
                        ""
                      )
                    }}
                    </app-normal-text>
                  </div>

                  <app-icon name="arrow-right-white" custom-class="!h-[20px]" />
                </div>
              </div>
            </div>
          </div>
        </amount-card>

        <!-- Profile items -->
        <div class="flex flex-col pt-6">
          <div class="w-full px-3 flex flex-row space-x-4 mb-3 items-center py-2 pb-4 border-b-[1px] border-[#E0E2E4]"
            v-for="(item, index) in profileItems" :key="index" @click="Logic.Common.GoToRoute(item.route)">
            <app-icon :name="item.logo" :custom-class="`${item.logo_size}`" />
            <app-normal-text class="!text-black !text-sm">
              {{ item.title }}
            </app-normal-text>
          </div>
        </div>
      </div>

      <!-- Bottom button -->
      <div class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 space-y-2" :style="`
          ${getBottomPadding}
        `">
        <div class="w-full flex flex-col">
          <app-button variant="secondary" :class="`!py-4 border-1 border-secondary !w-full`"
            @click="Logic.Auth.SignOut()">
            Log Out
          </app-button>
        </div>

        <div class="w-full flex items-center justify-center">
          <app-button variant="danger" :customClass="`!py-4 !w-full`" outlined @click="showDeleteAccountModal = true">
            Delete Account
          </app-button>
        </div>
      </div>
    </subpage-layout>

    <!-- Delete account modal -->
    <app-modal v-if="showDeleteAccountModal" can-close :close="() => {
        showDeleteAccountModal = false;
      }
      " :innerClass="'!px-0 !pt-0'">
      <div class="w-full flex flex-col pb-2 !overflow-y-auto !max-h-[400px]">
        <div class="w-full flex flex-col pb-3 bg-white sticky top-0 left-0">
          <app-header-text class="text-left !text-lg">
            Delete Account
          </app-header-text>
        </div>

        <div class="w-full flex flex-col items-center justify-between pt-1 h-full">
          <app-normal-text custom-class="!text-gray-600 !text-sm !text-center px-4 py-4">
            Are you sure you want to delete your account? This action cannot be
            undone.
          </app-normal-text>

          <div class="w-full flex flex-col items-center justify-center space-y-1 !text-xs pt-3">
            <div class="w-full flex items-center justify-center">
              <app-button variant="secondary" :customClass="`!py-4 !w-full`"
                @click="showDeleteAccountModal = false">No</app-button>
            </div>
            <div class="w-full flex items-center justify-center">
              <app-button variant="danger" :customClass="`!py-4 !w-full`" outlined @click="Logic.Auth.DeleteUser()">
                Yes
              </app-button>
            </div>
          </div>

          <!-- Spacer -->
          <div class="h-[20px]"></div>
        </div>
      </div>
    </app-modal>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import {
  AppButton,
  AppImageLoader,
  AppNormalText,
  AppIcon,
  AppModal,
  AppHeaderText,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import AmountCard from "../../components/Common/AmountCard.vue";
import { User } from "@greep/logic/src/gql/graphql";
import { ref } from "vue";
import { onMounted } from "vue";
import { getBottomPadding } from "../../composable";

export default defineComponent({
  name: "ProfilePage",
  components: {
    AppButton,
    AmountCard,
    AppImageLoader,
    AppNormalText,
    AppIcon,
    AppModal,
    AppHeaderText,
  },
  setup() {
    const AuthUser = ref<User>(Logic.Auth.AuthUser);
    const showDeleteAccountModal = ref(false);
    const profileItems = reactive([
      {
        title: "Personal Info",
        logo: "personal-info",
        logo_size: "!h-[22px]",
        route: "/profile/info",
      },
      {
        title: "Business Info",
        logo: "business-info",
        logo_size: "!h-[22px]",
        route: "/profile/business-info",
      },
      {
        title: "Business Locations",
        logo: "event/location",
        logo_size: "!h-[22px]",
        route: "/profile/business-location",
      },
      {
        title: "Shop Settings",
        logo: "settings",
        logo_size: "!h-[22px]",
        route: "/profile/shop-settings",
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
        title: "Payment Methods",
        logo: "wallet-grey",
        logo_size: "!h-[22px]",
        route: "/profile/payment-methods",
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
      getBottomPadding,
      showDeleteAccountModal,
    };
  },
});
</script>
