<template>
  <app-wrapper>
    <app-onboarding-layout v-model="currentPage" :page-setting="pageSettings">
      <div
        class="w-full flex flex-col items-center justify-start h-full space-y-6 px-4 py-4"
      >
        <auth-setup-account-info />

        <!-- Spacer -->
        <div class="h-16"></div>
      </div>
    </app-onboarding-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { AppOnboardingLayout } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import AuthSetupAccountInfo from "../../../components/AuthSetup/account-info.vue";

export default defineComponent({
  name: "SetupAccountIndex",
  components: {
    AuthSetupAccountInfo,
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
              console.log("Next");
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
