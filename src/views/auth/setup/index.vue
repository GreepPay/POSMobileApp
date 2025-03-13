<template>
  <app-wrapper>
    <app-onboarding-layout v-model="currentPage" :page-setting="pageSettings">
      <div
        class="w-full flex flex-col items-center justify-start h-full space-y-6 px-4 py-4"
      >
        <template v-if="currentPage == 'account_info'">
          <auth-setup-account-info />
        </template>

        <template v-if="currentPage == 'verify_account'">
          <auth-setup-verify-account />
        </template>

        <template v-if="currentPage == 'pick_currency'">
          <auth-setup-pick-currency />
        </template>

        <template v-if="currentPage == 'verify_email'">
          <auth-setup-verify-email />
        </template>

        <!-- Spacer -->
        <div class="!h-[100px] py-5 w-full"></div>
      </div>
    </app-onboarding-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { AppOnboardingLayout } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import AuthSetupAccountInfo from "../../../components/AuthSetup/account-info.vue";
import AuthSetupVerifyAccount from "../../../components/AuthSetup/verify-account.vue";
import AuthSetupPickCurrency from "../../../components/AuthSetup/pick-currency.vue";
import AuthSetupVerifyEmail from "../../../components/AuthSetup/verify-email.vue";

export default defineComponent({
  name: "SetupAccountIndex",
  components: {
    AuthSetupAccountInfo,
    AuthSetupVerifyAccount,
    AuthSetupPickCurrency,
    AuthSetupVerifyEmail,
    AppOnboardingLayout,
  },
  setup() {
    const FormValidations = Logic.Form;

    const currentPage = ref("account_info");

    const pageSettings = reactive({
      main_title: "Setup POS",
      pages: [
        {
          title: "Account Info",
          key: "account_info",
          action_btn: {
            label: "Next",
            handler: () => {
              currentPage.value = "verify_account";
            },
            is_disabled: false,
          },
        },
        {
          title: "Verify Account",
          key: "verify_account",
          action_btn: {
            label: "Next",
            handler: () => {
              currentPage.value = "pick_currency";
            },
            is_disabled: false,
          },
        },
        {
          title: "Pick Currency",
          key: "pick_currency",
          action_btn: {
            label: "Next",
            handler: () => {
              currentPage.value = "verify_email";
            },
            is_disabled: false,
          },
        },
        {
          title: "Verify Email",
          key: "verify_email",
          action_btn: {
            label: "Next",
            handler: () => {
              console.log("Next");
            },
            is_disabled: false,
          },
        },
      ],
    });

    return {
      FormValidations,
      Logic,
      currentPage,
      pageSettings,
    };
  },
  data() {
    return {
      parentRefs: null,
    };
  },
  mounted() {
    const parentRefs: any = this.$refs;
    this.parentRefs = parentRefs;
  },
});
</script>
