<template>
  <app-wrapper>
    <auth-layout>
      <template #top-action>
        <app-button
          class="bg-white !text-primary border-[1px] border-primary !py-1 rounded-[5px]"
          @click="Logic.Common.GoToRoute('/auth/signup')"
          >Sign Up</app-button
        >
      </template>
      <div class="w-full flex flex-col items-center justify-start h-full space-y-6">
        <!-- Headers -->
        <div class="w-full flex flex-col items-start justify-start space-y-1">
          <app-header-text> Welcome! </app-header-text>
          <app-normal-text class="!text-gray-500">
            Login to your account
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
          <app-text-field
            :has-title="true"
            type="password"
            placeholder="Enter your password"
            ref="passwordRef"
            name="Password"
            :rules="[FormValidations.RequiredRule]"
          >
            <template #title> Password </template>
            <template #inner-prefix>
              <span class="pr-1">
                <app-icon name="password" custom-class="h-[16px]" />
              </span>
            </template>
          </app-text-field>

          <!-- Forgot Password -->
          <div class="w-full flex flex-row items-center justify-end">
            <app-normal-text
              class="text-primary underline cursor-pointer"
              @click="Logic.Common.GoToRoute('/auth/forgot-password')"
            >
              Forgot Password?
            </app-normal-text>
          </div>

          <!-- Button -->
          <div class="w-full flex flex-col items-center justify-center pt-5">
            <app-button @click.prevent="Logic.Common.GoToRoute('/')" class="w-full py-3">
              Login
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
  name: "LoginPage",
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
