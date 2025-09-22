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
          ref="otpInputRef"
          v-model="otpCode"
          :should-reset-o-t-p="shouldReset"
          type="tel"
          :number-of-input="numberOfInput"
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
              @expired="handleOtpExpired"
            />
          </app-normal-text>
        </div>
      </div>
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
  import { Logic } from "@greep/logic"
  import { defineComponent, watch, ref, nextTick } from "vue"
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
    setup(_, { emit, expose }) {
      const FormValidations = Logic.Form
      const numberOfInput = 4
      const otpCode = ref("")
      const shouldReset = ref(false)
      const canResend = ref(false)
      const countdownDuration = ref(60)
      const otpInputRef = ref<any>(null)
      
      const resetOtp = async () => {
        // Toggle the shouldReset prop to trigger the built-in reset
        shouldReset.value = true
        otpCode.value = ""
        
        // Wait for the reset to complete and DOM to update
        await nextTick()
        
        // Focus the first input field using the OTP component's method
        if (otpInputRef.value && typeof otpInputRef.value.focusInputByRef === 'function') {
          // Get the uniqueKey from the OTP component and focus the first input (index 0)
          const firstInputId = otpInputRef.value.uniqueKey + "0"
          otpInputRef.value.focusInputByRef(firstInputId)
        }
        
        // Reset the flag after a short delay so it can be used again
        setTimeout(() => {
          shouldReset.value = false
        }, 100)
      }
      
      const handleOtpExpired = () => {
        canResend.value = true
        resetOtp()
      }

      const handleCompleteOtp = () => emit("filled", otpCode.value)
      
      const handleOTPChange = () => {
        /* formData.otp_code = value */
      }

      const resentVerifyEmail = () => {
        canResend.value = false
        countdownDuration.value = 60
        const email = localStorage.getItem("auth_email") || ""
        if (email) {
          Logic.Auth.ResendEmailOTP(email)
          Logic.Common.showAlert({
            show: true,
            message: "A new verification email has been sent to your email address.",
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

      // Watch for OTP changes to emit when complete
      watch(otpCode, (newVal) => {
        if (newVal.length === numberOfInput) {
          handleCompleteOtp()
        }
      })

      // Expose methods to parent
      expose({
        resetOtp,
        continueWithForm
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
        handleOtpExpired,
        resetOtp,
        shouldReset,
        otpInputRef,
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