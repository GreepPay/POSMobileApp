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
          <attendees-event :eventTickets="ManyEventTickets?.data" />
        </template>

        <template v-if="selectedTab == 'revenue'">
          <revenue-event :eventTickets="ManyEventTickets?.data" />
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
          <div
            class="col-span-12 grid grid-cols-2 gap-4"
            v-if="selectedTab == 'about'"
          >
            <div class="col-span-1 flex flex-col">
              <app-button
                variant="primary"
                outlined
                :class="`!py-3 !font-[500] !border-[1.5px]`"
                @click="
                  Logic.Common.GoToRoute(
                    `/events/create?uuid=${SingleProduct?.uuid}`
                  )
                "
              >
                <div class="flex flex-row items-center">
                  <app-icon name="edit-green" custom-class="!h-[22px] mr-2" />
                  <app-normal-text class="!font-[500] !text-[#17A068]">
                    Edit
                  </app-normal-text>
                </div>
              </app-button>
            </div>

            <div class="col-span-1 flex flex-col">
              <app-button
                variant="secondary"
                :outlined="SingleProduct?.status == 'active'"
                :class="`!py-4 !font-[500] !border-[1.5px]`"
                @click="toggleProductStatus()"
              >
                {{ SingleProduct?.status == "active" ? "Archive" : "Activate" }}
              </app-button>
            </div>
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
import { ProductStatus } from "@greep/logic/src/gql/graphql";
import { onIonViewWillEnter } from "@ionic/vue";

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
      {
        domain: "Commerce",
        property: "ManyEventTickets",
        method: "GetEventTickets",
        params: [13, 1, 10],
        requireAuth: true,
        ignoreProperty: true,
        useRouteId: false,
      },
    ],
  },
  setup() {
    const selectedTab = ref("about");
    const showEditButton = ref(true);
    const SingleProduct = ref(Logic.Commerce.SingleProduct);
    const ManyEventTickets = ref(Logic.Commerce.ManyEventTickets);
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
        value: "Sales",
        key: "revenue",
      },
    ]);

    const toggleProductStatus = async () => {
      if (SingleProduct.value) {
        const newStatus: ProductStatus =
          SingleProduct.value.status == "active"
            ? ProductStatus.Archived
            : ProductStatus.Active;
        Logic.Commerce.UpdateProductForm = {
          input: {
            id: SingleProduct.value.id,
            status: newStatus,
          },
        };
        Logic.Common.showLoader({
          show: true,
          loading: true,
        });
        await Logic.Commerce.UpdateProduct();
        Logic.Common.showLoader({
          show: true,
          loading: true,
        });
        await Logic.Commerce.GetProduct(SingleProduct.value.uuid || "");
        Logic.Common.showAlert({
          show: true,
          type: "success",
          message:
            newStatus == ProductStatus.Active
              ? "Event activated successfully."
              : "Event archived successfully.",
        });
        Logic.Common.hideLoader();
      }
    };

    onIonViewWillEnter(() => {
      const selectedTabFromQuery = Logic.Common.route?.query?.tab as string;
      if (selectedTabFromQuery) {
        selectedTab.value = selectedTabFromQuery;
      }
    });

    onMounted(() => {
      Logic.Commerce.watchProperty("SingleProduct", SingleProduct);
      Logic.Commerce.watchProperty("ManyEventTickets", ManyEventTickets);
    });

    return {
      Logic,
      tabOptions,
      selectedTab,
      getBottomPadding,
      showEditButton,
      SingleProduct,
      ManyEventTickets,
      toggleProductStatus,
    };
  },
});
</script>
