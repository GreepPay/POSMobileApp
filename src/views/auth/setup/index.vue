<template>
  <app-wrapper>
    <app-onboarding-layout v-model="currentPage" :page-setting="pageSettings">
      <div
        class="w-full flex flex-col items-center justify-start h-full space-y-6 px-4 py-4"
      >
        <template v-if="currentPage == 'account_info'">
          <auth-setup-account-info ref="accountInfoRef" />
        </template>

        <template v-if="currentPage == 'verify_account'">
          <auth-setup-verify-account ref="verifyAccountRef" />
        </template>

        <template v-if="currentPage == 'pick_currency'">
          <auth-setup-pick-currency ref="pickCurrencyRef" />
        </template>

        <template v-if="currentPage == 'set_password'">
          <auth-setup-set-password ref="setPasswordRef" />
        </template>

        <template v-if="currentPage == 'verify_email'">
          <auth-setup-verify-email ref="verifyEmailRef" />
        </template>

        <!-- Spacer -->
        <div class="!h-[100px] py-5 w-full"></div>
      </div>
    </app-onboarding-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { AppOnboardingLayout } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import AuthSetupAccountInfo from "../../../components/AuthSetup/account-info.vue";
import AuthSetupVerifyAccount from "../../../components/AuthSetup/verify-account.vue";
import AuthSetupPickCurrency from "../../../components/AuthSetup/pick-currency.vue";
import AuthSetupVerifyEmail from "../../../components/AuthSetup/verify-email.vue";
import AuthSetupSetPassword from "../../../components/AuthSetup/set-password.vue";
import { onMounted } from "vue";

export default defineComponent({
  name: "SetupAccountIndex",
  components: {
    AuthSetupAccountInfo,
    AuthSetupVerifyAccount,
    AuthSetupPickCurrency,
    AuthSetupVerifyEmail,
    AppOnboardingLayout,
    AuthSetupSetPassword,
  },
  setup() {
    const FormValidations = Logic.Form;

    const currentPage = ref("account_info");

    const accountInfoRef = ref<any>(null);
    const verifyAccountRef = ref<any>(null);
    const pickCurrencyRef = ref<any>(null);
    const setPasswordRef = ref<any>(null);
    const verifyEmailRef = ref<any>(null);

    const pageSettings = reactive({
      main_title: "Setup POS",
      pages: [
        {
          title: "Account Info",
          key: "account_info",
          action_btn: {
            label: "Next",
            handler: () => {
              const formData = accountInfoRef.value?.continueWithForm();

              if (Logic.Auth.SignUpForm && formData) {
                Logic.Auth.SignUpForm.email = formData.email;
                Logic.Auth.SignUpForm.first_name = formData.firstName;
                Logic.Auth.SignUpForm.last_name = formData.lastName;
                Logic.Auth.SignUpForm.state = formData.state;
                Logic.Auth.SignUpForm.country = formData.country;
                Logic.Auth.SignUpForm.business_name = formData.businessName;

                currentPage.value = "verify_account";
              }
            },
            is_disabled: false,
            loading: false,
          },
        },
        {
          title: "Verify Account",
          key: "verify_account",
          action_btn: {
            label: "Next",
            handler: () => {
              const formData = verifyAccountRef.value?.continueWithForm();
              if (formData && Logic.Auth.SignUpForm) {
                Logic.Auth.SignUpForm.documents = [
                  formData.international_passport,
                  formData.business_document,
                ];
                currentPage.value = "pick_currency";
              }
            },
            is_disabled: false,
            loading: false,
          },
        },
        {
          title: "Pick Currency",
          key: "pick_currency",
          action_btn: {
            label: "Next",
            handler: () => {
              const formData = pickCurrencyRef.value?.continueWithForm();
              if (formData && Logic.Auth.SignUpForm) {
                Logic.Auth.SignUpForm.default_currency =
                  formData.preferred_currency;
                currentPage.value = "set_password";
              }
            },
            is_disabled: false,
          },
        },
        {
          title: "Set Password",
          key: "set_password",
          action_btn: {
            label: "Next",
            handler: () => {
              const formData = setPasswordRef.value?.continueWithForm();
              if (formData && Logic.Auth.SignUpForm) {
                Logic.Auth.SignUpForm.password = formData.password;

                pageSettings.pages[3].action_btn.loading = true;
                // Send signup request
                Logic.Auth.SignUp(true, (progress) => {
                  console.log(progress);
                })?.then((response) => {
                  if (response) {
                    currentPage.value = "verify_email";
                    pageSettings.pages[3].action_btn.loading = true;
                  } else {
                    pageSettings.pages[3].action_btn.loading = true;
                  }
                });
              }
            },
            is_disabled: false,
            loading: false,
          },
        },
        {
          title: "Verify Email",
          key: "verify_email",
          action_btn: {
            label: "Next",
            handler: () => {
              const otpCode = verifyEmailRef.value?.continueWithForm();

              if (otpCode) {
                Logic.Auth.VerifyUserOTPForm = {
                  user_uuid: Logic.Auth.AuthUser?.uuid,
                  otp: otpCode,
                };

                pageSettings.pages[4].action_btn.loading = true;

                Logic.Auth.VerifyUserOTP()?.then(async (response) => {
                  if (response) {
                    Logic.Auth.SignInForm = {
                      email: localStorage.getItem("auth_email"),
                      password: localStorage.getItem("auth_pass"),
                    };

                    await Logic.Auth.SignIn(true);
                    await Logic.Auth.GetAuthUser();

                    pageSettings.pages[4].action_btn.loading = false;

                    // Check if passcode has been set
                    if (localStorage.getItem("auth_passcode")) {
                      Logic.Common.GoToRoute("/");
                    } else {
                      Logic.Common.GoToRoute("/auth/set-passcode");
                    }
                  } else {
                    pageSettings.pages[4].action_btn.loading = false;
                  }
                });
              }
            },
            is_disabled: false,
            loading: false,
          },
        },
      ],
    });

    const initializeForm = () => {
      Logic.Auth.SignUpForm = {
        email: "",
        first_name: "",
        last_name: "",
        state: "",
        country: "",
        business_name: "",
        password: "",
        documents: [],
        default_currency: "",
      };
    };

    onMounted(() => {
      initializeForm();
    });

    return {
      FormValidations,
      Logic,
      currentPage,
      pageSettings,
      accountInfoRef,
      verifyAccountRef,
      pickCurrencyRef,
      verifyEmailRef,
      setPasswordRef,
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
