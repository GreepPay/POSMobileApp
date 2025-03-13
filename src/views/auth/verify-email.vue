<template>
  <app-wrapper>
    <subpage-layout title="Verify Email">
      <div
        class="w-full flex flex-col items-center justify-start h-full space-y-6 px-4"
      >
        <auth-setup-verify-email />
      </div>

      <!-- Bottom section -->
      <div
        class="w-full flex flex-col px-4 fixed z-50 bottom-0 left-0 pt-4 bg-white"
        style="padding-bottom: calc(env(safe-area-inset-bottom) + 16px)"
      >
        <app-button
          variant="secondary"
          class="!py-4 col-span-4"
          @click="handleNext"
        >
          Next
        </app-button>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppButton } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import AuthSetupVerifyEmail from "../../components/AuthSetup/verify-email.vue";

export default defineComponent({
  name: "VerifyEmailPage",
  components: {
    AuthSetupVerifyEmail,
    AppButton,
  },
  setup() {
    const FormValidations = Logic.Form;

    const handleNext = () => {
      Logic.Common.GoToRoute("/auth/welcome");
    };

    return {
      FormValidations,
      Logic,
      handleNext,
    };
  },
});
</script>
