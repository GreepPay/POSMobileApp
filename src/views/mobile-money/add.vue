<template>
  <app-wrapper>
    <subpage-layout title="New Mobile Money">
      <app-form-wrapper
        ref="formComponent"
        :parent-refs="parentRefs"
        class="w-full flex flex-col justify-start px-4 h-full pt-4"
      >
        <div class="w-full flex flex-col pb-4">
          <app-text-field
            :has-title="false"
            type="text"
            placeholder="First Name"
            ref="firstName"
            name="First Name"
            use-floating-label
            v-model="formDetails.first_name"
            :rules="[FormValidations.RequiredRule]"
          >
          </app-text-field>
        </div>

        <div class="w-full flex flex-col pb-4">
          <app-text-field
            :has-title="false"
            type="text"
            placeholder="Last Name"
            ref="lastName"
            name="Last Name"
            use-floating-label
            v-model="formDetails.last_name"
            :rules="[FormValidations.RequiredRule]"
          >
          </app-text-field>
        </div>

        <div class="w-full grid grid-cols-12 gap-3 pb-4">
          <div class="col-span-3 flex flex-col">
            <app-select
              :placeholder="'Country'"
              :hasTitle="false"
              :paddings="'py-4 !px-3'"
              :options="countries"
              ref="country"
              v-model="countryPhoneCode"
              auto-complete
            >
            </app-select>
          </div>
          <div class="col-span-9 flex flex-col">
            <app-text-field
              :has-title="false"
              type="tel"
              placeholder="Phone Number"
              ref="phoneNumber"
              name="Mobile Number"
              use-floating-label
              v-model="formDetails.mobile_number"
              :update-value="formDetails.mobile_number"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>
          </div>
        </div>

        <div class="w-full grid grid-cols-1 gap-3">
          <app-select
            :placeholder="'Select Provider'"
            :hasTitle="false"
            :paddings="'py-4 !px-4'"
            :options="mobileMoneyProviders"
            ref="provider"
            use-floating-label
            @OnOptionSelected="
              (data) => {
                formDetails.provider = data.value;
              }
            "
            v-model="formDetails.network_id"
          >
          </app-select>
        </div>
      </app-form-wrapper>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div class="w-full flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4`"
            @click="continueToNext"
            :loading="loadingState"
            >Save & Continue</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import {
  AppButton,
  AppTextField,
  AppSelect,
  AppFormWrapper,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { SelectOption } from "@greep/ui-components/src/types";
import { Country } from "country-state-city";
import { getBottomPadding } from "../../composable";

export default defineComponent({
  name: "AddMobileMoneyPage",
  components: {
    AppButton,
    AppTextField,
    AppSelect,
    AppFormWrapper,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "CurrentYellowCardNetworks",
        method: "GetYellowCardNetwork",
        params: [],
        requireAuth: true,
        ignoreProperty: true,
        silentUpdate: true,
        useRouteQuery: true,
        queries: ["country_code"],
      },
    ],
  },
  setup() {
    const formDetails = reactive({
      first_name: "",
      last_name: "",
      account_holder_name: "",
      mobile_number: "",
      provider: "",
      country: "",
      network_id: "",
      channel_id: "",
    });

    const countryPhoneCode = ref("+234");

    const CurrentYellowCardNetworks = ref(
      Logic.Wallet.CurrentYellowCardNetworks
    );

    const FormValidations = Logic.Form;

    const loadingState = ref(false);

    const amount = ref("");
    const selectedCurrency = ref("");
    const channelId = ref("");
    const countryCode = ref("");
    const countries = reactive<SelectOption[]>([]);

    const formComponent = ref<any>();

    const mobileMoneyProviders = reactive<SelectOption[]>([]);

    const continueToNext = () => {
      const state = formComponent.value.validate();

      if (state) {
        formDetails.country = countryCode.value;
        formDetails.channel_id = channelId.value;

        formDetails.account_holder_name =
          formDetails.first_name + " " + formDetails.last_name;

        formDetails.mobile_number = `${countryPhoneCode.value}${formDetails.mobile_number}`;

        Logic.Wallet.CreateSavedAccountForm = {
          unique_id: formDetails.mobile_number,
          type: "mobile_money",
          metadata: JSON.stringify(formDetails),
        };

        loadingState.value = true;

        Logic.Wallet.CreateSavedAccount()?.then(async (response) => {
          if (response) {
            await Logic.Wallet.GetSavedAccounts(30, 1);
            loadingState.value = false;
            Logic.Common.showAlert({
              show: true,
              type: "success",
              message: "Mobile money account has been saved",
            });
            Logic.Common.goBack();
          } else {
            loadingState.value = false;
          }
        });
      }
    };

    const setCountries = () => {
      countries.length = 0;
      const allCountries = Country.getAllCountries();
      countries.push(
        ...allCountries.map((country) => ({
          key: country.phonecode.startsWith("+")
            ? country.phonecode
            : `+${country.phonecode}`,
          value: country.phonecode.startsWith("+")
            ? country.phonecode
            : `+${country.phonecode}`,
          altValue: `${country.flag} ${country.name} (${country.phonecode})`,
          extraInfo: "",
        }))
      );
    };

    const setMobileMoneyOptions = () => {
      mobileMoneyProviders.length = 0;

      CurrentYellowCardNetworks.value?.forEach((network) => {
        if (network.accountNumberType == "phone") {
          mobileMoneyProviders.push({
            key: network.id,
            value: network.name || "",
            extraInfo: "",
          });
        }
      });
    };

    const setDefaults = () => {
      amount.value = Logic.Common.route?.query?.amount?.toString() || "0";
      selectedCurrency.value =
        Logic.Common.route?.query?.currency?.toString() || "USD";

      channelId.value =
        Logic.Common.route?.query?.channel_id?.toString() || "0";

      countryCode.value =
        Logic.Common.route?.query?.country_code?.toString() || "0";
    };

    onMounted(() => {
      Logic.Wallet.watchProperty(
        "CurrentYellowCardNetworks",
        CurrentYellowCardNetworks
      );
      setDefaults();
      setMobileMoneyOptions();
      setCountries();
    });

    return {
      Logic,
      formDetails,
      continueToNext,
      FormValidations,
      mobileMoneyProviders,
      loadingState,
      formComponent,
      countryPhoneCode,
      countries,
      getBottomPadding,
    };
  },
  data() {
    return {
      parentRefs: [],
    };
  },
  mounted() {
    const parentRefs: any = this.$refs;
    this.parentRefs = parentRefs;
  },
});
</script>
