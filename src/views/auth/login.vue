<template>
  <app-wrapper>
    <subpage-layout title="Enter Your Account">
      <div class="w-full flex flex-col items-center justify-center h-full px-4">
        <!-- <sso-auth-button /> -->
        <s-s-o-auth-button from-action="signIn" />

        <!-- Form -->
        <app-form-wrapper
          ref="formComponent"
          :parent-refs="parentRefs"
          class="w-full flex flex-col pt-2 mt-4"
        >
          <app-text-field
            :has-title="true"
            v-model="formData.email"
            type="email"
            placeholder="Enter your email"
            ref="emailRef"
            name="Email"
            class="mb-3"
            use-floating-label
            :rules="[FormValidations.RequiredRule]"
          >
          </app-text-field>

          <app-text-field
            :has-title="true"
            v-model="formData.password"
            type="password"
            placeholder="Set your password"
            ref="passwordRef"
            name="Password"
            class="mb-3"
            use-floating-label
            :rules="[FormValidations.RequiredRule]"
          >
          </app-text-field>

          <!-- Button -->
          <div class="w-full flex flex-col items-center justify-center pt-5">
            <app-button
              variant="secondary"
              class="w-full py-4"
              :loading="loadingState"
              @click.prevent="handleSignIn"
            >
              Login
            </app-button>
          </div>

          <!-- Button -->
          <div class="w-full flex flex-col items-center justify-center pt-5">
            <app-button
              variant="secondary"
              outlined
              customClass="!py-4 !w-full !border  !border-green-800  "
              @click.prevent="Logic.Common.GoToRoute('/auth/forgot-password')"
            >
              Forgot Password?
            </app-button>
          </div>

          <div class="pt-4 !text-center w-full mb-3">
            <app-normal-text class="text-gray-two">
              Don't have an account?
              <span
                class="text-green font-semibold"
                @click="Logic.Common.GoToRoute('/auth/signup')"
              >
                Sign Up
              </span>
            </app-normal-text>
          </div>
        </app-form-wrapper>
      </div>
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
import { SSOAuthButton } from "../../components/Auth";
import { Logic } from "@greep/logic";
import { handleAuthResponse } from "../../composable/auth";

export default defineComponent({
  name: "LoginPage",
  components: {
    AppNormalText,
    AppFormWrapper,
    AppTextField,
    AppButton,
    SSOAuthButton,
  },
  setup() {
    const FormValidations = Logic.Form;
    const loadingState = ref(false);
    const formComponent = ref<any>(null);
    const formData = reactive({
      email: "",
      password: "",
    });

    const handleSignIn = async () => {
      const state = formComponent.value?.validate();

      if (state) {
        loadingState.value = true;
        Logic.Auth.SignInForm = {
          email: formData.email,
          password: formData.password,
        };

        try {
          localStorage.clear();
          Logic.Auth.AccessToken = "";
          await Logic.Auth.SignIn(true);
          await Logic.Auth.GetAuthUser();

          handleAuthResponse(formData);
        } finally {
          loadingState.value = false;
        }
      } else {
        return;
      }
    };

    return {
      FormValidations,
      Logic,
      formComponent,
      formData,
      loadingState,
      handleSignIn,
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
