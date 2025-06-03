<template>
  <app-wrapper>
    <subpage-layout title="Sign In">
      <div
        class="w-full flex flex-col items-center justify-start h-full space-y-3 px-4 pt-6"
      >
        <SSO from-action="signIn" />

        <!-- Form -->
        <app-form-wrapper
          ref="formComponent"
          :parent-refs="parentRefs"
          class="w-full flex flex-col pt-2"
        >
          <div class="w-full flex flex-col pb-5">
            <app-text-field
              :has-title="false"
              type="email"
              placeholder="Enter Address"
              ref="email"
              name="Email address"
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
              ref="email"
              name="Password"
              use-floating-label
              v-model="formData.password"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>
          </div>
        </app-form-wrapper>
      </div>

      <!-- Bottom section -->
      <div
        class="w-full flex flex-col px-4 fixed z-50 bottom-0 left-0 pt-4 bg-white"
        style="padding-bottom: calc(env(safe-area-inset-bottom) + 16px)"
      >
        <app-button
          variant="secondary"
          class="!py-4 col-span-4"
          @click="handleNext"
          :loading="loadingState"
        >
          Login
        </app-button>

        <app-normal-text
          class="pt-3 !text-center !text-[#999999]"
          @click="Logic.Common.GoToRoute('/auth/signup')"
        >
          Don’t have an account?
          <span class="font-[500] !text-primary">Sign Up</span>
        </app-normal-text>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppFormWrapper,
  AppTextField,
  AppButton,
  AppNormalText,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import SSO from "../../components/Auth/SSO.vue";

export default defineComponent({
  name: "LoginPage",
  components: {
    AppFormWrapper,
    AppTextField,
    AppButton,
    SSO,
    AppNormalText,
  },
  setup() {
    const FormValidations = Logic.Form;

    const loadingState = ref(false);

    const formComponent = ref<any>();

    const formData = reactive({
      email: "",
      password: "",
    });

    const handleNext = async () => {
      const state = formComponent.value?.validate();

      if (state) {
        loadingState.value = true;
        Logic.Auth.SignInForm = {
          email: formData.email,
          password: formData.password,
        };

        try {
          await Logic.Auth.SignIn(true);
          await Logic.Auth.GetAuthUser();
          loadingState.value = false;
          // Check if passcode has been set
          if (localStorage.getItem("auth_passcode")) {
            Logic.Common.GoToRoute("/");
          } else {
            // Save auth email and pass
            localStorage.setItem(
              "auth_email",
              Logic.Auth.SignInForm?.email || ""
            );
            localStorage.setItem(
              "auth_pass",
              Logic.Auth.SignInForm?.password || ""
            );
            Logic.Common.GoToRoute("/auth/set-passcode");
          }
        } catch {
          loadingState.value = false;
        }
      }
    };

    return {
      FormValidations,
      Logic,
      formData,
      handleNext,
      formComponent,
      loadingState,
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
