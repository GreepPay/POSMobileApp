<template>
    <app-wrapper>
        <subpage-layout title="Add Payment Method">
            <div class="w-full flex flex-col justify-start h-full pt-1">
                <div class="w-full flex flex-col items-center justify-start px-4 h-full pt-4">

                    <!-- Form -->
                    <div class="w-full flex flex-col space-y-4">

                        <!-- Account Name -->
                        <div class="w-full flex flex-col">
                            <app-text-field :has-title="true" title="Account Name" type="text"
                                placeholder="Enter account name (e.g., John Doe)" v-model="formData.account_name"
                                :error-message="validationErrors.account_name"
                                @input="validateField('account_name', formData.account_name)" />
                        </div>

                        <!-- Bank Name -->
                        <div class="w-full flex flex-col">
                            <app-text-field :has-title="true" title="Bank Name" type="text"
                                placeholder="Enter bank name (e.g., GTBank)" v-model="formData.bank_name"
                                :error-message="validationErrors.bank_name"
                                @input="validateField('bank_name', formData.bank_name)" />
                        </div>

                        <!-- Account Number -->
                        <div class="w-full flex flex-col">
                            <app-text-field :has-title="true" title="Account Number" type="text"
                                placeholder="Enter account number" v-model="formData.account_number"
                                :error-message="validationErrors.account_number"
                                @input="validateField('account_number', formData.account_number)" />
                        </div>

                        <!-- Currency -->
                        <div class="w-full flex flex-col">
                            <app-text-field :has-title="true" title="Currency" type="text"
                                placeholder="Enter currency (e.g., NGN, USD)" v-model="formData.currency" />
                        </div>

                        <!-- Metadata (Optional) -->
                        <div class="w-full flex flex-col">
                            <app-text-field :has-title="true" title="Additional Info (Optional)" type="text"
                                placeholder="Enter additional information" v-model="formData.meta_data"
                                :is-textarea="true" text-area-row="3" />
                        </div>

                    </div>
                </div>
            </div>

            <!-- Bottom button -->
            <div class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4" :style="`${getBottomPadding}`">
                <div class="w-full flex flex-col">
                    <app-button :class="`!py-4`" :loading="isLoading" :disabled="!isFormValid() || isLoading"
                        @click="addPaymentMethod">
                        Add Payment Method
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
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive, ref } from "vue";
import { getBottomPadding } from "../../../composable";

export default defineComponent({
    name: "AddPaymentMethodPage",
    components: {
        AppButton,
        AppNormalText,
        AppTextField,
    },
    setup() {
        const isLoading = ref(false);

        const formData = reactive<{
            account_name: string;
            bank_name: string;
            account_number: string;
            currency?: string;
            meta_data?: string;
        }>({
            account_name: "",
            bank_name: "",
            account_number: "",
            currency: "",
            meta_data: "",
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

        const validateField = (field: keyof typeof validationErrors, value: string) => {
            if (!value || value.trim() === "") {
                validationErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')} is required`;
                return false;
            }
            validationErrors[field] = "";
            return true;
        };

        const isFormValid = () => {
            const accountNameValid = validateField("account_name", formData.account_name);
            const bankNameValid = validateField("bank_name", formData.bank_name);
            const accountNumberValid = validateField("account_number", formData.account_number);
            return accountNameValid && bankNameValid && accountNumberValid;
        };

        const addPaymentMethod = async () => {
            if (!isFormValid()) {
                return;
            }

            isLoading.value = true;

            try {
                Logic.Wallet.CreateP2pPaymentMethodForm = {
                    account_name: formData.account_name,
                    bank_name: formData.bank_name,
                    account_number: formData.account_number,
                    currency: formData.currency || undefined,
                    meta_data: formData.meta_data || undefined,
                };

                const result = await Logic.Wallet.CreateP2pPaymentMethod();

                if (result) {
                    Logic.Common.showAlert({
                        show: true,
                        message: "Payment method added successfully!",
                        type: "success",
                    });

                    Logic.Common.GoToRoute("/profile/payment-methods");
                }
            } catch (error) {
                console.error("Error adding payment method:", error);
                Logic.Common.showAlert({
                    show: true,
                    message: "Failed to add payment method. Please try again.",
                    type: "error",
                });
            } finally {
                isLoading.value = false;
            }
        };

        return {
            Logic,
            formData,
            validationErrors,
            isLoading,
            addPaymentMethod,
            validateField,
            isFormValid,
            getBottomPadding,
        };
    },
});
</script>
