<template>
  <app-wrapper>
    <auth-layout>
      <template #top-action>
        <app-button
          class="bg-white !text-primary border-[1px] border-primary !py-1 rounded-[5px]"
          @click="Logic.Common.GoToRoute('/auth/login')"
          >Sign In</app-button
        >
      </template>
      <div class="w-full flex flex-col items-center justify-start h-full space-y-6">
        <!-- Headers -->
        <div class="w-full flex flex-col items-start justify-start space-y-1">
          <app-header-text> Forgot Password </app-header-text>
          <app-normal-text class="!text-gray-500">
            Enter your email to reset your password
          </app-normal-text>
        </div>

        <!-- Form -->
        <app-form-wrapper
          ref="formComponent"
          :parent-refs="parentRefs"
          class="w-full flex flex-col space-y-3 pt-2"
        >
          <app-text-field
            :has-title="true"
            type="email"
            placeholder="Enter your email"
            ref="emailRef"
            name="Email"
            :rules="[FormValidations.RequiredRule]"
          >
            <template #title> Email </template>
            <template #inner-prefix>
              <span class="pr-1">
                <app-icon name="email" custom-class="h-[13px]" />
              </span>
            </template>
          </app-text-field>

          <!-- Button -->
          <div class="w-full flex flex-col items-center justify-center pt-5">
            <app-button @click.prevent="null" class="w-full py-3">
              Reset Password
            </app-button>
          </div>
        </app-form-wrapper>
      </div>
    </auth-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppHeaderText,
  AppNormalText,
  AppFormWrapper,
  AppTextField,
  AppButton,
  AppIcon,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";

export default defineComponent({
  name: "ForgotPasswordPage",
  components: {
    AppHeaderText,
    AppNormalText,
    AppFormWrapper,
    AppTextField,
    AppButton,
    AppIcon,
  },
  setup() {
    const FormValidations = Logic.Form;

    return {
      FormValidations,
      Logic,
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
