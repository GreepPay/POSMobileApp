<template>
  <app-wrapper>
    <subpage-layout title="New Bank Account">
      <app-form-wrapper
        ref="formComponent"
        :parent-refs="parentRefs"
        class="w-full flex flex-col justify-start px-4 h-full pt-4"
      >
        <template v-if="selectedCurrency != 'EUR'">
          <div class="w-full flex flex-col pb-5">
            <app-text-field
              v-if="!yellowCardCurrencies.includes(selectedCurrency)"
              :has-title="false"
              type="text"
              placeholder="Bank Name*"
              ref="bankName"
              name="Bank Name"
              use-floating-label
              v-model="formDetails.bank_name"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>

            <template v-else>
              <app-select
                :placeholder="'Select Bank*'"
                :hasTitle="false"
                :paddings="'py-4 !px-4'"
                :options="yellowCardBanksOptions"
                ref="bankName"
                v-model="formDetails.network_id"
                @OnOptionSelected="
                  (data) => {
                    formDetails.bank_name = data.value;
                  }
                "
                autoComplete
              >
              </app-select>
            </template>
          </div>

          <div
            class="w-full flex flex-col pb-5"
            v-if="!yellowCardCurrencies.includes(selectedCurrency)"
          >
            <app-text-field
              :has-title="false"
              type="text"
              placeholder="Account Holder Name*"
              ref="accountHolderName"
              name="Account Holder Name"
              use-floating-label
              v-model="formDetails.account_holder_name"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>
          </div>

          <div class="w-full flex flex-col pb-5">
            <app-text-field
              :has-title="false"
              type="tel"
              placeholder="Account Number*"
              ref="accountNumber"
              name="Account Number"
              use-floating-label
              v-model="formDetails.account_number"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>

            <template v-if="selectedCurrency == 'NGN'">
              <div
                class="w-full flex flex-row items-center justify-end pt-2"
                v-if="
                  formDetails.account_number.length >= 10 &&
                  !resolvedAccountName
                "
              >
                <app-normal-text
                  :class="
                    isResolvingNumber
                      ? '!text-orange-500'
                      : resolveIsError
                      ? '!text-red-500'
                      : '!text-primary'
                  "
                >
                  {{
                    isResolvingNumber
                      ? "Validating account..."
                      : resolveIsError
                      ? "Unable to resolve account details"
                      : resolvedAccountName
                  }}
                </app-normal-text>
              </div>
            </template>
          </div>

          <div
            class="w-full flex flex-col pb-5"
            v-if="!yellowCardCurrencies.includes(selectedCurrency)"
          >
            <app-text-field
              :has-title="false"
              type="tel"
              placeholder="Routing Number*"
              ref="routingNumber"
              name="Routing Number"
              use-floating-label
              v-model="formDetails.routing_number"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>
          </div>

          <!-- Address Section -->

          <template v-if="!yellowCardCurrencies.includes(selectedCurrency)">
            <div class="w-full flex flex-col pb-5">
              <app-text-field
                :has-title="false"
                type="text"
                placeholder="Street Line 1*"
                ref="streetLine1"
                name="Street Line 1"
                use-floating-label
                v-model="formDetails.address.street_line_1"
                :rules="[
                  FormValidations.RequiredRule,
                  FormValidations.customValidator(
                    formDetails.address.street_line_1.length >= 3 &&
                      formDetails.address.street_line_1.length <= 35,
                    'Streetline 1 must be between 3-35 characters'
                  ),
                ]"
                :max-character="35"
              >
              </app-text-field>
            </div>

            <div class="w-full flex flex-col pb-5">
              <app-text-field
                :has-title="false"
                type="text"
                placeholder="Street Line 2"
                ref="streetLine2"
                name="Street Line 2"
                use-floating-label
                v-model="formDetails.address.street_line_2"
              >
              </app-text-field>
            </div>

            <div class="w-full flex flex-col pb-5">
              <app-text-field
                :has-title="false"
                type="text"
                placeholder="City*"
                ref="city"
                name="City"
                use-floating-label
                v-model="formDetails.address.city"
                :rules="[FormValidations.RequiredRule]"
              >
              </app-text-field>
            </div>

            <div class="w-full flex flex-col pb-5">
              <app-text-field
                :has-title="false"
                type="text"
                placeholder="State*"
                ref="state"
                name="State"
                use-floating-label
                v-model="formDetails.address.state"
                :rules="[FormValidations.RequiredRule]"
              >
              </app-text-field>
            </div>

            <div class="w-full flex flex-col pb-5">
              <app-text-field
                :has-title="false"
                type="text"
                placeholder="Postal Code*"
                ref="postalCode"
                name="Postal Code"
                use-floating-label
                v-model="formDetails.address.postal_code"
                :rules="[FormValidations.RequiredRule]"
              >
              </app-text-field>
            </div>
            <!--
        <div class="w-full flex flex-col pb-5">
          <app-select
            :placeholder="'Country'"
            :hasTitle="false"
            :paddings="'py-4 !px-3'"
            :options="countries"
            ref="country"
            use-floating-label
            v-model="formDetails.address.country"
            auto-complete
          >
          </app-select>
        </div> -->
          </template>

          <!-- Spacer -->
          <div class="h-[80px]"></div>
        </template>
        <template v-else>
          <!-- First Name -->
          <div
            class="w-full flex flex-col pb-5"
            v-if="myKoboPendingFields.first_name"
          >
            <app-normal-text class="!font-semibold pb-1">
              First Name
            </app-normal-text>
            <app-normal-text class="!pb-2 !text-gray-500">
              First Name as it appears on your Passport
            </app-normal-text>
            <app-text-field
              :has-title="false"
              type="text"
              placeholder="Enter first name"
              ref="firstName"
              name="First Name"
              v-model="formDetails.mykobo_kyc.first_name"
              :update-value="Logic.Auth.AuthUser.first_name"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>
          </div>

          <!-- Last Name -->
          <div
            class="w-full flex flex-col pb-5"
            v-if="myKoboPendingFields.last_name"
          >
            <app-normal-text class="!font-semibold pb-1">
              Last Name
            </app-normal-text>
            <app-normal-text class="pb-2 !text-gray-500">
              Last name as it appears on your passport
            </app-normal-text>
            <app-text-field
              :has-title="false"
              type="text"
              placeholder="Enter last name"
              ref="lastName"
              name="Last Name"
              v-model="formDetails.mykobo_kyc.last_name"
              :update-value="Logic.Auth.AuthUser.last_name"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>
          </div>

          <!-- Email -->
          <div
            class="w-full flex flex-col pb-5"
            v-if="myKoboPendingFields.email_address"
          >
            <app-normal-text class="!font-semibold pb-1">
              Email Address
            </app-normal-text>
            <app-normal-text class="pb-2 !text-gray-500">
              Your Email Address
            </app-normal-text>
            <app-text-field
              :has-title="false"
              type="email"
              placeholder="Enter email"
              ref="email"
              name="Email Address"
              v-model="formDetails.mykobo_kyc.email_address"
              :update-value="Logic.Auth.AuthUser.email"
              :rules="[FormValidations.RequiredRule, FormValidations.EmailRule]"
            >
            </app-text-field>
          </div>

          <!-- Mobile Number -->
          <div
            class="w-full flex flex-col pb-5"
            v-if="myKoboPendingFields.mobile_number"
          >
            <app-normal-text class="!font-semibold pb-1">
              Mobile Number
            </app-normal-text>
            <app-normal-text class="pb-2 !text-gray-500">
              Enter your mobile number
            </app-normal-text>
            <div class="w-full grid grid-cols-12 gap-3">
              <div class="col-span-3 flex flex-col">
                <app-select
                  :placeholder="'Country'"
                  :hasTitle="false"
                  :paddings="'py-4 !px-3'"
                  :options="countries"
                  ref="country"
                  v-model="countryPhoneCode"
                  auto-complete
                >
                </app-select>
              </div>
              <div class="col-span-9 flex flex-col">
                <app-text-field
                  :has-title="false"
                  type="tel"
                  placeholder="Phone Number *"
                  ref="phoneNumber"
                  name="Phone Number"
                  v-model="formDetails.mykobo_kyc.mobile_number"
                  :update-value="formDetails.mykobo_kyc.mobile_number"
                  :rules="[FormValidations.RequiredRule]"
                >
                </app-text-field>
              </div>
            </div>
          </div>

          <!-- Account Number -->
          <div
            class="w-full flex flex-col pb-5"
            v-if="myKoboPendingFields.bank_account_number"
          >
            <app-normal-text class="!font-semibold pb-1">
              Bank Account Number
            </app-normal-text>
            <app-normal-text class="pb-2 !text-gray-500">
              Enter IBAN number for SEPA transfers
            </app-normal-text>
            <app-text-field
              :has-title="false"
              type="tel"
              placeholder="Enter account number"
              ref="accountNumber"
              name="Account Number"
              v-model="formDetails.account_number"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>
          </div>

          <!-- Passport Country -->
          <div
            class="w-full flex flex-col pb-5"
            v-if="myKoboPendingFields.photo_id_front"
          >
            <app-normal-text class="!font-semibold pb-1">
              Country
            </app-normal-text>
            <app-normal-text class="pb-2 !text-gray-500">
              Country issuing your passport or photo ID
            </app-normal-text>
            <app-select
              :placeholder="'Country'"
              :hasTitle="false"
              :paddings="'py-4 !px-3'"
              :options="countriesForPassport"
              ref="country"
              v-model="formDetails.mykobo_kyc.id_country_code"
              auto-complete
            >
            </app-select>
          </div>

          <!-- Photo ID Front -->
          <div
            class="w-full flex flex-col pb-5"
            v-if="myKoboPendingFields.photo_id_front"
          >
            <app-normal-text class="!font-semibold pb-1">
              Passport Photo
            </app-normal-text>
            <app-normal-text class="pb-2 !text-gray-500">
              {{ myKoboPendingFields.photo_id_front.description }}
            </app-normal-text>
            <app-file-attachment
              v-model="proofIDFront"
              class="w-full flex flex-col"
              is-wrapper
              accept="image/*"
            >
              <template #content>
                <div
                  class="flex w-full flex-col space-y-3 px-4 py-4 !border-[1.5px] !border-dashed !border-gray-400 rounded-[10px]"
                >
                  <div
                    class="w-full flex flex-row items-center justify-between"
                  >
                    <app-normal-text
                      class="text-left text-gray-two line-clamp-2"
                    >
                      {{
                        proofIDFront
                          ? proofIDFront?.name
                          : "Take picture or Upload File"
                      }}
                    </app-normal-text>

                    <div class="w-[29px] justify-end flex flex-row">
                      <app-icon name="document-upload" class="h-[24px]" />
                    </div>
                  </div>
                </div>
              </template>
            </app-file-attachment>
          </div>

          <!-- Proof of residence -->
          <div
            class="w-full flex flex-col pb-5"
            v-if="myKoboPendingFields.photo_proof_residence"
          >
            <app-normal-text class="!font-semibold pb-1">
              Proof of Residence
            </app-normal-text>
            <app-normal-text class="pb-2 !text-gray-500">
              {{ myKoboPendingFields.photo_proof_residence.description }}
            </app-normal-text>
            <app-file-attachment
              v-model="photoProofResidence"
              class="w-full flex flex-col"
              is-wrapper
              accept="image/*"
            >
              <template #content>
                <div
                  class="flex w-full flex-col space-y-3 px-4 py-4 !border-[1.5px] !border-dashed !border-gray-400 rounded-[10px]"
                >
                  <div
                    class="w-full flex flex-row items-center justify-between"
                  >
                    <app-normal-text
                      class="text-left text-gray-two line-clamp-2"
                    >
                      {{
                        photoProofResidence
                          ? photoProofResidence?.name
                          : "Take picture or Upload File"
                      }}
                    </app-normal-text>

                    <div class="w-[29px] justify-end flex flex-row">
                      <app-icon name="document-upload" class="h-[24px]" />
                    </div>
                  </div>
                </div>
              </template>
            </app-file-attachment>
          </div>

          <!-- Proof of residence -->
          <div
            class="w-full flex flex-col pb-5"
            v-if="myKoboPendingFields.proof_of_liveness"
          >
            <app-normal-text class="!font-semibold pb-1">
              Proof of Liveness
            </app-normal-text>
            <app-normal-text class="pb-2 !text-gray-500">
              {{ myKoboPendingFields.proof_of_liveness.description }}
            </app-normal-text>
            <app-file-attachment
              v-model="proofOfLiveness"
              class="w-full flex flex-col"
              is-wrapper
              accept="image/*"
            >
              <template #content>
                <div
                  class="flex w-full flex-col space-y-3 px-4 py-4 !border-[1.5px] !border-dashed !border-gray-400 rounded-[10px]"
                >
                  <div
                    class="w-full flex flex-row items-center justify-between"
                  >
                    <app-normal-text
                      class="text-left text-gray-two line-clamp-2"
                    >
                      {{
                        proofOfLiveness
                          ? proofOfLiveness?.name
                          : "Take picture or Upload File"
                      }}
                    </app-normal-text>

                    <div class="w-[29px] justify-end flex flex-row">
                      <app-icon name="document-upload" class="h-[24px]" />
                    </div>
                  </div>
                </div>
              </template>
            </app-file-attachment>

            <!-- Spacer -->
            <div class="h-[80px]"></div>
          </div>
        </template>

        <!-- Spacer -->
        <div class="h-[80px]"></div>
      </app-form-wrapper>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        style="
          padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
        "
      >
        <div
          :class="`w-full flex flex-col ${canMoveForward ? '' : 'opacity-50'}`"
        >
          <app-button
            variant="secondary"
            :class="`!py-4`"
            @click="canMoveForward ? continueToNext() : null"
            :loading="loadingState"
            >Save & Continue</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppButton,
  AppTextField,
  AppFormWrapper,
  AppSelect,
  AppNormalText,
  AppFileAttachment,
  AppIcon,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import { onMounted } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import { SelectOption } from "@greep/ui-components/src/types";
