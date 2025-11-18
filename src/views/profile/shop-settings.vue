<template>
  <app-wrapper>
    <subpage-layout title="Shop Settings">
      <div
        class="w-full flex flex-col justify-start px-4 h-full pt-2 pb-[100px]"
      >
        <!-- Cover Photo Section -->
        <div class="w-full flex flex-col space-y-2 pb-6">
          <div class="flex flex-row items-center justify-between space-x-2">
            <app-normal-text
              class="!text-black !font-semibold !whitespace-nowrap !text-sm"
            >
              Cover Photo
            </app-normal-text>
            <div class="w-full border-t-[3px] border-[#F0F3F6]"></div>
          </div>
          <app-file-attachment
            v-if="!coverPhotoUrl"
            :is-wrapper="true"
            @update:files-and-url="handleCoverPhotoUpload"
            :accept="`image/png, image/gif, image/jpeg, image/webp`"
            custom-class="flex flex-row items-center justify-start !w-full"
          >
            <template v-slot:content>
              <div
                class="w-full !h-[156px] bg-[#555555] rounded-[16px] flex flex-col items-center justify-center"
              >
                <app-icon name="gallery-add-white" custom-class="!h-[50px]" />
              </div>
            </template>
          </app-file-attachment>

          <div v-else class="w-full relative">
            <span
              class="absolute top-2 right-2 py-2 px-2 bg-white rounded-full cursor-pointer z-10"
              @click="removeCoverPhoto"
            >
              <app-icon name="remove-image" custom-class="!h-[24px]" />
            </span>
            <app-image-loader
              :photo-url="coverPhotoUrl"
              class="w-full h-[156px] rounded-[16px]"
            />
          </div>
        </div>

        <!-- Schedule Section -->
        <div class="w-full flex flex-col space-y-2 pt-3">
          <div class="flex flex-row items-center justify-between space-x-2">
            <app-normal-text
              class="!text-black !font-semibold !whitespace-nowrap !text-sm"
            >
              Schedule
            </app-normal-text>
            <div class="w-full border-t-[3px] border-[#F0F3F6]"></div>
          </div>
          <!-- Days Schedule -->
          <div class="w-full flex flex-col">
            <div
              v-for="(day, index) in schedule"
              :key="index"
              class="w-full flex flex-col py-2"
            >
              <!-- Day Toggle (left-aligned) -->
              <div class="w-full flex flex-row items-center">
                <!-- toggle on left (bigger) -->
                <div class="flex items-center -ml-1">
                  <!-- increased scale and slight negative margin to tuck it closer to the text -->
                  <app-checkbox
                    v-model="day.isOpen"
                    variant="switch"
                    class="transform scale-150"
                    @click="onScheduleToggleChange(index)"
                    custom-class="!space-x-1"
                  >
                    <template #label>
                      <div class="flex flex-row items-center space-x-1">
                        <app-normal-text
                          class="!text-black !font-semibold !text-[13px] !leading-[24px]"
                        >
                          {{ day.name }}
                        </app-normal-text>
                        <span
                          :class="
                            day.isOpen ? '!text-green-600' : '!text-gray-400'
                          "
                        >
                          •
                        </span>
                        <app-normal-text
                          :class="
                            day.isOpen ? '!text-green-600' : '!text-gray-400'
                          "
                          class="!leading-[24px]"
                        >
                          {{ day.isOpen ? "Open" : "Closed" }}
                        </app-normal-text>
                      </div>
                    </template>
                  </app-checkbox>
                </div>
              </div>

              <!-- Time Pickers (shown only when day is open) -->
              <div
                v-if="day.isOpen"
                class="w-full grid grid-cols-12 gap-3 pt-3"
              >
                <template v-if="day.tempClosed">
                  <div
                    class="skeleton h-[80px] rounded-[12px] col-span-full"
                  ></div>
                </template>
                <template v-else>
                  <div class="col-span-6 flex flex-col">
                    <app-normal-text class="!text-gray-500 !text-sm !mb-2"
                      >From</app-normal-text
                    >
                    <app-text-field
                      :has-title="false"
                      type="time"
                      placeholder="From"
                      v-model="day.from"
                      @change="onScheduleTimeChange(index)"
                      usePermanentFloatingLabel
                      :update-value="day.from"
                    >
                      <template #inner-suffix>
                        <app-icon name="clock" class="h-[20px]" />
                      </template>
                    </app-text-field>
                  </div>
                  <div class="col-span-6 flex flex-col">
                    <app-normal-text class="!text-gray-500 !text-sm !mb-2"
                      >To</app-normal-text
                    >
                    <app-text-field
                      :has-title="false"
                      type="time"
                      placeholder="To"
                      v-model="day.to"
                      @change="onScheduleTimeChange(index)"
                      usePermanentFloatingLabel
                      :update-value="day.to"
                    >
                      <template #inner-suffix>
                        <app-icon name="clock" class="h-[20px]" />
                      </template>
                    </app-text-field>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Spacer -->
        <div class="h-[100px] py-10"></div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  watch,
  nextTick,
} from "vue";
import {
  AppButton,
  AppNormalText,
  AppIcon,
  AppCheckbox,
  AppTextField,
  AppFileAttachment,
  AppImageLoader,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { onIonViewDidEnter } from "@ionic/vue";
import { getBottomPadding } from "../../composable";

interface DaySchedule {
  name: string;
  isOpen: boolean;
  from: string;
  to: string;
  scheduleId?: string | number;
  tempClosed?: boolean;
}

export default defineComponent({
  name: "ShopSettingsPage",
  components: {
    AppButton,
    AppNormalText,
    AppIcon,
    AppCheckbox,
    AppTextField,
    AppFileAttachment,
    AppImageLoader,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "User",
        property: "BusinessSchedules",
        method: "GetBusinessSchedules",
        params: [50, 1],
        requireAuth: true,
        ignoreProperty: true,
      },
    ],
  },
  setup() {
    const coverPhotoUrl = ref("");
    const coverPhotoFile = ref<File | null>(null);
    const isSaving = ref(false);
    const hasLoadedOnce = ref(false);
    const updateTrigger = ref(0);
    const BusinessSchedules = ref(Logic.User.BusinessSchedules);

    const schedule = reactive<DaySchedule[]>([
      {
        name: "Mondays",
        isOpen: true,
        from: "10:00",
        to: "18:30",
        tempClosed: false,
      },
      {
        name: "Tuesdays",
        isOpen: true,
        from: "10:00",
        to: "18:30",
        tempClosed: false,
      },
      {
        name: "Wednesdays",
        isOpen: true,
        from: "10:00",
        to: "18:30",
        tempClosed: false,
      },
      {
        name: "Thursdays",
        isOpen: true,
        from: "10:00",
        to: "18:30",
        tempClosed: false,
      },
      {
        name: "Fridays",
        isOpen: true,
        from: "10:00",
        to: "18:30",
        tempClosed: false,
      },
      {
        name: "Saturdays",
        isOpen: true,
        from: "10:00",
        to: "18:30",
        tempClosed: false,
      },
      { name: "Sundays", isOpen: false, from: "", to: "", tempClosed: false },
    ]);

    const handleCoverPhotoUpload = async (photos: any[]) => {
      if (photos && photos.length > 0) {
        coverPhotoUrl.value = photos[0].url;

        // Extract the actual File object from rawValue
        const fileToUpload = photos[0].rawValue;
        coverPhotoFile.value = fileToUpload;

        // Save banner to API
        try {
          const business = Logic.Auth.GetDefaultBusiness();
          if (!business?.id) {
            Logic.Common.showAlert({
              show: true,
              type: "error",
              message: "Business not found",
            });
            return;
          }

          // Pass the File object directly to UpdateBusinessProfile
          // The GraphQL mutation will handle the multipart file upload
          Logic.User.UpdateBusinessProfileForm = {
            business_uuid: business.id,
            banner: fileToUpload,
          };

          const result = await Logic.User.UpdateBusinessProfile();

          if (result) {
            // Refresh auth to get updated banner from API
            await Logic.Auth.GetAuthUser();
            loadSettings();

            Logic.Common.showAlert({
              show: true,
              type: "success",
              message: "Cover photo saved successfully",
            });
          }
        } catch (error) {
          console.error("Error saving cover photo:", error);
          Logic.Common.showAlert({
            show: true,
            type: "error",
            message: "Failed to save cover photo",
          });
        }
      }
    };

    const removeCoverPhoto = () => {
      coverPhotoUrl.value = "";
      coverPhotoFile.value = null;
    };

    const loadSettings = async () => {
      try {
        // Refresh business data to get latest banner
        const business = Logic.Auth.GetDefaultBusiness();

        // Load existing banner/cover photo if available
        if (business?.banner) {
          coverPhotoUrl.value = business.banner;
        } else {
          coverPhotoUrl.value = "";
        }

        const schedulesData = Logic.User.BusinessSchedules;

        if (schedulesData?.data && schedulesData.data.length > 0) {
          // Map API schedules to our schedule array
          schedulesData.data.forEach((apiSchedule) => {
            // day_of_week: 0 = Sunday, 1-6 = Monday-Saturday
            const dayIndex =
              apiSchedule.day_of_week === 0 ? 6 : apiSchedule.day_of_week - 1;

            schedule.forEach((item, dayIndexBase) => {
              if (dayIndexBase === dayIndex) {
                item.tempClosed = true;
                item.isOpen = apiSchedule.is_open;
                item.from = apiSchedule.open_time || "";
                item.to = apiSchedule.close_time || "";
                item.scheduleId = apiSchedule.id; // Store ID for updates
                setTimeout(() => {
                  item.tempClosed = false;
                }, 500);
              }
            });
          });
        }

        // Trigger reactive update
        await nextTick();
        updateTrigger.value++;
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    const getDayOfWeek = (dayName: string): number => {
      const days: { [key: string]: number } = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      };
      return days[dayName.toLowerCase().replace(/s$/, "")] ?? 0;
    };

    const onScheduleTimeChange = async (dayIndex: number) => {
      Logic.Common.debounce(async () => {
        const day = schedule[dayIndex];
        const business = Logic.Auth.GetDefaultBusiness();

        if (!business?.id) {
          Logic.Common.showAlert({
            show: true,
            type: "error",
            message: "Business not found",
          });
          return;
        }

        try {
          const dayOfWeek = getDayOfWeek(day.name);

          // If schedule ID exists, update; otherwise create
          if (day.scheduleId) {
            const updateResult = await Logic.User.UpdateBusinessSchedule({
              id: String(day.scheduleId),
              day_of_week: dayOfWeek,
              is_open: day.isOpen,
              open_time: day.from || null,
              close_time: day.to || null,
            });

            if (!updateResult) {
              throw new Error("Update failed");
            }
          } else {
            const createResult = await Logic.User.CreateBusinessSchedule({
              day_of_week: dayOfWeek,
              is_open: day.isOpen,
              open_time: day.from || null,
              close_time: day.to || null,
            });

            if (!createResult?.id) {
              throw new Error("Create failed");
            }

            day.scheduleId = createResult.id;
          }

          Logic.Common.showAlert({
            show: true,
            type: "success",
            message: "Settings saved successfully",
          });
        } catch (error) {
          console.error("Error updating schedule times:", error);
          Logic.Common.showAlert({
            show: true,
            type: "error",
            message: `Failed to update ${day.name} times`,
          });
        }
      });
    };

    const onScheduleToggleChange = async (dayIndex: number) => {
      const day = schedule[dayIndex];
      const business = Logic.Auth.GetDefaultBusiness();
      const previousState = day.isOpen;

      if (!business?.id) {
        Logic.Common.showAlert({
          show: true,
          type: "error",
          message: "Business not found",
        });
        day.isOpen = previousState;
        return;
      }

      try {
        const dayOfWeek = getDayOfWeek(day.name);

        // If schedule ID exists, update; otherwise create
        if (day.scheduleId) {
          const updateResult = await Logic.User.UpdateBusinessSchedule({
            id: String(day.scheduleId),
            day_of_week: dayOfWeek,
            is_open: day.isOpen,
            open_time: day.isOpen ? day.from || null : null,
            close_time: day.isOpen ? day.to || null : null,
          });

          if (!updateResult) {
            throw new Error("Update failed");
          }
        } else {
          const createResult = await Logic.User.CreateBusinessSchedule({
            day_of_week: dayOfWeek,
            is_open: day.isOpen,
            open_time: day.isOpen ? day.from || null : null,
            close_time: day.isOpen ? day.to || null : null,
          });

          if (!createResult?.id) {
            throw new Error("Create failed");
          }

          day.scheduleId = createResult.id;
        }

        Logic.Common.showAlert({
          show: true,
          type: "success",
          message: `${day.name} ${day.isOpen ? "opened" : "closed"}`,
        });
      } catch (error) {
        console.error("Error updating schedule:", error);
        Logic.Common.showAlert({
          show: true,
          type: "error",
          message: `Failed to update ${day.name}`,
        });
        day.isOpen = previousState;
      }
    };

    onIonViewDidEnter(async () => {
      // Force refresh the business schedules when user returns to this page
      try {
        loadSettings();
      } catch (error) {
        console.error("Error refreshing schedules:", error);
      }
    });

    watch(BusinessSchedules, () => {
      loadSettings();
    });

    onMounted(() => {
      Logic.User.watchProperty("BusinessSchedules", BusinessSchedules);
    });

    return {
      coverPhotoUrl,
      schedule,
      isSaving,
      handleCoverPhotoUpload,
      removeCoverPhoto,
      onScheduleToggleChange,
      onScheduleTimeChange,
      getBottomPadding,
      Logic,
      hasLoadedOnce,
      updateTrigger,
    };
  },
});
</script>
