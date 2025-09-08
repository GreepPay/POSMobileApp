<template>
  <app-wrapper>
    <subpage-layout title="Add Store Location">
      <div class="w-full flex flex-col justify-start h-full pt-1">
        <div class="w-full flex flex-col items-center justify-start px-4 h-full pt-4">

          <!-- Form -->
          <div class="w-full flex flex-col space-y-4">

            <!-- Store Name -->
            <div class="w-full flex flex-col">
              <app-text-field :has-title="true" title="Store Name" type="text"
                placeholder="Enter store name (e.g., Main Branch)" v-model="formData.name"
                :error-message="validationErrors.name" @input="validateField('name', formData.name)" />
            </div>

            <!-- Full Address -->
            <div class="w-full flex flex-col">
              <app-text-field :has-title="true" title="Full Address" type="text" placeholder="Enter complete address"
                v-model="formData.address" :error-message="validationErrors.address"
                @input="validateField('address', formData.address)" />
            </div>

            <!-- City -->
            <div class="w-full flex flex-col">
              <app-text-field :has-title="true" title="City" type="text" placeholder="Enter city"
                v-model="formData.city" :error-message="validationErrors.city"
                @input="validateField('city', formData.city)" />
            </div>

            <!-- Country -->
            <div class="w-full flex flex-col">
              <app-text-field :has-title="true" title="Country" type="text" placeholder="Enter country"
                v-model="formData.country" :error-message="validationErrors.country"
                @input="validateField('country', formData.country)" />
            </div>

            <!-- GPS Coordinates (Optional) -->
            <div class="w-full flex flex-col">
              <app-normal-text class="!text-left !text-sm font-medium mb-2">
                GPS Coordinates (Optional)
              </app-normal-text>

              <div class="flex flex-row space-x-2">
                <app-text-field :has-title="false" type="number" placeholder="Latitude" v-model="formData.latitude"
                  step="any" />
                <app-text-field :has-title="false" type="number" placeholder="Longitude" v-model="formData.longitude"
                  step="any" />
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Bottom button -->
      <div class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4" :style="`${getBottomPadding}`">
        <div class="w-full flex flex-col">
          <app-button :class="`!py-4`" :loading="isLoading" :disabled="!isFormValid() || isLoading"
            @click="addStoreLocation">
            Add Store Location
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
import { getBottomPadding } from "../../composable";

export default defineComponent({
  name: "AddStoreLocationPage",
  components: {
    AppButton,
    AppNormalText,
    AppTextField,
  },
  setup() {
    const isLoading = ref(false);

    const formData = reactive<{
      name: string;
      address: string;
      city: string;
      country: string;
      latitude?: number;
      longitude?: number;
    }>({
      name: "",
      address: "",
      city: "",
      country: "",
      latitude: undefined,
      longitude: undefined,
    });

    // Simple validation state
    const validationErrors = reactive<{
      name: string;
      address: string;
      city: string;
      country: string;
    }>({
      name: "",
      address: "",
      city: "",
      country: "",
    });

    // Validation functions
    const validateField = (field: keyof typeof validationErrors, value: string) => {
      if (!value || value.trim() === "") {
        validationErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        return false;
      }
      validationErrors[field] = "";
      return true;
    };

    const isFormValid = () => {
      const nameValid = validateField("name", formData.name);
      const addressValid = validateField("address", formData.address);
      const cityValid = validateField("city", formData.city);
      const countryValid = validateField("country", formData.country);

      return nameValid && addressValid && cityValid && countryValid;
    };

    const addStoreLocation = async () => {
      if (!isFormValid()) {
        return;
      }

      isLoading.value = true;

      try {
        // Get business UUID from auth user
        const businessUuid = Logic.Auth.AuthUser?.businesses[0]?.uuid;

        if (!businessUuid) {
          Logic.Common.showAlert({
            show: true,
            message: "Business profile not found. Please complete your business setup first.",
            type: "error",
          });
          return;
        }

        // Prepare form data
        Logic.User.CreateStoreLocationForm = {
          business_uuid: businessUuid,
          name: formData.name,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
        };

        // Create store location
        const result = await Logic.User.CreateStoreLocation();

        if (result) {
          Logic.Common.showAlert({
            show: true,
            message: "Store location added successfully!",
            type: "success",
          });

          // Navigate back to store locations list
          Logic.Common.GoToRoute("/profile/store-locations");
        }
      } catch (error) {
        console.error("Error adding store location:", error);
        Logic.Common.showAlert({
          show: true,
          message: "Failed to add store location. Please try again.",
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
    };
  },
});
</script>
