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
          We sent a code to your email
        </app-normal-text>

        <!-- OTP input -->
        <app-otp-input
          v-model="otpCode"
          type="tel"
          :number-of-input="numberOfInput"
          :should-reset-o-t-p="true"
          :onChangeOTP="handleOTPChange"
        />

        <div
          class="w-full flex flex-col pt-3 space-y-2 justify-center items-center "
        >
          <app-normal-text class="text-center !text-veryLightGray">
            Didn't receive any code?
            <span
              v-if="canResend"
              class="text-primary font-semibold cursor-pointer"
              @click="resentVerifyEmail"
            >
              Resend
            </span>
            <app-countdown-timer
              v-else
              :duration="countdownDuration"
             custom-class="!bg-transparent"
              custom-text="Resend code in"
              @expired="canResend = true"
            />
          </app-normal-text>
        </div>
      </div>
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
  import { Logic } from "@greep/logic"
  import { defineComponent, watch, ref } from "vue"
  import {
    AppFormWrapper,
    AppNormalText,
    AppCountdownTimer,
    AppOtpInput,
  } from "@greep/ui-components"

  export default defineComponent({
    components: {
      AppFormWrapper,
      AppNormalText,
       AppCountdownTimer,
      AppOtpInput,
    },
    name: "AuthSetupVerifyEmail",
    emits: ["filled"],
    setup(_, { emit }) {
      const FormValidations = Logic.Form
      const numberOfInput = 4
      const otpCode = ref("")
      const canResend = ref(false) // Controls when resend is available
      const countdownDuration = ref(60) // 60 seconds countdown

      const handleCompleteOtp = () => emit("filled", otpCode.value)
      const handleOTPChange = () => {
        /* formData.otp_code = value */
      }

      const resentVerifyEmail = () => {
         canResend.value = false; // Reset the resend flag
         countdownDuration.value = 60; // Reset the timer duration
        const email = localStorage.getItem("auth_email") || ""
        if (email) {
          Logic.Auth.ResendEmailOTP(email)
          Logic.Common.showAlert({
            show: true,
            message:
              "A new verification email has been sent to your email address.",
            type: "success",
          })
        } else {
          Logic.Common.showAlert({
            show: true,
            message: "Can't find email",
            type: "error",
          })

          Logic.Common.GoToRoute("/auth/signup")
        }
      }

      const continueWithForm = () => {
        if (otpCode.value.toString().length == 4) {
          return otpCode.value.toString()
        } else return
      }

      watch(otpCode, (newVal) => {
        if (newVal.length === numberOfInput) handleCompleteOtp()
      })

      return {
        otpCode,
        numberOfInput,
        FormValidations,
        handleOTPChange,
        resentVerifyEmail,
        continueWithForm,
         canResend,
      countdownDuration,
      }
    },
    data() {
      return {
        parentRefs: [],
      }
    },
    mounted() {
      const parentRefs: any = this.$refs
      this.parentRefs = parentRefs
      this.canResend = false
    },
  })
</script>
