<template>
  <app-wrapper>
    <subpage-layout title="Store Locations">
      <div class="w-full flex flex-col justify-start h-full pt-1">
        <div
          class="w-full flex flex-col items-center justify-start px-4 h-full pt-4"
        >
          <!-- Add new location button -->
          <div class="w-full flex flex-col pb-4">
            <div
              @click="goToAddLocation"
              class="w-full flex flex-row space-x-1 px-3 py-3 border-[1.5px] rounded-[12px] items-center border-[#0A141E]"
            >
              <app-icon name="black-plus" custom-class="h-[24px]" />

              <app-normal-text class="!text-left">
                Add New Location
              </app-normal-text>
            </div>
          </div>

          <!-- Empty state -->
          <template v-if="!storeLocations || storeLocations.length === 0">
            <div class="w-full flex flex-col items-center justify-center py-20">
              <app-normal-text class="text-gray-500 text-center mb-2">
                No locations added yet
              </app-normal-text>
            </div>
          </template>

          <!-- Store locations list -->
          <template v-else>
            <template v-for="(location, index) in storeLocations" :key="index">
              <div
                class="w-full flex flex-row items-center justify-between mb-5 p-4 border border-gray-200 rounded-lg"
              >
                <div class="w-full flex flex-row space-x-3 items-start">
                  <app-icon name="event/location" custom-class="h-[24px] mt-1" />
                  
                  <div class="flex flex-col space-y-1">
                    <app-normal-text class="!text-left font-semibold">
                      {{ location.name }}
                    </app-normal-text>
                    <app-normal-text class="!text-left text-sm text-gray-600">
                      {{ location.address }}
                    </app-normal-text>
                    <app-normal-text class="!text-left text-sm text-gray-500">
                      {{ location.city }}, {{ location.country }}
                    </app-normal-text>
                  </div>
                </div>

                <div class="flex flex-row justify-end">
                  <app-icon
                    name="edit"
                    custom-class="h-[20px] text-gray-400"
                  />
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppNormalText,
  AppIcon,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import { onIonViewDidEnter } from "@ionic/vue";
import { onMounted } from "vue";

export default defineComponent({
  name: "StoreLocationsPage",
  components: {
    AppNormalText,
    AppIcon,
  },
  setup() {
    const StoreLocations = ref<any>(Logic.User.StoreLocations);

    const storeLocations = reactive<Array<{
      uuid: string;
      name: string;
      address: string;
      city: string;
      country: string;
      latitude?: number;
      longitude?: number;
      meta_data?: string;
      business_id: string;
      created_at: string;
      updated_at: string;
    }>>(Logic.User.StoreLocations?.data || []);

    const paginatorInfo = ref<any>(Logic.User.StoreLocations?.paginatorInfo || {});

    const refreshData = async () => {
      try {
        await Logic.User.GetStoreLocations(20, 1);
        storeLocations.splice(0, storeLocations.length, ...(Logic.User.StoreLocations?.data || []));
        paginatorInfo.value = Logic.User.StoreLocations?.paginatorInfo || {};
      } catch (error) {
        console.error('Error fetching store locations:', error);
      }
    };

    refreshData();

    onIonViewDidEnter(() => {
      refreshData();
    });

    const goToAddLocation = () => {
      Logic.Common.GoToRoute("/profile/add-store-location");
    };

    onMounted(() => {
      Logic.User.watchProperty("StoreLocations", StoreLocations);
    });

    return {
      Logic,
      storeLocations,
      goToAddLocation,
    };
  },
});
</script>
