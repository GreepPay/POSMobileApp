<template>
  <app-wrapper mobilePadding="!pt-0">
    <app-onboarding-layout
      v-model="currentPage"
      :page-setting="pageSettings"
      :topPadding="`${currentPlatform === 'android' ? '!pt-6 !pb-0' : '!pb-0'}`"
      variant="white"
    >
      <div
        class="w-full flex flex-col items-center justify-start h-full px-4 py-3 pt-4"
      >
        <div class="w-full flex flex-col mb-4">
          <app-normal-text class="!text-sm">
            {{
              pageSettings.pages?.find((item) => item.key == currentPage)?.title
            }}
          </app-normal-text>
        </div>

        <template v-if="currentPage == 'business_type'">
          <auth-setup-business-type ref="businessTypeRef" />
        </template>

        <template v-if="currentPage == 'business_profile'">
          <auth-setup-business-info ref="businessInfoRef" />
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
        <div class="py-[60px] w-full"></div>
      </div>
    </app-onboarding-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { AppOnboardingLayout, AppNormalText } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import AuthSetupVerifyAccount from "../../../components/AuthSetup/verify-account.vue";
import AuthSetupPickCurrency from "../../../components/AuthSetup/pick-currency.vue";
import AuthSetupVerifyEmail from "../../../components/AuthSetup/verify-email.vue";
import AuthSetupSetPassword from "../../../components/AuthSetup/set-password.vue";
import AuthSetupBusinessInfo from "../../../components/AuthSetup/business-info.vue";
import AuthSetupBusinessType from "../../../components/AuthSetup/business-type.vue";
import { onMounted } from "vue";
import { StatusBar, Style } from "@capacitor/status-bar";
import { computed } from "vue";
import { getPlatforms, onIonViewDidEnter } from "@ionic/vue";

