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
              usePermanentFloatingLabel
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
              usePermanentFloatingLabel
              v-model="formData.password"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>
          </div>
        </app-form-wrapper>

        <!-- Bottom section -->
        <div class="w-full flex flex-col pt-0 bg-white">
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
import { User } from "@greep/logic/src/gql/graphql";

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

          const authUser: User = Logic.Auth.AuthUser;

          // Check if user has a profile set
          if (!authUser?.email_verified_at) {
            Logic.Auth.ResendEmailOTP(
              Logic.Auth.AuthUser?.email || localStorage.getItem("auth_email")
            );
            // Save auth email and pass
            localStorage.setItem(
              "auth_email",
              Logic.Auth.SignInForm?.email || ""
            );
            localStorage.setItem(
              "auth_pass",
              Logic.Auth.SignInForm?.password || ""
            );
            Logic.Common.GoToRoute("/auth/verify-email");
            return;
          }

          // Check if user has a profile set
          if (!Logic.Auth.AuthUser?.first_name) {
            // Save auth email and pass
            localStorage.setItem(
              "auth_email",
              Logic.Auth.SignInForm?.email || ""
            );
            localStorage.setItem(
              "auth_pass",
              Logic.Auth.SignInForm?.password || ""
            );
            Logic.Common.GoToRoute("/auth/setup-account");
            return;
          }

          if (authUser.businesses?.length == 0) {
            // Save auth email and pass
            localStorage.setItem(
              "auth_email",
              Logic.Auth.SignInForm?.email || ""
            );
            localStorage.setItem(
              "auth_pass",
              Logic.Auth.SignInForm?.password || ""
            );
            Logic.Common.GoToRoute(`/auth/setup`);
            return;
          } else {
            const businesses = authUser.businesses;
            if (
              businesses &&
              businesses.some((business) => business.wallet === null)
            ) {
              const businessWithoutWallet = businesses.find(
                (item) => !item.wallet
              );
              Logic.Common.GoToRoute(
                `/auth/setup?business=${businessWithoutWallet?.id}`
              );
              return;
            }
          }

          if (authUser.transaction_pin) {
            const authLoginData = {
              email: formData.email,
              password: formData.password,
            };

            // Encrypt data
            const encryptedData = Logic.Common.encryptData(
              authLoginData,
              authUser.transaction_pin
            );

            localStorage.setItem("auth_encrypted_data", encryptedData);
            localStorage.setItem("auth_passcode", authUser.transaction_pin);
          }

          // Check if passcode has been set
          if (localStorage.getItem("auth_passcode")) {
            Logic.Common.GoToRoute("/");
            return;
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
            return;
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
