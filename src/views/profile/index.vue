<template>
  <app-wrapper>
    <div class="flex h-full flex-col">
      <div class="relative w-full overflow-hidden">
        <div class="bg-gradient-to-br from-[#0F7F3C] to-[#16A55A] px-6 pt-16 pb-20">
          <div class="flex items-center justify-between">
            <button @click="$router.back()" class="flex h-10 w-10 items-center justify-center text-white">
              <app-icon name="arrow-left" custom-class="!h-[24px] filter invert" />
            </button>
            <app-header-text class="!text-white !text-lg !font-semibold">Profile</app-header-text>
            <div class="w-10"></div>
          </div>
        </div>
      </div>

      <div class="-mt-14 flex-1 overflow-y-auto  pb-10">
        <!-- Profile Picture and Share Button Row -->
        <div class="flex items-start justify-between mb-6 px-6 relative">
          <div class="flex-shrink-0">
            <app-image-loader :photo-url="Logic.Auth.GetDefaultBusiness()?.logo ||
              '/images/profile-image.svg'
              " custom-class="!h-[100px] !w-[100px] rounded-full border-[4px] border-white shadow-lg" />
          </div>
          <div class="flex flex-col items-end space-y-4">
            <div class="h-[50px]"></div>
            <app-button variant="primary"
              :customClass="`!bg-gradient-to-r !from-[#0F7F3C] !to-[#16A55A] !text-white !rounded-full !px-6 !py-2 !h-auto !min-h-0`"
              @click="Logic.Common.GoToRoute('/profile/share-asset')">
              Share Profile
            </app-button>
          </div>
        </div>

        <!-- White Card with Content -->
        <div class="px-6">
          <app-header-text class="!text-[#111827] !text-[22px] !font-semibold">
            {{ Logic.Auth.GetDefaultBusiness()?.business_name }}
          </app-header-text>

          <app-normal-text class="!text-[#0F172A] !text-sm !font-medium !mt-1">
            {{ Logic.Auth.GetDefaultBusiness()?.business_type }}
          </app-normal-text>

          <app-normal-text class="mt-2 flex items-center space-x-2">
            {{ Logic.Auth.GetDefaultBusiness()?.description }}
          </app-normal-text>

          <div class="mt-4 flex items-center space-x-1">
            <app-icon name="event/location" custom-class="!h-[20px]" />
            <app-normal-text class="!text-[#111827] !text-sm">
              {{ JSON.parse(Logic.Auth.GetDefaultBusiness()?.address).address }}
            </app-normal-text>
          </div>

          <div class="mt-5 flex items-center text-sm">
            <app-header-text class="!text-[#111827] !text-base !font-semibold !leading-none">
              {{ Logic.Auth.GetDefaultBusiness()?.followerCount || 0 }}
            </app-header-text>
            <app-normal-text class="!text-[#6B7280] !text-sm !ml-1 !leading-none">
              Customers
            </app-normal-text>
            <span class="mx-3 text-[#D1D5DB]">•</span>
            <app-header-text class="!text-[#111827] !text-base !font-semibold !leading-none">
              {{ Logic.Auth.GetDefaultBusiness()?.patronizerCount || 0 }}
            </app-header-text>
            <app-normal-text class="!text-[#6B7280] !text-sm !ml-1 !leading-none">
              Patronizers
            </app-normal-text>
          </div>
        </div>

        <div class="mt-8 h-[10px] w-full bg-[#F0F3F6]"></div>

        <div class="mt-6 flex flex-col px-6 space-y-3 pb-16">
          <template v-for="(item, index) in profileItems" :key="index">
            <app-button v-if="item.show"
              :customClass="`!flex !items-center !justify-between !h-[72px] !rounded-2xl !border-[1.5px] !border-[#F0F3F6] !bg-white !px-5 !py-4 !w-full`"
              :class="[item.route ? 'cursor-pointer' : 'cursor-default']"
              @click="item.route && Logic.Common.GoToRoute(item.route)">
              <div class="flex items-center space-x-4">
                <app-icon :name="item.logo" :custom-class="`${item.logo_size}`" />
                <app-normal-text class="!text-[#111827] !text-base">
                  {{ item.title }}
                </app-normal-text>
              </div>
              <app-icon name="arrow-right" custom-class="!h-[18px]" />
            </app-button>
          </template>

          <!-- Logout Button -->
          <div class="mt-10 w-full flex flex-col">
            <app-button variant="secondary" :class="`!py-4 border-1 border-secondary !w-full !rounded-2xl`"
              @click="Logic.Auth.SignOut()">
              Log Out
            </app-button>
          </div>

          <div class="w-full flex items-center justify-center">
            <app-button variant="danger" :customClass="`!py-4 !w-full !rounded-2xl`" outlined
              @click="showDeleteAccountModal = true">
              Delete Account
            </app-button>
          </div>
        </div>
      </div>
    </div>

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
import { defineComponent, reactive, ref, onMounted } from "vue";
import { getBottomPadding } from "../../composable";
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
        title: "Personal Information",
        logo: "personal-info",
        logo_size: "!h-[24px]",
        route: "/profile/info",
        show: true,
      },
      {
        title: "Business Profile",
        logo: "business-info",
        logo_size: "!h-[24px]",
        route: "/profile/business-info",
        show: true,
      },
      {
        title: "Business Location",
        logo: "event/location",
        logo_size: "!h-[24px]",
        route: "/profile/business-location",
        show: true,
      },
      {
        title: "Default Currency",
        logo: "default-currency",
        logo_size: "!h-[22px]",
        route: "/profile/currency",
        show: true,
      },
      // {
      //   title: "Withdrawal Accounts",
      //   logo: "withdrawal-accounts",
      //   logo_size: "!h-[20px]",
      //   route: "/profile/accounts",
      // },
      {
        title: "Payment Methods",
        logo: "wallet-grey",
        logo_size: "!h-[22px]",
        route: "/profile/payment-methods",
        show: Logic.Auth.GetDefaultBusiness()?.business_type == "exchanger",
      },
      {
        title: "Shop Settings",
        logo: "shop",
        logo_size: "!h-[22px]",
        route: "/profile/shop-settings",
        show: true,
      },
      {
        title: "Security Setup",
        logo: "shield-security",
        logo_size: "!h-[24px]",
        route: "/profile/settings",
        show: true,
      },
      {
        title: "Customer Support",
        logo: "message",
        logo_size: "!h-[24px]",
        route: null,
        show: true,
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