import { computed } from "vue";
import { watch } from "vue";
import { Country } from "country-state-city";
import countryIso3Code from "../../assets/countryIso3Code.json";

interface MyKoboFields {
  first_name: {
    type: string;
    description: string;
  };
  last_name: {
    type: string;
    description: string;
  };
  email_address: {
    type: string;
    description: string;
  };
  mobile_number: {
    type: string;
    description: string;
  };
  bank_account_number: {
    type: string;
    description: string;
  };
  photo_id_front: {
    type: string;
    description: string;
  };
  photo_proof_residence: {
    type: string;
    description: string;
  };
  proof_of_liveness: {
    type: string;
    description: string;
  };
}

export default defineComponent({
  name: "AddBankAccountPage",
  components: {
    AppButton,
    AppTextField,
    AppFormWrapper,
    AppSelect,
    AppNormalText,
    AppFileAttachment,
    AppIcon,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "CurrentYellowCardNetworks",
        method: "GetYellowCardNetwork",
        params: [],
        requireAuth: true,
        ignoreProperty: true,
        silentUpdate: false,
        useRouteQuery: true,
        queries: ["country_code"],
      },
    ],
  },
  setup() {
    const formDetails = reactive({
      bank_name: "",
      account_holder_name: "",
      account_number: "",
      routing_number: "",
      swift_code: "",
      country: "",
      network_id: "",
      channel_id: "",
      address: {
        street_line_1: "",
        street_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "USA",
      },
      mykobo_kyc: {
        first_name: "",
        last_name: "",
        email_address: "",
        mobile_number: "",
        mobile_number_full: "",
        id_country_code: "DEU",
        photo_id_front: 0,
        photo_proof_residence: 0,
        proof_of_liveness: 0,
      },
    });

    const loadingState = ref(false);

    const proofIDFront = ref();
    const photoProofResidence = ref();
    const proofOfLiveness = ref();

    const formComponent = ref<any>();

    const countryPhoneCode = ref("+234");

    const countries = reactive<SelectOption[]>([]);
    const countriesForPassport = reactive<SelectOption[]>([]);

    const FormValidations = Logic.Form;

    const CurrentYellowCardNetworks = ref(
      Logic.Wallet.CurrentYellowCardNetworks
    );

    const yellowCardCurrencies = ["NGN", "GHS", "KES", "ZAR"];

    const yellowCardBanksOptions = reactive<SelectOption[]>([]);

    const myKoboPendingFields = computed<MyKoboFields>(() => {
      return JSON.parse(
        localStorage.getItem("mykobo_extra_info_needed") || "{}"
      );
    });

    const amount = ref("");
    const selectedCurrency = ref("");
    const channelId = ref("");
    const countryCode = ref("");
    const resolveIsError = ref(false);
    const isResolvingNumber = ref(false);
    const resolvedAccountName = ref("");

    const setCountries = () => {
      countries.length = 0;
      countriesForPassport.length = 0;
      const allCountries = Country.getAllCountries();

      allCountries.forEach((country) => {
        countries.push({
          key: country.phonecode.startsWith("+")
            ? country.phonecode
            : `+${country.phonecode}`,
          value: country.phonecode.startsWith("+")
            ? country.phonecode
            : `+${country.phonecode}`,
          altValue: `${country.flag} ${country.name} (${country.phonecode})`,
          extraInfo: "",
        });
      });

      countryIso3Code.forEach((country) => {
        if (country.eu) {
          countriesForPassport.push({
            key: country.code,
            value: country.name,
            extraInfo: "",
          });
        }
      });
    };

    const canMoveForward = computed(() => {
      if (selectedCurrency.value === "NGN") {
        return (
          formDetails.bank_name &&
          formDetails.account_number &&
          resolvedAccountName.value
        );
      } else if (selectedCurrency.value == "USD") {
        return (
          formDetails.bank_name &&
          formDetails.account_holder_name &&
          formDetails.account_number &&
          formDetails.routing_number &&
          formDetails.address.street_line_1 &&
          formDetails.address.city &&
          formDetails.address.state &&
          formDetails.address.postal_code &&
          formDetails.address.country
        );
      } else if (selectedCurrency.value == "EUR") {
        return (
          formDetails.account_number &&
          formDetails.mykobo_kyc.first_name &&
          formDetails.mykobo_kyc.last_name &&
          formDetails.mykobo_kyc.email_address &&
          formDetails.mykobo_kyc.mobile_number &&
          photoProofResidence.value &&
          proofIDFront.value &&
          proofOfLiveness.value
        );
      }

      return formDetails.bank_name && formDetails.account_number;
    });

    const resolveAccountNumber = () => {
      Logic.Common.debounce(() => {
        if (formDetails.account_number.length >= 10 && formDetails.network_id) {
          isResolvingNumber.value = true;
          resolvedAccountName.value = "";

          Logic.Wallet.GetBankAccountDetails(
            formDetails.account_number,
            formDetails.network_id
          )
            ?.then((data) => {
              if (data) {
                resolvedAccountName.value = data;

                resolveIsError.value = false;
                isResolvingNumber.value = false;
              } else {
                resolveIsError.value = true;
                isResolvingNumber.value = false;
                resolvedAccountName.value = "";
              }
            })
            .catch((error: any) => {
              console.error(error);
              resolveIsError.value = true;
              isResolvingNumber.value = false;
              resolvedAccountName.value = "";
            });
        }
      }, 300);
    };

    const continueToNext = () => {
      const state = formComponent.value.validate();

      if (loadingState.value) return;

      if (state) {
        formDetails.country = countryCode.value;
        formDetails.channel_id = channelId.value;

        if (selectedCurrency.value == "NGN") {
          formDetails.account_holder_name = resolvedAccountName.value;
        }

        const uploads = [];

        if (proofIDFront.value) {
          uploads.push(proofIDFront.value);
          formDetails.mykobo_kyc.photo_id_front = 0;
        }
        if (photoProofResidence.value) {
          uploads.push(photoProofResidence.value);
          formDetails.mykobo_kyc.photo_proof_residence = 1;
        }
        if (proofOfLiveness.value) {
          uploads.push(proofOfLiveness.value);
          formDetails.mykobo_kyc.proof_of_liveness = 2;
        }

        if (countryPhoneCode.value) {
          formDetails.mykobo_kyc.mobile_number_full = `${countryPhoneCode.value}${formDetails.mykobo_kyc.mobile_number}`;
        }

        Logic.Wallet.CreateSavedAccountForm = {
          unique_id: formDetails.account_number,
          type: "bank_account",
          metadata: JSON.stringify(formDetails),
          uploads,
        };

        loadingState.value = true;

        Logic.Wallet.CreateSavedAccount()?.then(async (response) => {
          if (response) {
            await Logic.Wallet.GetSavedAccounts(30, 1);
            loadingState.value = false;
            Logic.Common.showAlert({
              show: true,
              type: "success",
              message: "Bank account has been saved",
            });
            Logic.Common.goBack();
          } else {
            loadingState.value = false;
          }
        });
      }
    };

    const setDefaults = () => {
      amount.value = Logic.Common.route?.query?.amount?.toString() || "0";
      selectedCurrency.value =
        Logic.Common.route?.query?.currency?.toString() || "USD";

      channelId.value =
        Logic.Common.route?.query?.channel_id?.toString() || "0";

      countryCode.value =
        Logic.Common.route?.query?.country_code?.toString() || "0";

      formDetails.mykobo_kyc.mobile_number = Logic.Auth.AuthUser.phone
        ? Logic.Form.getPhoneAndCode(Logic.Auth.AuthUser.phone || "").phone
        : "";
      countryPhoneCode.value = Logic.Form.getPhoneAndCode(
        Logic.Auth.AuthUser.phone || ""
      ).code
        ? Logic.Form.getPhoneAndCode(Logic.Auth.AuthUser.phone || "").code
        : "+234";
    };

    const setBankOptions = () => {
      yellowCardBanksOptions.length = 0;

      CurrentYellowCardNetworks.value?.forEach((network) => {
        if (network.accountNumberType == "bank") {
          yellowCardBanksOptions.push({
            key: network.id,
            value: network.name || "",
            extraInfo: "",
          });
        }
      });
    };

    onMounted(() => {
      Logic.Wallet.watchProperty(
        "CurrentYellowCardNetworks",
        CurrentYellowCardNetworks
      );
      setDefaults();
      setBankOptions();
    });

    watch(formDetails, () => {
      if (selectedCurrency.value == "NGN") {
        resolveAccountNumber();
        setCountries();
      }
    });

    onIonViewWillEnter(() => {
      setDefaults();
      setBankOptions();
      setCountries();
    });

    return {
      Logic,
      formDetails,
      continueToNext,
      FormValidations,
      formComponent,
      loadingState,
      yellowCardCurrencies,
      selectedCurrency,
      yellowCardBanksOptions,
      canMoveForward,
      resolveIsError,
      isResolvingNumber,
      resolvedAccountName,
      myKoboPendingFields,
      countries,
      countryPhoneCode,
      proofIDFront,
      photoProofResidence,
      proofOfLiveness,
      countriesForPassport,
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
