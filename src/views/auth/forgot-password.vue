<template>
  <app-wrapper>
    <subpage-layout title="Forgot password">
      <!-- Form -->
      <app-form-wrapper
        ref="formComponent"
        :parent-refs="parentRefs"
        class="w-full px-4 mt-2"
      >
        <app-info-box>
          <app-normal-text custom-class="!leading-5">
            Don't worry,
            <span class="font-semibold"> Enter your account email </span> for
            password reset instructions
          </app-normal-text>
        </app-info-box>

        <app-text-field
          :has-title="true"
          v-model="formData.email"
          type="text"
          placeholder="Enter email address"
          ref="emailRef"
          name="Email"
          class="mb-4 mt-4"
          use-floating-label
          :rules="[FormValidations.RequiredRule, FormValidations.EmailRule]"
        />

        <!-- Button -->
        <div class="w-full flex flex-col items-center justify-center pt-3">
          <app-button
            variant="secondary"
            class="w-full py-4"
            :loading="loadingState"
            @click.prevent="handleForgotPassword"
          >
            Reset Password
          </app-button>
        </div>
      </app-form-wrapper>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  AppFormWrapper,
  AppNormalText,
  AppInfoBox,
  AppTextField,
  AppButton,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";

export default defineComponent({
  name: "ForgotPasswordPage",
  components: {
    AppFormWrapper,
    AppTextField,
    AppNormalText,
    AppInfoBox,
    AppButton,
  },
  setup() {
    const FormValidations = Logic.Form;
    const formComponent = ref<any>(null);
    const loadingState = ref(false);
    const formData = reactive({
      email: "",
    });

    const handleForgotPassword = async () => {
      const state = formComponent.value?.validate();

      if (state) {
        loadingState.value = true;

        try {
          // First send OTP to email
          localStorage.setItem("auth_email", formData.email);
          await Logic.Auth.sendResetPasswordOTP({
            email: String(formData.email),
          });

          // Navigate to OTP verification
          Logic.Common.GoToRoute("/auth/password-reset");
        } catch (error) {
          Logic.Common.showAlert({
            show: true,
            type: "error",
            message: "Failed to send reset code. Please try again.",
          });
        } finally {
          loadingState.value = false;
        }
      }
    };

    return {
      FormValidations,
      Logic,
      formData,
      formComponent,
      loadingState,
      handleForgotPassword,
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
