<template>
    <app-wrapper>
        <subpage-layout title="Edit Payment Method">
            <div class="w-full flex flex-col justify-start px-4 h-full pt-4">
                <div class="w-full flex flex-col space-y-4" v-if="!hideForm">

                    <!-- Account Name -->
                    <div class="w-full flex flex-col">
                        <app-text-field :has-title="true" title="Account Name" type="text"
                            placeholder="Enter account name" v-model="formData.account_name"
                            :error-message="validationErrors.account_name"
                            @input="validateField('account_name', formData.account_name)" />
                    </div>

                    <!-- Bank Name -->
                    <div class="w-full flex flex-col">
                        <app-text-field :has-title="true" title="Bank Name" type="text" placeholder="Enter bank name"
                            v-model="formData.bank_name" :error-message="validationErrors.bank_name"
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
                            placeholder="Enter additional information" v-model="formData.meta_data" :is-textarea="true"
                            text-area-row="3" />
                    </div>

                </div>
            </div>

            <!-- Bottom button -->
            <div class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4" :style="`${getBottomPadding}`">
                <div class="w-full flex flex-col">
                    <app-button :class="`!py-4`" :loading="loadingState" @click="updatePaymentMethod"
                        :disabled="!isFormValid() || loadingState">
                        Save Changes
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
import { useRoute } from "vue-router";
import { onIonViewWillEnter } from "@ionic/vue";
import { getBottomPadding } from "../../../../composable";

export default defineComponent({
    name: "EditPaymentMethodPage",
    components: {
        AppButton,
        AppNormalText,
        AppTextField,
    },
    setup() {
        const route = useRoute();
        const loadingState = ref(false);
        const hideForm = ref(false);

        const formData = reactive<{
            uuid?: string;
            account_name: string;
            bank_name: string;
            account_number: string;
            currency?: string;
            meta_data?: string;
        }>({
            uuid: "",
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

        // Fetch payment method by UUID
        const fetchPaymentMethod = async (uuid: string) => {
            try {
                const method = await Logic.Wallet.GetP2pPaymentMethod(uuid);
                if (method) {
                    formData.uuid = method.uuid;
                    formData.account_name = method.account_name;
                    formData.bank_name = method.bank_name;
                    formData.account_number = method.account_number;
                    formData.currency = method.currency || "";
                    formData.meta_data = method.meta_data || "";
                    console.log("💳 Payment method loaded by UUID:", method);
                } else {
                    console.warn("⚠️ Payment method not found for UUID:", uuid);
                }
            } catch (error) {
                console.error("Error fetching payment method:", error);
            }
        };

        onIonViewWillEnter(async () => {
            // Get payment method UUID from route params
            const methodUuid = route.params.uuid as string;

            if (methodUuid) {
                // Hide form to force re-render
                hideForm.value = true;

                // Fetch payment method by UUID
                await fetchPaymentMethod(methodUuid);

                await new Promise(resolve => setTimeout(resolve, 50));
                hideForm.value = false;
            } else {
                console.warn("⚠️ No payment method UUID found in route params!");
            }
        });

        const updatePaymentMethod = async () => {
            if (!isFormValid()) {
                return;
            }

            loadingState.value = true;

            try {
                Logic.Wallet.UpdateP2pPaymentMethodForm = {
                    p2p_payment_method_uuid: formData.uuid!,
                    account_name: formData.account_name,
                    bank_name: formData.bank_name,
                    account_number: formData.account_number,
                    currency: formData.currency || undefined,
                    meta_data: formData.meta_data || undefined,
                };

                const result = await Logic.Wallet.UpdateP2pPaymentMethod();

                if (result) {
                    Logic.Common.showAlert({
                        show: true,
                        message: "Payment method updated successfully!",
                        type: "success",
                    });

                    // Refresh the payment methods list
                    await Logic.Wallet.GetMyP2pPaymentMethods(20, 1);

                    Logic.Common.GoToRoute("/profile/payment-methods");
                }
            } catch (error) {
                console.error("Error updating payment method:", error);
                Logic.Common.showAlert({
                    show: true,
                    message: "Failed to update payment method. Please try again.",
                    type: "error",
                });
            } finally {
                loadingState.value = false;
            }
        };

        return {
            Logic,
            formData,
            validationErrors,
            loadingState,
            hideForm,
            updatePaymentMethod,
            validateField,
            isFormValid,
            getBottomPadding,
        };
    },
});
</script>
