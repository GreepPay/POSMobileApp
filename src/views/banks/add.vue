<template>
  <app-wrapper>
    <subpage-layout title="New Bank Account">
      <div
        class="w-full flex flex-col space-y-5 justify-start px-4 h-full pt-4"
      >
        <app-text-field
          :has-title="false"
          type="text"
          placeholder="Bank Name"
          ref="bankName"
          name="Bank Name"
          use-floating-label
          v-model="formDetails.bank_name"
          :rules="[FormValidations.RequiredRule]"
        >
        </app-text-field>

        <app-text-field
          :has-title="false"
          type="text"
          placeholder="Account Holder Name"
          ref="accountHolderName"
          name="Account Holder Name"
          use-floating-label
          v-model="formDetails.account_holder_name"
          :rules="[FormValidations.RequiredRule]"
        >
        </app-text-field>

        <app-text-field
          :has-title="false"
          type="tel"
          placeholder="Account Number"
          ref="accountNumber"
          name="Account Number"
          use-floating-label
          v-model="formDetails.account_number"
          :rules="[FormValidations.RequiredRule]"
        >
        </app-text-field>

        <app-text-field
          :has-title="false"
          type="tel"
          placeholder="Routing Number"
          ref="routingNumber"
          name="Routing Number"
          use-floating-label
          v-model="formDetails.routing_number"
          :rules="[FormValidations.RequiredRule]"
        >
        </app-text-field>

        <app-text-field
          :has-title="false"
          type="text"
          placeholder="Swift Code"
          ref="swiftCode"
          name="Swift Code"
          use-floating-label
          v-model="formDetails.swift_code"
          :rules="[FormValidations.RequiredRule]"
        >
        </app-text-field>
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
import { AppButton, AppTextField } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";

export default defineComponent({
  name: "AddBankAccountPage",
  components: {
    AppButton,
    AppTextField,
  },
  setup() {
    const formDetails = reactive({
      bank_name: "",
      account_holder_name: "",
      account_number: "",
      routing_number: "",
      swift_code: "",
    });

    const FormValidations = Logic.Form;

    const continueToNext = () => {
      //   modalIsOpen.value = true;
    };

    return {
      Logic,
      formDetails,
      continueToNext,
      FormValidations,
    };
  },
});
</script>
