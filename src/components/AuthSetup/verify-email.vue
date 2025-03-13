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
          v-model="formData.otp_code"
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

          <app-normal-text class="text-center text-primary font-semibold">
            Resend?
          </app-normal-text>
        </div>
      </div>

      <!-- Form fields -->
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import {
  AppFormWrapper,
  AppNormalText,
  AppOtpInput,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";

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

    const formData = reactive<{
      otp_code: string;
    }>({
      otp_code: "",
    });

    const handleOTPChange = () => {
      // formData.otp_code = value;
    };

    return {
      formData,
      FormValidations,
      handleOTPChange,
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
