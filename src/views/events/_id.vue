<template>
  <app-wrapper>
    <subpage-layout
      title="Manage Event"
      :hasBottomButton="false"
      :hasExtraRow="true"
    >
      <template #extra-row-content>
        <div
          class="!w-full pt-2 flex flex-row items-center !border-b-[1.5px] overflow-x-auto flex-nowrap !border-[#F0F3F6]"
        >
          <div
            v-for="(item, index) in tabOptions"
            :key="index"
            :class="`px-5 py-3 !pb-2 ${
              selectedTab == item.key ? '!border-b-[2px] !border-[#0A141E]' : ''
            } `"
            @click="selectedTab = item.key"
          >
            <app-normal-text
              :class="`!text-center  ${
                selectedTab == item.key ? '!font-[500]' : '!text-[#999999]'
              }`"
            >
              {{ item.value }}
            </app-normal-text>
          </div>
        </div>
      </template>

      <div class="w-full flex flex-col justify-start h-full pt-3">
        <template v-if="selectedTab == 'about'">
          <about-event :product="SingleProduct" />
        </template>

        <template v-if="selectedTab == 'overview'">
          <overview-event :product="SingleProduct" />
        </template>

        <template v-if="selectedTab == 'attendees'">
          <attendees-event :product="SingleProduct" />
        </template>

        <template v-if="selectedTab == 'revenue'">
          <revenue-event :product="SingleProduct" />
        </template>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 flex flex-col"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div class="w-full grid grid-cols-12 gap-4">
          <div class="col-span-12 flex flex-col" v-if="selectedTab == 'about'">
            <app-button
              variant="primary"
              outlined
              :class="`!py-4 !font-[500] !border-[1.5px]`"
              @click="Logic.Common.GoToRoute(`/events/create?uuid=${SingleProduct?.uuid}`)"
            >
              <div class="flex flex-row items-center">
                <app-icon name="edit-green" custom-class="!h-[22px] mr-2" />
                <app-normal-text class="!font-[500] !text-[#17A068]">
                  Edit
                </app-normal-text>
              </div>
            </app-button>
          </div>
          <div class="col-span-12 flex flex-col" v-else>
            <app-button
              variant="secondary"
              :class="`!py-4 !font-[500] !border-[1.5px]`"
            >
              <div class="flex flex-row items-center">
                <app-icon name="scan-in" custom-class="!h-[22px] mr-2" />
                <app-normal-text class="!font-[500] !text-white">
                  Scan In
                </app-normal-text>
              </div>
            </app-button>
          </div>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppNormalText, AppButton, AppIcon } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import AboutEvent from "../../components/Event/about.vue";
import OverviewEvent from "../../components/Event/overview.vue";
import AttendeesEvent from "../../components/Event/attendees.vue";
import RevenueEvent from "../../components/Event/revenue.vue";
import { ref } from "vue";
import { getBottomPadding } from "../../composable";
import { onMounted } from "vue";

export default defineComponent({
  name: "EventDetailsPage",
  components: {
    AppNormalText,
    AboutEvent,
    AppButton,
    AppIcon,
    OverviewEvent,
    AttendeesEvent,
    RevenueEvent,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Commerce",
        property: "SingleProduct",
        method: "GetProduct",
        params: [],
        requireAuth: true,
        ignoreProperty: true,
        useRouteId: true,
      },
    ],
  },
  setup() {
    const selectedTab = ref("about");

    const showEditButton = ref(true);

    const SingleProduct = ref(Logic.Commerce.SingleProduct);

    const tabOptions = reactive([
      {
        value: "About",
        key: "about",
      },
      {
        value: "Overview",
        key: "overview",
      },
      {
        value: "Attendees",
        key: "attendees",
      },
      {
        value: "Revenue",
        key: "revenue",
      },
    ]);

    onMounted(() => {
      Logic.Commerce.watchProperty("SingleProduct", SingleProduct);
    });

    return {
      Logic,
      tabOptions,
      selectedTab,
      getBottomPadding,
      showEditButton,
      SingleProduct,
    };
  },
});
</script>
