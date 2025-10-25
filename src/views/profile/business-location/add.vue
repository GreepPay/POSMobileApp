<template>
  <app-wrapper>
    <subpage-layout title="Add Location">
      <div class="w-full flex flex-col justify-start h-full pt-1">
        <div
          class="w-full flex flex-col items-center justify-start px-4 h-full pt-4"
        >
          <!-- Form -->
          <div class="w-full flex flex-col">
            <!-- Delivery Address Name -->

            <div class="w-full flex flex-col mb-4">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                Address Name
              </app-normal-text>
              <app-text-field
                :has-title="true"
                title="Address Name"
                type="text"
                placeholder="Enter address name (e.g., HQ, Branch Office)"
                v-model="formData.name"
                :error-message="validationErrors.name"
                @input="validateField('name', formData.name)"
              />
            </div>

            <!-- Delivery Location Area -->
            <div class="w-full flex flex-col mb-4" v-if="showDeliverySelector">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                Location Area
              </app-normal-text>
              <app-select
                :placeholder="'Select Location Area'"
                :hasTitle="false"
                :paddings="'py-4 !px-4'"
                :options="deliveryLocationOptions"
                ref="deliveryArea"
                usePermanentFloatingLabel
                v-on:update:model-value="
                  (data) => {
                    formData.delivery_location_id = data;
                  }
                "
                v-model="deliveryLocationId"
                @update:model-value="
                  validateField(
                    'delivery_location_id',
                    formData.delivery_location_id || ''
                  )
                "
                auto-complete
              >
              </app-select>
            </div>

            <!-- Google Maps Link  -->
            <div class="w-full flex flex-col mb-4">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                Google Maps Link
              </app-normal-text>
              <app-text-field
                :has-title="true"
                title="Google Maps Link"
                type="url"
                placeholder="Google Map Link"
                v-model="formData.google_map_link"
              />
            </div>

            <!-- Description -->
            <div class="w-full flex flex-col mb-4">
              <app-normal-text class="!text-gray-600 !text-[12px] pb-2">
                Description
              </app-normal-text>
              <app-text-field
                :has-title="true"
                title="Description"
                type="text"
                placeholder="Description"
                v-model="formData.description"
                :is-textarea="true"
                text-area-row="4"
              />
            </div>

            <!-- Set as Default -->
            <div class="w-full flex flex-col mb-4">
              <app-checkbox v-model="formData.is_default">
                <template #label> Set as default Location </template>
              </app-checkbox>
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
            variant="secondary"
            @click="addStoreLocation"
          >
            Add Location
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
  AppCheckbox,
  AppSelect,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive, ref, onMounted, watch } from "vue";
import { SelectOption } from "@greep/ui-components/src/types";
import { getBottomPadding } from "../../../composable";

export default defineComponent({
  name: "AddDeliveryAddressPage",
  components: {
    AppButton,
    AppNormalText,
    AppTextField,
    AppCheckbox,
    AppSelect,
  },
  setup() {
    const isLoading = ref(false);
    const deliveryArea = ref<any>(null);
    const deliveryLocationId = ref("");
    const showDeliverySelector = ref(true);
    const deliveryLocationOptions = reactive<SelectOption[]>([]);

    const formData = reactive<{
      name: string;
      description?: string;
      google_map_link?: string;
      delivery_location_id?: string;
      is_default?: boolean;
    }>({
      name: "",
      description: "",
      google_map_link: "",
      delivery_location_id: "",
      is_default: false,
    });

    // Simple validation state
    const validationErrors = reactive<{
      name: string;
      delivery_location_id: string;
    }>({
      name: "",
      delivery_location_id: "",
    });

    // Fetch delivery locations on component mount
    const fetchDeliveryLocations = async () => {
      try {
        // GetDeliveryLocations endpoint is in Commerce service
        // Parameters: page, count, orderType, order, whereQuery
        await Logic.Commerce.GetDeliveryLocations(
          1,
          100,
          "CREATED_AT",
          "DESC",
          ""
        );
        const locations = Logic.Commerce.ManyDeliveryLocations?.data || [];

        deliveryLocationOptions.length = 0;
        deliveryLocationOptions.push(
          ...locations.map((location: any) => ({
            key: location.id?.toString(),
            value: location.area || "", // area is the primary field
            extraInfo: location.country || "", // country as extra info
          }))
        );
      } catch (error) {
        console.error("Error fetching delivery locations:", error);
      }
    };

    onMounted(() => {
      fetchDeliveryLocations();
    });

    // Watch for when deliveryLocationOptions are updated and remount the select
    watch(deliveryLocationOptions, () => {
      if (deliveryLocationOptions.length > 0) {
        showDeliverySelector.value = false;
        setTimeout(() => {
          showDeliverySelector.value = true;
        }, 100);
      }
    });

    // Sync deliveryLocationId with formData when options update
    watch(deliveryLocationId, () => {
      formData.delivery_location_id = deliveryLocationId.value;
    });

    // Validation functions
    const validateField = (
      field: keyof typeof validationErrors,
      value: string
    ) => {
      if (!value || value.trim() === "") {
        validationErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        return false;
      }
      validationErrors[field] = "";
      return true;
    };

    const isFormValid = () => {
      const nameValid = validateField("name", formData.name);
      const areaValid = validateField(
        "delivery_location_id",
        formData.delivery_location_id || ""
      );
      return nameValid && areaValid;
    };

    const addStoreLocation = async () => {
      if (!isFormValid()) {
        return;
      }

      isLoading.value = true;

      try {
        Logic.User.AddDeliveryAddressForm = {
          name: formData.name,
          description: formData.description,
          google_map_link: formData.google_map_link,
          delivery_location_id: formData.delivery_location_id,
          is_default: formData.is_default,
        };

        // Add delivery address
        const result = await Logic.User.AddDeliveryAddress();

        if (result) {
          Logic.Common.showAlert({
            show: true,
            message: "Address added successfully!",
            type: "success",
          });

          Logic.Common.goBack();
        }
      } catch (error) {
        console.error("Error adding delivery address:", error);
        Logic.Common.showAlert({
          show: true,
          message: "Failed to add address. Please try again.",
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
      addStoreLocation,
      validateField,
      isFormValid,
      getBottomPadding,
      deliveryLocationOptions,
      deliveryArea,
      deliveryLocationId,
      showDeliverySelector,
    };
  },
});
</script>
