<template>
  <app-wrapper>
    <subpage-layout title="New Mobile Money">
      <div
        class="w-full flex flex-col space-y-5 justify-start px-4 h-full pt-4"
      >
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

        <div class="w-full grid grid-cols-1 gap-3">
          <app-select
            :placeholder="'Select Provider'"
            :hasTitle="false"
            :paddings="'py-4 !px-3'"
            :options="mobileMoneyProviders"
            ref="provider"
            use-floating-label
            v-model="formDetails.provider"
          >
          </app-select>
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
            >Save & Continue</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppButton, AppTextField, AppSelect } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { SelectOption } from "@greep/ui-components/src/types";

export default defineComponent({
  name: "AddMobileMoneyPage",
  components: {
    AppButton,
    AppTextField,
    AppSelect,
  },
  setup() {
    const formDetails = reactive({
      first_name: "",
      last_name: "",
      mobile_number: "",
      provider: "",
    });

    const FormValidations = Logic.Form;

    const mobileMoneyProviders = reactive<SelectOption[]>([
      {
        key: "MTN",
        value: "MTN",
      },
      {
        key: "AIRTEL",
        value: "AIRTEL",
      },
      {
        key: "VODAFONE",
        value: "VODAFONE",
      },
      {
        key: "TIGO",
        value: "TIGO",
      },
      {
        key: "ORANGE",
        value: "ORANGE",
      },
    ]);

    const continueToNext = () => {
      //   modalIsOpen.value = true;
    };

    return {
      Logic,
      formDetails,
      continueToNext,
      FormValidations,
      mobileMoneyProviders,
    };
  },
});
</script>
