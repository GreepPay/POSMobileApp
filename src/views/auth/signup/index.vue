<template>
  <app-wrapper>
    <subpage-layout title="Create Account">
      <div
        class="w-full flex flex-col items-center justify-start h-full space-y-3 px-4 pt-4"
      >
        <SSO from-action="signUp" />

        <app-form-wrapper
          :parent-refs="parentRefs"
          ref="formComp"
          class="w-full flex flex-col"
        >
          <div class="w-full flex flex-col pb-5">
            <app-text-field
              :has-title="false"
              type="email"
              placeholder="Email Address"
              ref="emailAddress"
              name="Email Address"
              use-floating-label
              v-model="formData.email"
              :rules="[FormValidations.RequiredRule, FormValidations.EmailRule]"
            >
            </app-text-field>
          </div>

          <div class="w-full flex flex-col pb-5">
            <app-text-field
              :has-title="false"
              type="password"
              placeholder="Password"
              ref="password"
              name="Password"
              use-floating-label
              v-model="formData.password"
              :rules="[
                FormValidations.RequiredRule,
                FormValidations.PasswordRule,
              ]"
            >
            </app-text-field>
          </div>

          <div class="w-full flex flex-col pb-5">
            <app-text-field
              :has-title="false"
              type="password"
              placeholder="Confirm Password"
              ref="confirmPassword"
              name="Confirm Password"
              use-floating-label
              v-model="formData.confirm_password"
              :rules="[
                FormValidations.RequiredRule,
                FormValidations.handleConfirmPassword(
                  formData.password,
                  formData.confirm_password
                ),
              ]"
            >
            </app-text-field>
          </div>

          <!-- Info box -->
          <app-info-box>
            <app-normal-text>
              By creating an account, you agree to our
              <span class="font-[500] !text-primary">Terms & Conditions </span>
              & <span class="font-[500] !text-primary">Privacy Policy </span>
            </app-normal-text>
          </app-info-box>
        </app-form-wrapper>

        <div class="w-full flex flex-col pt-3">
          <div class="w-full flex flex-col">
            <app-button variant="secondary" class="!py-4"> Sign Up </app-button>
          </div>

          <app-normal-text
            class="pt-3 !text-center !text-[#999999]"
            @click="Logic.Common.GoToRoute('/auth/login')"
          >
            Have an account?
            <span class="font-[500] !text-primary">Login</span>
          </app-normal-text>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppFormWrapper,
  AppTextField,
  AppInfoBox,
  AppButton,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import SSO from "../../../components/Auth/SSO.vue";
import { reactive } from "vue";
import { ref } from "vue";

export default defineComponent({
  name: "SignupPage",
  components: {
    AppTextField,
    AppFormWrapper,
    SSO,
    AppInfoBox,
    AppButton,
  },
  setup() {
    const formData = reactive({
      email: "",
      password: "",
      confirm_password: "",
    });

    const formComp = ref();

    const FormValidations = Logic.Form;

    return {
      FormValidations,
      Logic,
      formData,
      formComp,
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
