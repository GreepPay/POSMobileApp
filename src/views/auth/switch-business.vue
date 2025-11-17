<template>
  <app-wrapper>
    <subpage-layout title="Business Profiles">
      <div class="w-full flex flex-col items-center justify-start px-4 pt-1">
        <template v-for="(method, index) in userBusinesses" :key="index">
          <div
            :class="`w-full flex flex-col space-y-1 px-4 py-4 !border-[2px] mb-3 ${
              selectedMethod == method.id
                ? 'border-primary'
                : 'border-[#F0F3F6]'
            } rounded-[16px] relative`"
            @click="selectedMethod = method.id"
          >
            <div
              class="w-full flex flex-row justify-between items-center h-full"
            >
              <div class="flex flex-row h-full items-center justify-center">
                <div
                  class="w-[48px] h-full items-center justify-center flex mr-3"
                >
                  <app-image-loader
                    :photo-url="method.logo_url || '/images/profile-image.svg'"
                    custom-class="h-[48px] w-[48px] rounded-full border-[1px]"
                  ></app-image-loader>
                </div>

                <div class="w-full flex flex-col">
                  <div class="w-full flex flex-row items-center">
                    <app-normal-text class="text-left !text-sm !font-semibold">
                      {{ method.name }}
                    </app-normal-text>
                  </div>
                  <app-normal-text class="text-left !text-[#616161] capitalize">
                    {{ method.type }}
                  </app-normal-text>
                </div>
              </div>

              <div class="flex flex-row justify-end w-[30px]">
                <app-icon
                  :name="
                    selectedMethod == method.id ? 'selected' : 'not-selected'
                  "
                  class="h-[24px]"
                />
              </div>
            </div>
          </div>
        </template>

        <div class="w-full flex flex-col pt-2">
          <div
            class="w-full flex flex-row items-center"
            @click="Logic.Common.GoToRoute('/auth/setup?from=switch-business')"
          >
            <app-icon name="add-square" custom-class="h-[24px]" />
            <app-normal-text
              class="!text-left !text-sm !text-[#00683F] font-[500] ml-2"
            >
              Add Business
            </app-normal-text>
          </div>
        </div>

        <!-- Spacer -->
        <div class="!h-[60px] py-6"></div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        style="
          padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
        "
        @click="continueToNext()"
      >
        <div class="">
          <app-button
            variant="secondary"
            :class="`!w-full !py-4`"
            @click="continueToNext"
          >
            Switch Profile
          </app-button>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import {
  AppNormalText,
  AppIcon,
  AppImageLoader,
  AppHeaderText,
  AppButton,
} from "@greep/ui-components";
import { ref } from "vue";
import { Logic } from "@greep/logic";
import { onMounted } from "vue";
import { availableCurrencies } from "../../composable";
import { onIonViewWillEnter } from "@ionic/vue";
import { User } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "AddMoneyPaymentMethod",
  components: {
    AppNormalText,
    AppButton,
    AppIcon,
    AppImageLoader,
    AppHeaderText,
  },
  middlewares: {
    fetchRules: [],
  },
  setup() {
    const selectedMethod = ref<string>("");

    const AuthUser = ref<User | undefined>(Logic.Auth.AuthUser);

    const userBusinesses = reactive<
      {
        id: string;
        name: string;
        logo_url: string;
        type: string;
      }[]
    >([]);

    const continueToNext = () => {
      if (selectedMethod.value) {
        localStorage.setItem("current_business_id", selectedMethod.value);

        Logic.Common.GoToRoute("/", true);
      }
    };

    const setUserBusinesses = () => {
      const userBusinessesList = AuthUser.value?.businesses || [];

      userBusinesses.length = 0; // Clear the array while keeping reactivity

      userBusinessesList.forEach((business) => {
        userBusinesses.push({
          id: business.id,
          name: business.business_name || "N/A",
          logo_url: business.logo || "/images/profile-image.svg",
          type: business.business_type?.replace("_", " ") || "N/A",
        });
      });

      if (Logic.Auth.GetDefaultBusiness()) {
        selectedMethod.value = Logic.Auth.GetDefaultBusiness()?.id || "";
      }
    };

    onIonViewWillEnter(() => {
      setUserBusinesses();
    });

    onMounted(() => {
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      setUserBusinesses();
    });

    return {
      userBusinesses,
      Logic,
      selectedMethod,
      continueToNext,
      availableCurrencies,
    };
  },
});
</script>
