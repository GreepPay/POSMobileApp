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

        <div class="w-full flex flex-col pb-4">
          <app-text-field
            :has-title="false"
            type="tel"
            placeholder="Mobile Number"
            ref="mobileNumber"
            name="Mobile Number"
            use-floating-label
            v-model="formDetails.mobile_number"
            :rules="[FormValidations.RequiredRule]"
          >
          </app-text-field>
        </div>

        <div class="w-full grid grid-cols-1 gap-3 pt-3">
          <app-select
            :placeholder="'Select Provider'"
            :hasTitle="false"
            :paddings="'py-4 !px-4'"
            :options="mobileMoneyProviders"
            ref="provider"
            use-floating-label
            v-model="formDetails.provider"
          >
          </app-select>
        </div>
      </app-form-wrapper>

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
            :loading="loadingState"
            >Save & Continue</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  AppButton,
  AppTextField,
  AppSelect,
  AppFormWrapper,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { SelectOption } from "@greep/ui-components/src/types";

export default defineComponent({
  name: "AddMobileMoneyPage",
  components: {
    AppButton,
    AppTextField,
    AppSelect,
    AppFormWrapper,
  },
  setup() {
    const formDetails = reactive({
      first_name: "",
      last_name: "",
      mobile_number: "",
      provider: "",
    });

    const FormValidations = Logic.Form;

    const loadingState = ref(false);

    const formComponent = ref<any>();

    const mobileMoneyProviders = reactive<SelectOption[]>([
      {
        key: "mtn",
        value: "MTN",
      },
      {
        key: "airtel",
        value: "AIRTEL",
      },
      {
        key: "vodacom",
        value: "VODAFONE",
      },
      {
        key: "tigo",
        value: "TIGO",
      },
      {
        key: "orange",
        value: "ORANGE",
      },
    ]);

    const continueToNext = () => {
      const state = formComponent.value.validate();

      if (state) {
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

    return {
      Logic,
      formDetails,
      continueToNext,
      FormValidations,
      mobileMoneyProviders,
      loadingState,
      formComponent,
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
