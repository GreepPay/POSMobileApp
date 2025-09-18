<template>
  <app-wrapper>
    <subpage-layout title="New Password">
      <app-form-wrapper
        ref="formComponent"
        :parent-refs="parentRefs"
        class="w-full flex flex-col pt-2"
      >
        <app-normal-text custom-class="!text-center !text-gray-600 !mb-2">
          Please enter your new password below.
        </app-normal-text>

        <div class="w-full flex flex-col pt-2 px-4">
          <div class="w-full flex flex-col pb-3">
            <app-text-field
              v-model="formData.password"
              :has-title="true"
              type="password"
              placeholder="Enter new password"
              ref="passwordRef"
              name="Password"
              use-floating-label
              :rules="[FormValidations.RequiredRule, FormValidations.PasswordRule]"
              custom-class="!border-gray-300 focus:!border-primary"
            />
          </div>
          <div class="w-full flex flex-col">
            <app-text-field
              v-model="formData.confirm_password"
              :has-title="true"
              type="password"
              placeholder="Enter new password again"
              ref="confirm_password"
              name="Confirm Password"
              use-floating-label
              :rules="[
                FormValidations.RequiredRule,
                FormValidations.handleConfirmPassword(
                  formData.password,
                  formData.confirm_password
                ),
              ]"
              custom-class="!border-gray-300 focus:!border-primary"
            />
          </div>
        </div>

        <!-- Button -->
        <div class="w-full pt-5 px-4">
          <app-button
            variant="secondary"
            class="w-full py-4"
            @click.prevent="handlePassword"
          >
            Create Password
          </app-button>
        </div>
      </app-form-wrapper>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  AppNormalText,
  AppFormWrapper,
  AppTextField,
  AppButton,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";

export default defineComponent({
  name: "NewPassWordpageMain",
  components: {
    AppNormalText,
    AppFormWrapper,
    AppTextField,
    AppButton,
  },
  setup() {
    const FormValidations = Logic.Form;
    const loadingState = ref(false);
    const formComponent = ref<any>(null);
    const formData = reactive({
      password: "",
      confirm_password: "",
    });

    const handlePassword = async () => {
      const isValid = formComponent.value?.validate();

      if (isValid) {
        try {
          const otp = localStorage.getItem("code");
          const uuid = localStorage.getItem("reset_password_uuid");

          if (!otp) {
            Logic.Common.showAlert({
              show: true,
              message: "OTP not found. Please request a new one.",
              type: "error",
            });
            return;
          }

          loadingState.value = true;

          // Send the reset password request
          await Logic.Auth.ResetPassword({
            new_password: formData.password,
            otp_code: otp,
            user_uuid: uuid || "",
          });

          // Clear the OTP from local storage
          localStorage.removeItem("code");
          localStorage.removeItem("reset_password_uuid");

          Logic.Common.showAlert({
            show: true,
            message: "Password reset successfully!",
            type: "success",
          });

          // Redirect to login or success page
          Logic.Common.GoToRoute("/auth/login"); // or your desired route
        } catch (error) {
          Logic.Common.showAlert({
            show: true,
            message: "Failed to reset password. Please try again.",
            type: "error",
          });
        } finally {
          Logic.Common.hideLoader();
        }
      }
    };

    return {
      FormValidations,
      Logic,
      formData,
      formComponent,
      handlePassword,
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
