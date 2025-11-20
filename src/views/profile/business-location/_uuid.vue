<template>
  <app-wrapper>
    <subpage-layout title="Edit Location">
      <div class="w-full flex flex-col justify-start px-4 h-full pt-4">
        <div class="w-full flex flex-col" v-if="!hideForm">
          <!-- Delivery Address Name -->
          <div class="w-full flex flex-col mb-4">
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
            <app-select
              :placeholder="'Select Delivery Location Area'"
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

          <!-- Active Status -->
          <div class="w-full flex flex-col">
            <app-checkbox v-model="formData.is_active">
              <template #label> Active </template>
            </app-checkbox>
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
            :loading="loadingState"
            @click="updateDeliveryAddress"
            :disabled="!isFormValid() || loadingState"
          >
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
  AppCheckbox,
  AppSelect,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive, ref, watch } from "vue";
import { SelectOption } from "@greep/ui-components/src/types";
import { useRoute } from "vue-router";
import { onIonViewWillEnter } from "@ionic/vue";
import { getBottomPadding } from "../../../composable";

export default defineComponent({
  name: "EditDeliveryAddressPage",
  components: {
    AppButton,
    AppNormalText,
    AppTextField,
    AppCheckbox,
    AppSelect,
  },
  setup() {
    const route = useRoute();
    const loadingState = ref(false);
    const hideForm = ref(false);
    const deliveryArea = ref<any>(null);
    const deliveryLocationId = ref("");
    const showDeliverySelector = ref(true);
    const deliveryLocationOptions = reactive<SelectOption[]>([]);

    const formData = reactive<{
      id?: string;
      name: string;
      description?: string;
      google_map_link?: string;
      delivery_location_id?: string;
      is_default?: boolean;
      is_active?: boolean;
    }>({
      id: "",
      name: "",
      description: "",
      google_map_link: "",
      delivery_location_id: "",
      is_default: false,
      is_active: true,
    });

    const validationErrors = reactive<{
      name: string;
      delivery_location_id: string;
    }>({
      name: "",
      delivery_location_id: "",
    });

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

    // Fetch delivery locations (use cache if available)
    const fetchDeliveryLocations = async () => {
      try {
        // Check if we already have delivery locations cached
        if (
          Logic.Commerce.ManyDeliveryLocations?.data &&
          Logic.Commerce.ManyDeliveryLocations.data.length > 0
        ) {
          const locations = Logic.Commerce.ManyDeliveryLocations.data;
          deliveryLocationOptions.length = 0;
          deliveryLocationOptions.push(
            ...locations.map((location: any) => ({
              key: location.id?.toString(),
              value: location.area || "Unknown Area",
              extraInfo: location.country || "",
            }))
          );
          return;
        }

        // If not cached, fetch from API
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
            value: location.area || "Unknown Area",
            extraInfo: location.country || "",
          }))
        );
      } catch (error) {
        console.error("Error fetching delivery locations:", error);
      }
    };

    // Fetch delivery address by UUID
    const fetchDeliveryAddress = async (uuid: string) => {
      try {
        const address = await Logic.User.GetDeliveryAddress(uuid);
        if (address) {
          formData.id = address.uuid;
          formData.name = address.name;
          formData.description = address.description || "";
          formData.google_map_link = address.google_map_link || "";
          formData.delivery_location_id = address.delivery_location_id || "";
          deliveryLocationId.value = address.delivery_location_id || "";
          formData.is_default = address.is_default === true;
          formData.is_active = address.is_active !== false;
          console.log("✏️ Address loaded by UUID:", address);
        } else {
          console.warn("⚠️ Address not found for UUID:", uuid);
        }
      } catch (error) {
        console.error("Error fetching delivery address:", error);
      }
    };

    // Watch for when deliveryLocationOptions are updated and remount the select
    watch(deliveryLocationOptions, () => {
      if (deliveryLocationOptions.length > 0) {
        showDeliverySelector.value = false;
        setTimeout(() => {
          showDeliverySelector.value = true;
        }, 100);
      }
    });

    // Sync deliveryLocationId with formData
    watch(deliveryLocationId, () => {
      formData.delivery_location_id = deliveryLocationId.value;
    });

    onIonViewWillEnter(async () => {
      // Fetch delivery locations
      await fetchDeliveryLocations();

      // Get address UUID from route params
      const addressUuid = route.params.uuid as string;

      if (addressUuid) {
        // Hide form to force re-render
        hideForm.value = true;

        // Fetch address by UUID
        await fetchDeliveryAddress(addressUuid);

        await new Promise((resolve) => setTimeout(resolve, 50));
        hideForm.value = false;
      } else {
        console.warn("⚠️ No address UUID found in route params!");
      }
    });

    const updateDeliveryAddress = async () => {
      if (!isFormValid()) {
        return;
      }

      loadingState.value = true;

      try {
        Logic.User.UpdateDeliveryAddressForm = {
          id: formData.id!,
          name: formData.name,
          description: formData.description || undefined,
          google_map_link: formData.google_map_link || undefined,
          delivery_location_id: formData.delivery_location_id || undefined,
          is_default: formData.is_default,
          is_active: formData.is_active,
        };

        const result = await Logic.User.UpdateDeliveryAddress();

        if (result) {
          Logic.Common.showAlert({
            show: true,
            message: "Address updated successfully!",
            type: "success",
          });

          // Refresh the delivery addresses list
          await Logic.User.GetDeliveryAddresses(20, 1);

          Logic.Common.GoToRoute("/profile/business-location");
        }
      } catch (error) {
        console.error("Error updating delivery address:", error);
        Logic.Common.showAlert({
          show: true,
          message: "Failed to update address. Please try again.",
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
      updateDeliveryAddress,
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