export default defineComponent({
  name: "SetupAccountPageIndex",
  components: {
    AuthSetupVerifyAccount,
    AuthSetupPickCurrency,
    AuthSetupVerifyEmail,
    AppOnboardingLayout,
    AuthSetupSetPassword,
    AuthSetupBusinessInfo,
    AuthSetupBusinessType,
    AppNormalText,
  },
  setup() {
    const FormValidations = Logic.Form;

    const currentPage = ref("business_type");

    const verifyAccountRef = ref<any>(null);
    const businessInfoRef = ref<any>(null);
    const pickCurrencyRef = ref<any>(null);
    const businessTypeRef = ref<any>(null);

    const currentBusinessId = ref("");

    const pageSettings = reactive({
      main_title: "Setup Business Profile",
      pages: [
        {
          title: "Business Type",
          key: "business_type",
          action_btn: {
            label: "Next",
            handler: () => {
              const businessType = businessTypeRef.value?.continueWithForm();

              if (currentBusinessId.value) {
                Logic.User.UpdateBusinessProfileForm = {
                  business_uuid: currentBusinessId.value,
                  business_type: businessType,
                };
              } else {
                Logic.User.CreateBusinessProfileForm = {
                  business_name: "",
                  business_type: businessType,
                  location: "",
                };
              }

              currentPage.value = "business_profile";
            },
            is_disabled: false,
            loading: false,
          },
        },
        {
          title: "Business Profile",
          key: "business_profile",
          action_btn: {
            label: "Next",
            handler: () => {
              const formData = businessInfoRef.value?.continueWithForm();

              if (formData) {
                if (currentBusinessId.value) {
                  if (Logic.User.UpdateBusinessProfileForm) {
                    Logic.User.UpdateBusinessProfileForm.country =
                      formData.country;
                    Logic.User.UpdateBusinessProfileForm.city = formData.state;
                    Logic.User.UpdateBusinessProfileForm.business_name =
                      formData.businessName;
                    Logic.User.UpdateBusinessProfileForm.business_logo =
                      formData.photo;
                    Logic.User.UpdateBusinessProfileForm.category =
                      formData.businessCategory;
                    Logic.User.UpdateBusinessProfileForm.description =
                      formData.businessDescription;
                    Logic.User.UpdateBusinessProfileForm.address =
                      JSON.stringify({
                        address: formData.address,
                        note: formData.address_note,
                      });
                  }
                } else {
                  if (Logic.User.CreateBusinessProfileForm) {
                    Logic.User.CreateBusinessProfileForm.country =
                      formData.country;
                    Logic.User.CreateBusinessProfileForm.city = formData.state;
                    Logic.User.CreateBusinessProfileForm.business_name =
                      formData.businessName;
                    Logic.User.CreateBusinessProfileForm.business_logo =
                      formData.photo;
                    Logic.User.CreateBusinessProfileForm.category =
                      formData.businessCategory;
                    Logic.User.CreateBusinessProfileForm.description =
                      formData.businessDescription;
                    Logic.User.CreateBusinessProfileForm.address =
                      JSON.stringify({
                        address: formData.address,
                        note: formData.address_note,
                      });
                  }
                }

                currentPage.value = "verify_account";
              }
            },
            is_disabled: false,
            loading: false,
          },
        },
        {
          title: "Account Verification",
          key: "verify_account",
          action_btn: {
            label: "Next",
            handler: () => {
              const formData = verifyAccountRef.value?.continueWithForm();

              if (formData) {
                const documents = [];

                if (formData.international_passport) {
                  documents.push(formData.international_passport);
                }

                if (formData.business_document) {
                  documents.push(formData.business_document);
                }

                if (formData.business_document_2) {
                  documents.push(formData.business_document_2);
                }

                if (currentBusinessId.value) {
                  if (Logic.User.UpdateBusinessProfileForm) {
                    Logic.User.UpdateBusinessProfileForm.documents = documents;
                  }
                } else {
                  if (Logic.User.CreateBusinessProfileForm) {
                    Logic.User.CreateBusinessProfileForm.documents = documents;
                  }
                }

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
            handler: async () => {
              const formData = pickCurrencyRef.value?.continueWithForm();

              if (formData) {
                if (currentBusinessId.value) {
                  if (Logic.User.UpdateBusinessProfileForm) {
                    Logic.User.UpdateBusinessProfileForm.default_currency =
                      formData.preferred_currency;
                  }
                } else {
                  if (Logic.User.CreateBusinessProfileForm) {
                    Logic.User.CreateBusinessProfileForm.default_currency =
                      formData.preferred_currency;
                  }
                }

                if (pageSettings.pages[3].action_btn.loading) {
                  return;
                }

                try {
                  pageSettings.pages[3].action_btn.loading = true;

                  if (currentBusinessId.value) {
                    await Logic.User.UpdateBusinessProfile();
                  } else {
                    await Logic.User.CreateBusinessProfile();
                  }

                  await Logic.Auth.GetAuthUser();

                  // Check if passcode has been set
                  if (localStorage.getItem("auth_passcode")) {
                    Logic.Common.GoToRoute("/");
                  } else {
                    Logic.Common.GoToRoute("/auth/set-passcode");
                  }
                } catch {
                  //
                } finally {
                  pageSettings.pages[3].action_btn.loading = false;
                }
              }
            },
            is_disabled: false,
            loading: false,
          },
        },
      ],
    });

    const currentPlatform = computed(() => {
      return getPlatforms()[0];
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

    const setBusinessId = () => {
      currentBusinessId.value =
        Logic.Common.route?.query?.business?.toString() || "";
    };

    onIonViewDidEnter(() => {
      setBusinessId();
    });

    onMounted(() => {
      initializeForm();
      onMounted(() => {
        StatusBar.setBackgroundColor({ color: "#ffffff" }); // any hex color
        StatusBar.setStyle({ style: Style.Light }); // Light or Dark
      });
      setBusinessId();
    });

    return {
      FormValidations,
      Logic,
      currentPage,
      pageSettings,
      verifyAccountRef,
      pickCurrencyRef,
      businessInfoRef,
      currentPlatform,
      businessTypeRef,
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
