<template>
  <app-wrapper>
    <subpage-layout title="Verify Email">
      <div class="w-full flex flex-col items-center justify-center h-full px-4">
        <auth-setup-verify-email ref="componentRef" class="-mt-[10%]" />

        <!-- Bottom section -->
        <div class="w-full flex flex-col px-4 pt-4">
          <app-button
            variant="secondary"
            class="!py-4 col-span-4"
            @click="handleNext"
            :loading="buttonIsLoading"
          >
            Continue
          </app-button>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { AppButton } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import AuthSetupVerifyEmail from "../../components/AuthSetup/verify-email.vue";
import {
  MutationSignInArgs,
  MutationVerifyUserOtpArgs,
} from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "VerifyEmailPage",
  components: {
    AuthSetupVerifyEmail,
    AppButton,
  },
  setup() {
    const FormValidations = Logic.Form;

    const componentRef = ref();

    const buttonIsLoading = ref(false);

    const handleNext = async () => {
      if (buttonIsLoading.value) return;

      const otp = componentRef.value?.continueWithForm() as string;

      const form: MutationVerifyUserOtpArgs = {
        otp,
        user_uuid: Logic.Auth.AuthUser?.uuid,
      };

      Logic.Auth.VerifyUserOTPForm = form;

      buttonIsLoading.value = true;

      try {
        await Logic.Auth.VerifyUserOTP();
        const formSignIn: MutationSignInArgs = {
          email: localStorage.getItem("auth_email") || "",
          password: localStorage.getItem("auth_pass") || "",
        };
        Logic.Auth.SignInForm = formSignIn;
        await Logic.Auth.SignIn(true);

        Logic.Common.GoToRoute("/auth/setup-account");
      } catch {
        //
      } finally {
        buttonIsLoading.value = false;
      }
    };

    return {
      FormValidations,
      componentRef,
      Logic,
      handleNext,
      buttonIsLoading,
    };
  },
});
</script>
