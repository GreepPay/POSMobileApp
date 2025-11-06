<template>
  <app-wrapper>
    <subpage-layout title="Transfer to GreepPay">
      <div
        class="w-full flex flex-col items-center h-full relative overflow-y-auto pb-[130px]"
      >
        <div class="w-full flex flex-col px-4 pb-4">
          <app-title-card-container customClass="!rounded-[16px]">
            <div class="flex flex-col justify-center items-center w-full">
              <div class="w-full flex flex-col items-start justify-start">
                <app-normal-text
                  custom-class="!text-white !font-normal !font-sm pb-1  text-center"
                >
                  Amount
                </app-normal-text>

                <app-header-text class="!text-3xl text-white !font-normal pt-1">
                  {{ currencySymbol }}
                  {{
                    !Number.isNaN(parseFloat(amountFromQuery))
                      ? Logic.Common.convertToMoney(
                          amountFromQuery,
                          false,
                          "",
                          false
                        )
                      : "0"
                  }}
                </app-header-text>
              </div>
            </div>
          </app-title-card-container>
        </div>

        <!-- Search -->
        <div class="w-full flex flex-col">
          <app-normal-text class="px-4 pb-3 !font-semibold !text-sm">
            Choose Recipient
          </app-normal-text>
          <div class="w-full px-4 sticky top-0 bg-white z-10">
            <app-text-field
              :has-title="false"
              type="search"
              placeholder="Find by name, email or tag"
              ref="search"
              name="search"
              v-model="searchQuery"
              :custom-class="`!border-[1.5px] ${
                searchQuery.length > 0
                  ? '!border-[#10BB76]'
                  : '!border-[#E0E2E4]'
              }  !rounded-[99px] px-4 !py-3 !bg-transparent`"
              :input-style="``"
            >
              <template #inner-prefix>
                <app-icon name="search-normal" custom-class="h-[22px]" />
              </template>

              <template #inner-suffix v-if="searchIsLoading">
                <app-loading class="!text-primary" />
              </template>
            </app-text-field>
          </div>
        </div>

        <!-- Tabs -->
        <!-- <div class="w-full px-4 pt-3" v-if="searchQuery.length == 0">
          <app-tabs :tabs="tabs" v-model:activeTab="activeTab" />
        </div> -->

        <!-- Filtered List -->
        <div class="w-full px-4 pt-2">
          <app-beneficiary-list
            v-model="selectedBeneficiary"
            :dataItems="filteredBeneficiaries"
            @update:model-value="continueToNext()"
          />
        </div>
      </div>

      <!-- Bottom Button -->
      <!-- <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        style="
          padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
        "
      >
        <div class="w-full flex flex-col">
          <app-button
            @click="continueToNext"
            :disabled="!selectedBeneficiary"
            class="!py-4"
            variant="secondary"
          >
            Next
          </app-button>
        </div>
      </div> -->
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import {
  // AppButton,
  AppBeneficiaryList,
  // AppTabs,
  AppTextField,
  AppIcon,
  AppLoading,
  AppNormalText,
  AppTitleCardContainer,
  AppHeaderText,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { watch } from "vue";
import { onMounted } from "vue";
import { withdrawalAvailableCurrencies } from "../../composable";
import { mapToBeneficiaries } from "../../composable/users";
import { MappedBeneficiary } from "../../composable/types";

export default defineComponent({
  name: "SelectBeneficiaryPage",
  components: {
    // AppButton,
    AppBeneficiaryList,
    // AppTabs,
    AppTextField,
    AppIcon,
    AppLoading,
    AppNormalText,
    AppHeaderText,
    AppTitleCardContainer,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Beneficiary",
        property: "ManyBeneficiaries",
        method: "GetBeneficiaries",
        params: [
          {
            first: 40,
            page: 1,
          },
        ],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
    ],
  },
  setup() {
    const searchQuery = ref("");
    const activeTab = ref("recents");
    const selectedBeneficiary = ref<MappedBeneficiary>();

    // Logic state
    const SearchedUsers = ref(Logic.User.SearchedUsers);
    const ManyBeneficiaries = ref(Logic.Beneficiary.ManyBeneficiaries);
    const SearchedBusinesses = ref(Logic.User.SearchedBusinesses);

    const searchIsLoading = ref(false);
    const beneficiaries = reactive<MappedBeneficiary[]>([]);

    const tabs = [
      { key: "recents", label: "Recents" },
      { key: "beneficiaries", label: "Beneficiaries" },
    ];

    const defaultCountryCode = computed(() => {
      return withdrawalAvailableCurrencies.filter(
        (item) => item.code == Logic.Common.route?.query?.currency?.toString()
      )[0];
    });

    const modelCurrencyValue = ref(defaultCountryCode.value?.code);
    const currencySymbol = ref(defaultCountryCode.value?.symbol);

    const amountFromQuery = computed(
      () => Logic.Common.route?.query?.amount?.toString() || "0"
    );

    const filteredBeneficiaries = computed(() => {
      if (!searchQuery.value) return beneficiaries;
      return beneficiaries.filter((b) => {
        const matchesTab =
          activeTab.value === "recents" ||
          (activeTab.value === "beneficiaries" && b.isBeneficiary);
        return matchesTab;
      });
    });

    const searchUsers = async () => {
      if (!searchQuery.value) return;
      if (searchIsLoading.value) return;

      searchIsLoading.value = true;
      try {
        await Promise.all([
          Logic.User.SearchForUsers(searchQuery.value),
          Logic.User.SearchForBusinesses(searchQuery.value),
        ]);
        setBeneficiaries();
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        searchIsLoading.value = false;
      }
    };

    const setBeneficiaries = () => {
      beneficiaries.length = 0;
      beneficiaries.push(
        ...mapToBeneficiaries(SearchedBusinesses.value || [], "business"),
        ...mapToBeneficiaries(SearchedUsers.value || [], "user"),
        ...mapToBeneficiaries(
          ManyBeneficiaries.value?.data || [],
          "beneficiary"
        )
      );
    };

    // Watchers
    watch(searchQuery, () => {
      Logic.Common.debounce(() => searchUsers());
    });

    watch([SearchedUsers, SearchedBusinesses, ManyBeneficiaries], () => {
      setBeneficiaries();
    });

    const continueToNext = () => {
      const currencyFromQuery =
        Logic.Common.route?.query?.currency?.toString() ||
        selectedBeneficiary.value?.currency;

      Logic.Common.GoToRoute(
        `/send/confirm?payment_uuid=${
          selectedBeneficiary.value?.wallet_uuid
        }&amount=${amountFromQuery.value}&currency=${
          currencyFromQuery || "USD"
        }`
      );
    };

    onMounted(() => {
      Logic.User.watchProperty("SearchedUsers", SearchedUsers);
      Logic.User.watchProperty("ManyBeneficiaries", ManyBeneficiaries);
      Logic.User.watchProperty("SearchedBusinesses", SearchedBusinesses);
      setBeneficiaries();
    });

    return {
      Logic,
      continueToNext,
      activeTab,
      tabs,
      filteredBeneficiaries,
      selectedBeneficiary,
      searchQuery,
      searchIsLoading,
      modelCurrencyValue,
      currencySymbol,
      amountFromQuery,
      AppTitleCardContainer,
      ManyBeneficiaries,
    };
  },
});
</script>
