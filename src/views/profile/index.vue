<template>
  <app-wrapper>
    <subpage-3-layout
      title="Business"
      :logo="currentBusiness?.logo || ''"
      :coverImage="currentBusiness?.banner"
    >
      <template #header-content v-if="currentBusiness">
        <business-basic-info :business-details="currentBusiness" />
      </template>

      <div class="w-full flex flex-col">
        <div class="w-full flex flex-col px-4">
          <template v-for="(option, index) in profileItems" :key="index">
            <div
              v-if="option.show"
              class="w-full flex flex-row items-center justify-between px-4 py-4 border-[1.5px] border-[#F0F3F6] rounded-[12px] mb-4"
              @click="handleOptionClick(option)"
            >
              <div class="flex flex-row items-center justify-start">
                <div class="w-[25px]">
                  <app-icon
                    :name="option.logo"
                    :custom-class="option.logo_size"
                  />
                </div>

                <app-normal-text class="ml-2 !text-[12px] !text-left">
                  {{ option.title }}
                </app-normal-text>
              </div>

              <div class="flex flex-row justify-end items-center">
                <app-icon name="chevron-right" custom-class="!h-[24px]" />
              </div>
            </div>
          </template>
        </div>

        <div class="w-full pt-4 px-4 space-y-2">
          <div class="w-full flex flex-col">
            <app-button
              variant="secondary"
              :class="`!py-4 border-1 border-secondary !w-full`"
              @click="Logic.Auth.SignOut()"
            >
              Log Out
            </app-button>
          </div>

          <div class="w-full flex items-center justify-center">
            <app-button
              variant="danger"
              :customClass="`!py-4 !w-full`"
              outlined
              @click="showDeleteAccountModal = true"
            >
              Delete Account
            </app-button>
          </div>
        </div>

        <!-- Spacer -->
        <div class="py-8 h-[20px]"></div>
      </div>
    </subpage-3-layout>

    <app-modal
      v-if="showDeleteAccountModal"
      can-close
      :close="
        () => {
          showDeleteAccountModal = false;
        }
      "
      :innerClass="'!px-0 !pt-0'"
    >
      <div class="w-full flex flex-col pb-2 !overflow-y-auto !max-h-[400px]">
        <div class="w-full flex flex-col pb-3 bg-white sticky top-0 left-0">
          <app-header-text class="text-left !text-lg">
            Delete Account
          </app-header-text>
        </div>

        <div
          class="w-full flex flex-col items-center justify-between pt-1 h-full"
        >
          <app-normal-text
            custom-class="!text-gray-600 !text-sm !text-center px-4 py-4"
          >
            Are you sure you want to delete your account? This action cannot be
            undone.
          </app-normal-text>

          <div
            class="w-full flex flex-col items-center justify-center space-y-1 !text-xs pt-3"
          >
            <div class="w-full flex items-center justify-center">
              <app-button
                variant="secondary"
                :customClass="`!py-4 !w-full`"
                @click="showDeleteAccountModal = false"
                >No</app-button
              >
            </div>
            <div class="w-full flex items-center justify-center">
              <app-button
                variant="danger"
                :customClass="`!py-4 !w-full`"
                outlined
                @click="Logic.Auth.DeleteUser()"
              >
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
import { defineComponent, reactive, ref, onMounted, computed } from "vue";
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
import { Business, User } from "@greep/logic/src/gql/graphql";
import BusinessBasicInfo from "@/components/Business/BasicInfo.vue";

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
    BusinessBasicInfo,
  },
  setup() {
    const AuthUser = ref<User>(Logic.Auth.AuthUser);
    const showDeleteAccountModal = ref(false);

    const profileItems = reactive([
      {
        title: "Personal Information",
        logo: "personal-info",
        logo_size: "!h-[23px]",
        route: "/profile/info",
        show: true,
      },
      {
        title: "Business Profile",
        logo: "business-info",
        logo_size: "!h-[23px]",
        route: "/profile/business-info",
        show: true,
      },
      {
        title: "Business Location",
        logo: "location",
        logo_size: "!h-[23px]",
        route: "/profile/business-location",
        show: true,
      },
      {
        title: "Default Currency",
        logo: "default-currency",
        logo_size: "!h-[23px]",
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
        logo: "wallet-black",
        logo_size: "!h-[23px]",
        route: "/profile/payment-methods",
        show: Logic.Auth.GetDefaultBusiness()?.business_type == "exchanger",
      },
      {
        title: "Shop Settings",
        logo: "business-type",
        logo_size: "!h-[23px]",
        route: "/profile/shop-settings",
        show: true,
      },
      {
        title: "Security Setup",
        logo: "shield-security",
        logo_size: "!h-[23px]",
        route: "/profile/settings",
        show: true,
      },
      {
        title: "Customer Support",
        logo: "message",
        logo_size: "!h-[23px]",
        route: null,
        show: true,
      },
    ]);

    const openSupport = () => {
      const currentBusiness: Business = Logic.Auth.GetDefaultBusiness();
      // @ts-expect-error window.$chatwoot is not defined
      if (window.$chatwoot) {
        // @ts-expect-error window.$chatwoot is not defined
        window.$chatwoot.setUser(currentBusiness?.uuid, {
          email: Logic.Auth.AuthUser?.email,
          name: currentBusiness?.business_name,
          avatar_url: currentBusiness?.logo || undefined,
          phone_number: Logic.Auth.AuthUser?.phone || undefined,
        });
        // @ts-expect-error window.$chatwoot is not defined
        window.$chatwoot.toggle();
      } else {
        console.warn("Chatwoot is not loaded yet.");
      }
    };

    const currentBusiness = computed(() => {
      return Logic.Auth.GetDefaultBusiness();
    });

    const handleOptionClick = (option: {
      logo: string | null;
      route: string | null;
    }) => {
      if (option.logo === "message") {
        openSupport();
        return;
      }

      if (option.route) {
        Logic.Common.GoToRoute(option.route);
      }
    };

    const shareBusinessProfile = () => {
      //
    };

    onMounted(() => {
      Logic.Auth.watchProperty("AuthUser", AuthUser);
    });

    return {
      Logic,
      profileItems,
      AuthUser,
      getBottomPadding,
      showDeleteAccountModal,
      currentBusiness,
      shareBusinessProfile,
      handleOptionClick,
    };
  },
});
</script>
