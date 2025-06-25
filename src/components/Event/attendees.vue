<template>
  <div
    class="w-full flex flex-col items-center justify-start h-full space-y-6 pt-1"
  >
    <!-- Content -->
    <div class="w-full flex flex-col h-full">
      <!-- Filter -->
      <div class="w-full flex flex-row items-center px-4">
        <div
          v-for="(item, index) in filterTabs"
          :key="index"
          :class="`px-4 py-2 flex flex-row items-center rounded-[999px] border-[1.5px] justify-center mr-2 ${
            selectedTab == item.key
              ? '!bg-[#0A141E] !border-[#0A141E]'
              : '!border-[#E0E2E4]'
          }`"
          @click="selectedTab = item.key"
        >
          <app-normal-text
            :class="`${
              selectedTab == item.key
                ? '!font-[500] !text-white'
                : '  !text-[#999999]'
            }`"
          >
            {{ item.value }}
          </app-normal-text>
        </div>
      </div>

      <!-- Attendees -->
      <div class="w-full flex flex-col px-4 !pb-[140px] mt-6">
        <template v-for="(item, index) in attendees" :key="index">
          <div class="w-full flex flex-row items-center mb-4">
            <div class="w-[48px] mr-3">
              <app-image-loader
                :photo-url="item.photo_url"
                class="!w-[48px] !h-[48px] rounded-full"
              />
            </div>

            <div class="w-full flex flex-col">
              <app-normal-text class="!text-sm !font-[500] mb-[3px]">
                {{ item.name }}
              </app-normal-text>

              <app-normal-text class="!text-[#616161] !text-left">
                {{ item.ticket_type }}
              </app-normal-text>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { AppNormalText, AppImageLoader } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { onMounted } from "vue";
import { ref } from "vue";
import { Product } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  components: {
    AppNormalText,
    AppImageLoader,
  },
  props: {
    product: {
      type: Object as () => Product,
    },
  },
  name: "EventAttendees",
  setup() {
    const FormValidations = Logic.Form;

    const selectedTab = ref("attendees");

    const filterTabs = reactive([
      {
        value: "Attendees",
        key: "attendees",
      },
      {
        value: "Checked In",
        key: "checked_in",
      },
    ]);

    const attendees = reactive<
      {
        name: string;
        photo_url: string;
        ticket_type: string;
      }[]
    >([
      {
        name: "Arlene McCoy",
        photo_url: "/images/temps/attendee-1.jpg",
        ticket_type: "Regular",
      },
      {
        name: "Floyd Miles",
        photo_url: "/images/temps/attendee-2.jpg",
        ticket_type: "Regular",
      },
      {
        name: "Ralph Edwards",
        photo_url: "/images/temps/attendee-3.jpg",
        ticket_type: "VIP",
      },
      {
        name: "Jerome Bell",
        photo_url: "/images/temps/attendee-4.jpg",
        ticket_type: "Regular",
      },
      {
        name: "Eleanor Pena",
        photo_url: "/images/temps/attendee-5.jpg",
        ticket_type: "Regular",
      },
    ]);

    const continueWithForm = () => {
      //
    };

    onMounted(() => {
      //
    });

    return {
      FormValidations,
      Logic,
      continueWithForm,
      attendees,
      selectedTab,
      filterTabs,
    };
  },
});
</script>
