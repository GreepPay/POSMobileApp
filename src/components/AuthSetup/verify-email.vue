<template>
  <div class="w-full flex flex-col items-center justify-start h-full space-y-6">
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col space-y-[20px] h-full"
    >
      <div
        class="w-full flex flex-col space-y-2 pt-4 justify-center items-center"
      >
        <app-normal-text custom-class="!text-center">
          Enter your OTP code here
        </app-normal-text>

        <!-- OTP input -->
        <app-otp-input
          v-model="otpCode"
          type="tel"
          :number-of-input="4"
          :should-reset-o-t-p="true"
          @change-o-t-p="handleOTPChange"
        />

        <div
          class="w-full flex flex-col pt-3 space-y-2 justify-center items-center"
        >
          <app-normal-text class="text-center !text-veryLightGray">
            Didn’t receive any code?
          </app-normal-text>

          <app-normal-text
            class="text-center text-primary font-semibold"
            @click="resentVerifyEmail"
          >
            Resend?
          </app-normal-text>
        </div>
      </div>

      <!-- Form fields -->
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppFormWrapper,
  AppNormalText,
  AppOtpInput,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { ref } from "vue";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppNormalText,
    AppOtpInput,
  },
  props: {},
  name: "AuthSetupVerifyEmail",
  setup() {
    const FormValidations = Logic.Form;

    const otpCode = ref("");

    const handleOTPChange = () => {
      // formData.otp_code = value;
    };

    const resentVerifyEmail = () => {
      Logic.Auth.ResendEmailOTP(localStorage.getItem("auth_email") || "");
      Logic.Common.showAlert({
        show: true,
        message:
          "A new verification email has been sent to your email address.",
        type: "success",
      });
    };

    const continueWithForm = () => {
      if (otpCode.value.toString().length == 4) {
        return otpCode.value.toString();
      } else {
        return;
      }
    };

    return {
      otpCode,
      FormValidations,
      handleOTPChange,
      resentVerifyEmail,
      continueWithForm,
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
