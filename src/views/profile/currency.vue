<template>
  <app-wrapper>
    <subpage-layout title="Default Currency">
      <div class="w-full flex flex-col space-y-5 justify-start px-4 pt-1">
        <div class="w-full flex flex-col space-y-1">
          <div
            class="w-full flex flex-row justify-between items-center py-2"
            v-for="(currency, index) in availableCurrencies"
            :key="index"
            @click="
              formData.preferred_currency =
                currency.code + '_' + currency.country_code
            "
          >
            <div class="flex flex-row space-x-2 items-center">
              <app-image-loader
                :photo-url="`/images/icons/flags/${
                  currency.use_country_code
                    ? currency.country_code?.toLocaleLowerCase()
                    : currency.code?.toLocaleLowerCase()
                }.${currency?.icon_extension || 'svg'}`"
                class="h-[40px] w-[40px] rounded-full"
              />

              <app-normal-text custom-class="!text-left">
                {{ currency.name }}
              </app-normal-text>
            </div>

            <div class="flex flex-row justify-end">
              <app-icon
                :name="`${
                  formData.preferred_currency ==
                  currency.code + '_' + currency.country_code
                    ? 'selected'
                    : 'not-selected'
                }`"
                class="h-[24px]"
              />
            </div>
          </div>
        </div>

        <div class="h-[100px]"></div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div class="w-full flex flex-col">
          <app-button
            @click="continueToNext"
            variant="secondary"
            :class="`!py-4`"
            >Confirm</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import {
  AppButton,
  AppNormalText,
  AppIcon,
  AppImageLoader,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { availableCurrencies, getBottomPadding } from "../../composable";

export default defineComponent({
  name: "ProfileCurrencySettingsPage",
  components: {
    AppButton,
    AppNormalText,
    AppIcon,
    AppImageLoader,
  },
  setup() {
    const FormValidations = Logic.Form;

    const formData = reactive<{
      preferred_currency: string;
    }>({
      preferred_currency: "TRY_TR",
    });

    const continueToNext = async () => {
      const currencyCode = formData.preferred_currency.split("_")[0];

      Logic.User.UpdateBusinessProfileForm = {
        business_uuid: Logic.Auth.GetDefaultBusiness()?.id || "",
        default_currency: currencyCode,
      };

      Logic.Common.showLoader({
        show: true,
        loading: true,
      });

      await Logic.User.UpdateBusinessProfile();
      await Logic.Auth.GetAuthUser();

      Logic.Common.hideLoader();
      Logic.Common.showAlert({
        show: true,
        message: "Default currency has been updated.",
        type: "success",
      });

      Logic.Common.goBack();
    };

    onMounted(() => {
      const currentCurrency = Logic.Auth.GetDefaultBusiness()?.default_currency;

      const currencyInfo = availableCurrencies.find(
        (currency) => currency.code === currentCurrency
      );
      if (currencyInfo) {
        formData.preferred_currency =
          currencyInfo.code + "_" + currencyInfo.country_code;
      }
    });

    return {
      Logic,
      continueToNext,
      FormValidations,
      formData,
      availableCurrencies,
      getBottomPadding,
    };
  },
});
</script>
