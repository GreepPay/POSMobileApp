<template>
  <app-wrapper>
    <subpage-layout title="Password Reset ">
      <div
        class="w-full flex flex-col items-center justify-start h-full space-y-6 px-4"
      >
        <auth-verify-email
          @verified="isEmailVerified = $event"
          ref="verifyEmailRef"
          @filled="handleFormFilled"
        />
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import {  } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { AuthVerifyEmail } from "../../components/AuthSetup";

export default defineComponent({
  name: "ResetPasswordPage",
  components: {
    AuthVerifyEmail,
  },
  setup() {
    const otpCode = ref("");
    const loadingState = ref(false);
    const isEmailVerified = ref(false);
    const verifyEmailRef = ref<any>(null);
    const uuid = localStorage.getItem("reset_password_uuid");
    
    const resetOtp = () => {
      otpCode.value = ""; 
      if (verifyEmailRef.value && typeof verifyEmailRef.value.resetOtp === 'function') {
        verifyEmailRef.value.resetOtp();
      }
    };

    const handleFormFilled = (code: string) => {
      otpCode.value = code;
      localStorage.setItem("code", otpCode.value);
      handleApiCall();
    };

    const handleNext = () => {
      otpCode.value = verifyEmailRef.value?.continueWithForm();
      handleApiCall();
    };

    const handleApiCall = async () => {
      loadingState.value = true;
      Logic.Common.showLoader({
        show: true,
        loading: true,
      });

      try {
        Logic.Auth.VerifyUserOTPForm = {
          user_uuid: String(uuid || ""),
          otp: String(otpCode.value),
        };

        const isVerified = await Logic.Auth.VerifyUserOTP();

        if (isVerified) {
          // Only navigate if verification was successful
          loadingState.value = false;
           resetOtp();
          Logic.Common.GoToRoute("/auth/new-password");
        } else {
          loadingState.value = false;
           resetOtp();
          // Handle failed verification (even if no error was thrown)
          Logic.Common.showAlert({
            show: true,
            message: "Verification Failed",
            type: "error",
          });
        }
      } catch (error) {
        loadingState.value = false;
         resetOtp();
        // The error is already handled in the VerifyUserOTP method
        // No need to show it again here unless you want different handling
        console.error("Verification process error:", error);
      }finally {
        Logic.Common.hideLoader();
      }
    };

    return {
      loadingState,
      Logic,
      isEmailVerified,
      verifyEmailRef,
      handleNext,
      handleFormFilled,
       resetOtp,
    };
  },
});
</script>
