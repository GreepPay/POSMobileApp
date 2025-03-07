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
          <app-header-text> Set up your account </app-header-text>
          <app-normal-text class="!text-gray-500">
            Create an account to get started
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
            type="text"
            placeholder="Enter your business name"
            ref="businessNameRef"
            name="Business name"
            :rules="[FormValidations.RequiredRule]"
          >
            <template #title> Business name </template>
            <template #inner-prefix>
              <span class="pr-1">
                <app-icon name="shop" custom-class="h-[15px]" />
              </span>
            </template>
          </app-text-field>

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
            placeholder="Set your password"
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

          <!-- Button -->
          <div class="w-full flex flex-col items-center justify-center pt-5">
            <app-button @click.prevent="null" class="w-full py-3"> Sign Up </app-button>
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
  name: "SignupPage",
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
