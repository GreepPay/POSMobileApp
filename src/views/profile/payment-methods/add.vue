<template>
  <app-wrapper>
    <subpage-layout
      :title="isEdit ? 'Edit Payment Method' : 'Add Payment Method'"
    >
      <div class="w-full flex flex-col justify-start h-full pt-1">
        <div
          class="w-full flex flex-col items-center justify-start px-4 h-full"
          v-if="!hideContent"
        >
          <!-- Form -->
          <div class="w-full flex flex-col mt-3">
            <!-- Currency -->
            <div class="w-full flex flex-col mb-4">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                Currency
              </app-normal-text>
              <app-select
                :placeholder="'Select Currency'"
                :hasTitle="false"
                :paddings="'py-4 !px-4'"
                :options="currencyOptions"
                ref="paymentMethod"
                v-model="formData.currency"
                auto-complete
              >
              </app-select>
            </div>

            <!-- Payment Method -->
            <div class="w-full flex flex-col mb-4">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                Payment Method
              </app-normal-text>
              <app-select
                :placeholder="'Select Method'"
                :hasTitle="false"
                :paddings="'py-4 !px-4'"
                :options="accountMethodOptions"
                ref="paymentMethod"
                v-model="formData.meta_data.type"
              >
              </app-select>
            </div>

            <!-- Bank Name -->
            <div class="w-full flex flex-col mb-4">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                {{
                  formData.meta_data.type == "bank_account"
                    ? "Bank Name"
                    : "Mobile Money Provider"
                }}
              </app-normal-text>
              <app-text-field
                :has-title="true"
                :title="
                  formData.meta_data.type == 'bank_account'
                    ? 'Bank Name'
                    : 'Mobile Money Provider'
                "
                type="text"
                :placeholder="
                  formData.meta_data.type == 'bank_account'
                    ? 'Enter bank name (e.g., GTBank)'
                    : 'Enter mobile money provider'
                "
                :name="
                  formData.meta_data.type == 'bank_account'
                    ? 'Bank Name'
                    : 'Mobile Money Provider'
                "
                v-model="formData.bank_name"
                @input="validateField('bank_name', formData.bank_name)"
                :rules="[FormValidations.RequiredRule]"
              />
            </div>

            <!-- Account Number -->
            <div class="w-full flex flex-col mb-4">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                {{
                  formData.meta_data.type == "bank_account"
                    ? "Account Number"
                    : "Phone Number"
                }}
              </app-normal-text>
              <app-text-field
                :has-title="true"
                :title="
                  formData.meta_data.type == 'bank_account'
                    ? 'Account Number'
                    : 'Phone Number'
                "
                type="tel"
                :placeholder="
                  formData.meta_data.type == 'bank_account'
                    ? 'Enter account number'
                    : 'Enter phone number'
                "
                v-model="formData.account_number"
                :name="
                  formData.meta_data.type == 'bank_account'
                    ? 'Account Number'
                    : 'Phone Number'
                "
                @input="
                  validateField('account_number', formData.account_number)
                "
                :rules="[FormValidations.RequiredRule]"
              />
            </div>

            <!-- Account Name -->
            <div class="w-full flex flex-col mb-4">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                Account Holder's Name
              </app-normal-text>
              <app-text-field
                :has-title="false"
                type="text"
                placeholder="Enter account holder's name"
                ref="accountName"
                name="Account Holder's Name"
                v-model="formData.account_name"
                :rules="[FormValidations.RequiredRule]"
              >
              </app-text-field>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        :style="`${getBottomPadding}`"
      >
        <div class="w-full flex flex-col">
          <app-button
            :class="`!py-4`"
            :loading="isLoading"
            :disabled="!isFormValid() || isLoading"
            @click="addPaymentMethod"
            variant="secondary"
          >
            {{ isEdit ? "Save Changes" : "Add Payment Method" }}
          </app-button>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppButton,
  AppNormalText,
  AppTextField,
  AppSelect,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive, ref } from "vue";
import { availableCurrencies, getBottomPadding } from "../../../composable";
import { SelectOption } from "@greep/ui-components/src/types";
import { onIonViewWillEnter } from "@ionic/vue";

