<template>
    <app-wrapper>
        <subpage-layout title="Shop Settings">
            <div class="w-full flex flex-col justify-start px-4 h-full pt-4 pb-[100px]">
                <!-- Cover Photo Section -->
                <div class="w-full flex flex-col space-y-3 pb-6">
                    <app-normal-text class="!text-black !text-base !font-semibold">
                        Cover Photo
                    </app-normal-text>

                    <app-file-attachment v-if="!coverPhotoUrl" :is-wrapper="true"
                        @update:files-and-url="handleCoverPhotoUpload"
                        :accept="`image/png, image/gif, image/jpeg, image/webp`"
                        class="flex flex-row items-center justify-start !w-full">
                        <template v-slot:content>
                            <div
                                class="w-full h-[156px] bg-gray-500 rounded-[12px] flex flex-col items-center justify-center">
                                <div class="w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center">
                                    <app-icon name="gallery-add" custom-class="!h-[32px]" />
                                </div>
                            </div>
                        </template>
                    </app-file-attachment>

                    <div v-else class="w-full relative">
                        <span class="absolute top-2 right-2 py-2 px-2 bg-white rounded-full cursor-pointer z-10"
                            @click="removeCoverPhoto">
                            <app-icon name="remove-image" custom-class="!h-[24px]" />
                        </span>
                        <app-image-loader :photo-url="coverPhotoUrl" class="w-full h-[156px] rounded-[12px]" />
                    </div>
                </div>

                <!-- Schedule Section -->
                <div class="w-full flex flex-col space-y-4">
                    <app-normal-text class="!text-black !text-base !font-semibold">
                        Schedule
                    </app-normal-text>

                    <!-- Days Schedule -->
                    <div class="w-full flex flex-col space-y-4">
                        <div v-for="(day, index) in schedule" :key="index" class="w-full flex flex-col space-y-3">
                            <!-- Day Toggle (left-aligned) -->
                            <div class="w-full flex flex-row items-center">
                                <!-- toggle on left (bigger) -->
                                <div class="flex items-center -ml-1">
                                    <!-- increased scale and slight negative margin to tuck it closer to the text -->
                                    <app-checkbox v-model="day.isOpen" variant="switch" class="transform scale-150"
                                        @click="onScheduleToggleChange(index)" />
                                </div>
                                <!-- day name + status immediately to the right (tighter gaps) -->
                                <div class="flex flex-row items-center space-x-1">
                                    <app-normal-text class="!text-black !font-semibold !text-[14px] !leading-[24px]">
                                        {{ day.name }}
                                    </app-normal-text>
                                    <app-normal-text :class="day.isOpen ? '!text-green-600' : '!text-gray-400'"
                                        class="!text-[14px] !leading-[24px]">
                                        • {{ day.isOpen ? 'Open' : 'Closed' }}
                                    </app-normal-text>
                                </div>
                            </div>

                            <!-- Time Pickers (shown only when day is open) -->
                            <div v-if="day.isOpen" class="w-full grid grid-cols-12 gap-3">
                                <div class="col-span-6 flex flex-col">
                                    <app-normal-text class="!text-gray-500 !text-sm !mb-2">From</app-normal-text>
                                    <app-text-field :has-title="false" type="time" placeholder="From" v-model="day.from"
                                        @change="onScheduleTimeChange(index)" usePermanentFloatingLabel>
                                        <template #inner-suffix>
                                            <app-icon name="clock" class="h-[20px]" />
                                        </template>
                                    </app-text-field>
                                </div>
                                <div class="col-span-6 flex flex-col">
                                    <app-normal-text class="!text-gray-500 !text-sm !mb-2">To</app-normal-text>
                                    <app-text-field :has-title="false" type="time" placeholder="To" v-model="day.to"
                                        @change="onScheduleTimeChange(index)" usePermanentFloatingLabel>
                                        <template #inner-suffix>
                                            <app-icon name="clock" class="h-[20px]" />
                                        </template>
                                    </app-text-field>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <!-- <div class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 pb-4"
                :style="`${getBottomPadding}`">
                <app-button variant="primary" :class="`!py-4 !w-full`" @click="saveSettings" :loading="isSaving">
                    Save Changes
                </app-button>
            </div> -->
        </subpage-layout>
    </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, watch, nextTick } from "vue";
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
                ignoreProperty: false,
                silentUpdate: true,
            },
        ],
    },
    setup() {
        const coverPhotoUrl = ref("");
        const coverPhotoFile = ref<File | null>(null);
        const isSaving = ref(false);
        const hasLoadedOnce = ref(false);
        const updateTrigger = ref(0);

        const schedule = reactive<DaySchedule[]>([
            { name: "Mondays", isOpen: false, from: "", to: "" },
            { name: "Tuesdays", isOpen: false, from: "", to: "" },
            { name: "Wednesdays", isOpen: false, from: "", to: "" },
            { name: "Thursdays", isOpen: false, from: "", to: "" },
            { name: "Fridays", isOpen: false, from: "", to: "" },
            { name: "Saturdays", isOpen: false, from: "", to: "" },
            { name: "Sundays", isOpen: false, from: "", to: "" },
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

                // Get schedules from the middleware-loaded BusinessSchedules
                const schedulesData = Logic.User.BusinessSchedules;

                if (schedulesData?.data && schedulesData.data.length > 0) {
                    // Map API schedules to our schedule array
                    schedulesData.data.forEach((apiSchedule: any) => {
                        // day_of_week: 0 = Sunday, 1-6 = Monday-Saturday
                        const dayIndex = apiSchedule.day_of_week === 0 ? 6 : apiSchedule.day_of_week - 1;

                        if (schedule[dayIndex]) {
                            schedule[dayIndex].isOpen = apiSchedule.is_open;
                            schedule[dayIndex].from = apiSchedule.open_time || "";
                            schedule[dayIndex].to = apiSchedule.close_time || "";
                            schedule[dayIndex].scheduleId = apiSchedule.id; // Store ID for updates
                        }
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
                "monday": 1,
                "tuesday": 2,
                "wednesday": 3,
                "thursday": 4,
                "friday": 5,
                "saturday": 6,
                "sunday": 0,
            };
            return days[dayName.toLowerCase().replace(/s$/, "")] ?? 0;
        };

        const onScheduleTimeChange = async (dayIndex: number) => {
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
                await Logic.User.GetBusinessSchedules(50, 1);
                loadSettings();
            } catch (error) {
                console.error("Error refreshing schedules:", error);
            }
        });

        onMounted(() => {
            loadSettings();

            // Watch for changes to BusinessSchedules from middleware to force reactive update
            watch(
                () => Logic.User.BusinessSchedules,
                () => {
                    updateTrigger.value++;
                },
                { deep: true }
            );
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
