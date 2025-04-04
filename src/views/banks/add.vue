<template>
  <app-wrapper>
    <subpage-layout title="New Bank Account">
      <app-form-wrapper
        ref="formComponent"
        :parent-refs="parentRefs"
        class="w-full flex flex-col justify-start px-4 h-full pt-4"
      >
        <div class="w-full flex flex-col pb-5">
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
        </div>

        <div class="w-full flex flex-col pb-5">
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
        </div>

        <div class="w-full flex flex-col pb-5">
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
        </div>

        <div class="w-full flex flex-col pb-5">
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
        </div>

        <div class="w-full flex flex-col pb-5">
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
import { defineComponent } from "vue";
import { AppButton, AppTextField, AppFormWrapper } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";

export default defineComponent({
  name: "AddBankAccountPage",
  components: {
    AppButton,
    AppTextField,
    AppFormWrapper,
  },
  setup() {
    const formDetails = reactive({
      bank_name: "",
      account_holder_name: "",
      account_number: "",
      routing_number: "",
      swift_code: "",
    });

    const loadingState = ref(false);

    const formComponent = ref<any>();

    const FormValidations = Logic.Form;

    const continueToNext = () => {
      const state = formComponent.value.validate();

      if (state) {
        Logic.Wallet.CreateSavedAccountForm = {
          unique_id: formDetails.account_number,
          type: "bank_account",
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
              message: "Bank account has been saved",
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
      formComponent,
      loadingState,
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
