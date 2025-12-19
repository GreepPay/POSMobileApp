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
              @click="scanBarcode()"
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

      <teleport to="body">
        <div
          v-if="showMobileQRCode"
          class="w-full h-full fixed top-0 left-0 !bg-black flex flex-col items-center justify-center !z-[999999999999999]"
          style="
            padding-top: calc(env(safe-area-inset-top)) !important;
            padding-bottom: calc(env(safe-area-inset-bottom)) !important;
          "
        >
          <!-- Top section -->
          <div
            class="w-full flex flex-row items-center justify-between absolute top-0 left-0 px-4 py-4"
            style="
              padding-top: calc(env(safe-area-inset-top) + 16px) !important;
            "
          >
            <span
              class="h-[25px] w-[30px]"
              @click="(showMobileQRCode = false), Html5QrcodeInstance?.stop()"
            >
              <app-icon name="close-white" class="h-[25px]" />
            </span>

            <app-normal-text class="!text-white !text-base">
              Scan Ticket QR code
            </app-normal-text>

            <span class="h-[25px] w-[30px] invisible">
              <app-icon name="close-white" class="h-[25px]" />
            </span>
          </div>
          <div id="reader" class="w-full z-[9999999999999] bg-white"></div>
        </div>
      </teleport>

      <app-modal
        v-if="showSuccessfulTicketScanModal"
        :close="
          () => {
            showSuccessfulTicketScanModal = false;
          }
        "
        :contentClass="'!px-0'"
      >
        <div class="w-full flex flex-col items-center pt-4 px-4">
          <img :src="'/images/icons/success-check.svg'" class="!h-[70px]" />

          <div
            class="w-full flex flex-col pt-4 pb-6 px-5 items-center justify-center"
          >
            <app-normal-text
              class="text-center w-full !text-lg !font-semibold pb-2"
            >
              Ticket is valid! User successfully checked in.
            </app-normal-text>
          </div>

          <app-button
            :custom-class="`!bg-secondary !w-full !py-4 !px-8 !text-sm`"
            variant="secondary"
            @click="showSuccessfulTicketScanModal = false"
          >
            Got it
          </app-button>
        </div>
      </app-modal>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppNormalText,
  AppButton,
  AppIcon,
  AppModal,
} from "@greep/ui-components";
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
import { onIonViewDidLeave, onIonViewWillEnter } from "@ionic/vue";
import { Html5Qrcode } from "html5-qrcode";

export default defineComponent({
  name: "EventDetailsPage",
  components: {
    AppNormalText,
    AboutEvent,
    AppButton,
    AppIcon,
    AppModal,
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
        params: [13, 1, 100],
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
    const showMobileQRCode = ref(false);
    const showSuccessfulTicketScanModal = ref(false);
    const Html5QrcodeInstance = ref<Html5Qrcode>();
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

    const onScanSuccess = async (decodedText: any) => {
      // handle the scanned code as you like, for example:
      if (Logic.Common.loaderSetup.loading) {
        return;
      }

      if (decodedText) {
        const ticketUuid: string = decodedText.trim();
        if (ticketUuid.length == 36) {
          showMobileQRCode.value = false;
          Html5QrcodeInstance.value?.stop();

          Logic.Common.showLoader({
            show: true,
            loading: true,
          });

          try {
            await Logic.Commerce.ScanInTicket(
              ticketUuid + "_" + SingleProduct.value?.uuid
            );
            showSuccessfulTicketScanModal.value = true;
            Logic.Commerce.GetProduct(SingleProduct.value?.uuid || "");
            Logic.Common.hideLoader();
          } finally {
            Logic.Common.hideLoader();
          }
        } else {
          Logic.Common.showAlert({
            show: true,
            type: "error",
            message: "Unable to validate Ticket QR code.",
          });
        }
      }
    };

    const onScanFailure = () => {
      // if (error instanceof Error) {
      //   Logic.Common.showAlert({
      //     show: true,
      //     type: "error",
      //     message: error.message,
      //   });
      // } else {
      //   Logic.Common.showAlert({
      //     show: true,
      //     type: "error",
      //     message: "Unknown error occurred while scanning",
      //   });
      // }
    };

    const scanBarcode = async () => {
      showMobileQRCode.value = true;
      setTimeout(() => {
        Html5QrcodeInstance.value = new Html5Qrcode("reader");

        const config = { fps: 60, qrbox: { width: 250, height: 250 } };

        // If you want to prefer back camera
        Html5QrcodeInstance.value.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanFailure
        );
      }, 300);
    };

    onIonViewWillEnter(() => {
      const selectedTabFromQuery = Logic.Common.route?.query?.tab as string;
      if (selectedTabFromQuery) {
        selectedTab.value = selectedTabFromQuery;
      }
    });

    onIonViewDidLeave(async () => {
      await Html5QrcodeInstance.value?.stop();
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
      showMobileQRCode,
      Html5QrcodeInstance,
      showSuccessfulTicketScanModal,
      scanBarcode,
      toggleProductStatus,
    };
  },
});
</script>