export default defineComponent({
  name: "AddPaymentMethodPage",
  components: {
    AppButton,
    AppNormalText,
    AppTextField,
    AppSelect,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "SingleP2pPaymentMethod",
        method: "GetP2pPaymentMethod",
        params: [],
        requireAuth: true,
        ignoreProperty: true,
        useRouteQuery: true,
        queries: ["uuid"],
        condition: {
          routeSearchItem: "fullPath",
          searchQuery: "uuid",
        },
      },
    ],
  },
  setup() {
    const isLoading = ref(false);
    const isEdit = ref(false);
    const SingleP2pPaymentMethod = ref(Logic.Wallet.SingleP2pPaymentMethod);

    const hideContent = ref(false);

    const accountMethodOptions = reactive<SelectOption[]>([
      {
        value: "Bank Account",
        key: "bank_account",
      },
      {
        value: "Mobile Money",
        key: "mobile_money",
      },
    ]);

    const currencyOptions = reactive<SelectOption[]>([]);

    const formData = reactive<{
      account_name: string;
      bank_name: string;
      account_number: string;
      currency: string;
      meta_data: {
        type: string;
      };
    }>({
      account_name: "",
      bank_name: "",
      account_number: "",
      currency: "NGN_NG",
      meta_data: { type: "bank_account" },
    });

    const validationErrors = reactive<{
      account_name: string;
      bank_name: string;
      account_number: string;
    }>({
      account_name: "",
      bank_name: "",
      account_number: "",
    });

    const validateField = (
      field: keyof typeof validationErrors,
      value: string
    ) => {
      if (!value || value.trim() === "") {
        validationErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ")
        } is required`;
        return false;
      }
      validationErrors[field] = "";
      return true;
    };

    const isFormValid = () => {
      const accountNameValid = validateField(
        "account_name",
        formData.account_name
      );
      const bankNameValid = validateField("bank_name", formData.bank_name);
      const accountNumberValid = validateField(
        "account_number",
        formData.account_number
      );
      return accountNameValid && bankNameValid && accountNumberValid;
    };

    const FormValidations = Logic.Form;

    const setCurrencyOptions = () => {
      const currencies = availableCurrencies;
      currencyOptions.length = 0; // Clear existing options
      currencies.forEach((currency) => {
        if (
          (!currency.is_foreign_currency && !currency.is_crypto) ||
          currency.code === "TRY"
        ) {
          currencyOptions.push({
            key: currency.code + "_" + currency.country_code,
            value: currency.name,
          });
        }
      });
    };

    const addPaymentMethod = async () => {
      if (!isFormValid()) {
        return;
      }

      isLoading.value = true;

      try {
        if (isEdit.value) {
          Logic.Wallet.UpdateP2pPaymentMethodForm = {
            p2p_payment_method_uuid: SingleP2pPaymentMethod.value?.uuid || "",
            account_name: formData.account_name,
            bank_name: formData.bank_name,
            account_number: formData.account_number,
            currency: formData.currency || undefined,
            meta_data: JSON.stringify(formData.meta_data || "{}") || undefined,
          };
        } else {
          Logic.Wallet.CreateP2pPaymentMethodForm = {
            account_name: formData.account_name,
            bank_name: formData.bank_name,
            account_number: formData.account_number,
            currency: formData.currency || undefined,
            meta_data: JSON.stringify(formData.meta_data || "{}") || undefined,
          };
        }

        const result = isEdit.value
          ? await Logic.Wallet.UpdateP2pPaymentMethod()
          : await Logic.Wallet.CreateP2pPaymentMethod();

        if (result) {
          Logic.Common.showAlert({
            show: true,
            message: isEdit.value
              ? "Payment method updated successfully."
              : "Payment method added successfully.",
            type: "success",
          });

          Logic.Common.GoToRoute("/profile/payment-methods?backRoute=/profile");
        }
      } catch (error) {
        console.error("Error adding payment method:", error);
        Logic.Common.showAlert({
          show: true,
          message: isEdit.value
            ? "Failed to update payment method. Please try again."
            : "Failed to add payment method. Please try again.",
          type: "error",
        });
      } finally {
        isLoading.value = false;
      }
    };

    const setDefaultValues = () => {
      if (Logic.Common.route?.query?.uuid?.toString()) {
        isEdit.value = true;
      } else {
        isEdit.value = false;
        Logic.Wallet.SingleP2pPaymentMethod = undefined;
      }

      if (isEdit.value && SingleP2pPaymentMethod.value) {
        hideContent.value = true;
        formData.account_name = SingleP2pPaymentMethod.value.account_name;
        formData.bank_name = SingleP2pPaymentMethod.value.bank_name;
        formData.account_number = SingleP2pPaymentMethod.value.account_number;
        formData.currency = SingleP2pPaymentMethod.value.currency || "";
        let metadata: any = {};
        try {
          metadata = JSON.parse(SingleP2pPaymentMethod.value.meta_data || "{}");

          if (typeof metadata === "string") {
            metadata = JSON.parse(metadata);
          }
        } catch (error) {
          // If parsing fails, default to empty object
          metadata = {};
        }

        setTimeout(() => {
          hideContent.value = false;
        }, 200);
      } else {
        hideContent.value = false;
      }
    };

    onIonViewWillEnter(() => {
      setCurrencyOptions();
      Logic.Wallet.watchProperty(
        "SingleP2pPaymentMethod",
        SingleP2pPaymentMethod
      );
      setDefaultValues();
    });

    return {
      Logic,
      formData,
      validationErrors,
      isLoading,
      addPaymentMethod,
      validateField,
      isFormValid,
      getBottomPadding,
      FormValidations,
      accountMethodOptions,
      currencyOptions,
      hideContent,
      isEdit,
    };
  },
});
</script>
