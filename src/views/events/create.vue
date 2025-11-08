<template>
  <app-wrapper mobilePadding="!pt-0">
    <app-onboarding-layout
      v-model="currentPage"
      :page-setting="pageSettings"
      :topPadding="`${currentPlatform === 'android' ? '!pt-6 !pb-0' : '!pb-0'}`"
      variant="white"
    >
      <div
        class="w-full flex flex-col items-center justify-start h-full px-4 py-3 pt-2"
      >
        <div class="w-full flex flex-col mb-2">
          <app-normal-text class="!text-sm !font-[500]">
            {{
              pageSettings.pages?.find((item) => item.key == currentPage)?.title
            }}
          </app-normal-text>
        </div>

        <template v-if="currentPage == 'event_details'">
          <add-event-details ref="eventDetailsRef" :product="SingleProduct" />
        </template>

        <template v-if="currentPage == 'event_tickets'">
          <add-event-tickets ref="eventTicketsRef" :product="SingleProduct" />
        </template>

        <!-- Spacer -->
        <div class="py-[160px] w-full h-[80px]"></div>
      </div>
    </app-onboarding-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { AppOnboardingLayout, AppNormalText } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { onMounted } from "vue";
import { StatusBar, Style } from "@capacitor/status-bar";
import { computed } from "vue";
import AddEventDetails from "../../components/Event/Create/details.vue";
import AddEventTickets from "../../components/Event/Create/list-tickets.vue";
import { getPlatforms, onIonViewWillEnter } from "@ionic/vue";
import { watch } from "vue";
import {
  EventType,
  ProductStatus,
  ProductType,
  ProductVariantInput,
} from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "CreateEventPage",
  components: {
    AppOnboardingLayout,
    AppNormalText,
    AddEventDetails,
    AddEventTickets,
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
        useRouteQuery: true,
        queries: ["uuid"],
        condition: {
          routeSearchItem: "fullPath",
          searchQuery: "uuid",
        },
      },
    ],
  },
  setup() {
    const FormValidations = Logic.Form;

    const currentPage = ref("event_details");
    const SingleProduct = ref(Logic.Commerce.SingleProduct);

    const isEdit = ref(false);

    const showSummary = ref(false);

    const eventDetailsRef = ref<any>(null);
    const eventTicketsRef = ref<any>(null);

    const pageSettings = reactive({
      main_title: "New Event",
      pages: [
        {
          title: "Event Details",
          key: "event_details",
          action_btn: {
            label: "Next",
            handler: () => {
              const formData = eventDetailsRef.value?.continueWithForm();

              if (formData) {
                const eventDateFromString = formData.date + " " + formData.time;

                if (isEdit.value) {
                  Logic.Commerce.UpdateProductForm = {
                    input: {
                      id: parseInt(SingleProduct.value?.id.toString() || "0"),
                      categoryIds: [],
                      currency: "USD",
                      description: formData.descriptions,
                      name: formData.name,
                      price: 0,
                      sku: Logic.Common.makeid(10),
                      status: ProductStatus.Active,
                      tags: [],
                      type: ProductType.Event,
                      images: formData.photos.map((photo: any) => {
                        return {
                          url: photo.url.includes("https") ? photo.url : "",
                          rawValue: photo.rawValue ? photo.rawValue : undefined,
                        };
                      }),
                      eventDetails: {
                        eventType: formData.is_online
                          ? EventType.Online
                          : EventType.Offline,
                        eventDetails: {
                          startDate: eventDateFromString,
                          endDate: eventDateFromString,
                          registeredCount: 0,
                          waitlistEnabled: false,
                          capacity: 0,
                          location: {
                            address: JSON.stringify(formData.address_info),
                            city: "empty",
                            country: "empty",
                          },
                          venueName: formData.address_info.name,
                          onlineUrl: formData.online_link,
                        },
                        type: formData.is_online
                          ? EventType.Online
                          : EventType.Offline,
                      },
                    },
                  };
                } else {
                  Logic.Commerce.CreateProductForm = {
                    input: {
                      businessId: parseInt(Logic.Auth.GetDefaultBusiness().id),
                      categoryIds: [],
                      currency: "USD",
                      description: formData.descriptions,
                      name: formData.name,
                      price: 0,
                      sku: Logic.Common.makeid(10),
                      status: ProductStatus.Active,
                      tags: [],
                      type: ProductType.Event,
                      images: formData.photos.map((photo: any) => {
                        return {
                          url: photo.url.includes("https") ? photo.url : "",
                          rawValue: photo.rawValue ? photo.rawValue : undefined,
                        };
                      }),
                      eventDetails: {
                        eventType: formData.is_online
                          ? EventType.Online
                          : EventType.Offline,
                        eventDetails: {
                          startDate: eventDateFromString,
                          endDate: eventDateFromString,
                          registeredCount: 0,
                          waitlistEnabled: false,
                          capacity: 0,
                          location: {
                            address: JSON.stringify(formData.address_info),
                            city: "empty",
                            country: "empty",
                          },
                          venueName: formData.address_info.name,
                          onlineUrl: formData.online_link,
                        },
                        type: formData.is_online
                          ? EventType.Online
                          : EventType.Offline,
                      },
                    },
                  };
                }

                currentPage.value = "event_tickets";
              }
            },
            is_disabled: false,
            loading: false,
          },
        },
        {
          title: "List tickets",
          key: "event_tickets",
          action_btn: {
            label: "Next",
            handler: async () => {
              const formData = eventTicketsRef.value?.continueWithForm();

              if (
                formData &&
                (isEdit.value
                  ? Logic.Commerce.UpdateProductForm
                  : Logic.Commerce.CreateProduct)
              ) {
                const fullCapacity = formData.unlimited_tickets
                  ? 100000000
                  : formData.ticket_quantities;

                if (
                  isEdit.value &&
                  Logic.Commerce.UpdateProductForm?.input.eventDetails
                    ?.eventDetails
                ) {
                  Logic.Commerce.UpdateProductForm.input.eventDetails.eventDetails.capacity =
                    fullCapacity;
                }

                if (
                  !isEdit.value &&
                  Logic.Commerce.CreateProductForm?.input.eventDetails
                    ?.eventDetails
                ) {
                  Logic.Commerce.CreateProductForm.input.eventDetails.eventDetails.capacity =
                    fullCapacity;
                }

                if (!isEdit.value && Logic.Commerce.CreateProductForm?.input) {
                  Logic.Commerce.CreateProductForm.input.currency =
                    formData.currency;
                  Logic.Commerce.CreateProductForm.input.inventoryCount =
                    fullCapacity;
                }

                if (isEdit.value && Logic.Commerce.UpdateProductForm?.input) {
                  Logic.Commerce.UpdateProductForm.input.currency =
                    formData.currency;
                  Logic.Commerce.UpdateProductForm.input.inventoryCount =
                    fullCapacity;
                }

                const productVariants: ProductVariantInput[] = [];

                formData.tickets.forEach(
                  (ticket: {
                    name: string;
                    price: string;
                    color: string;
                    is_vote: boolean;
                    image_url: string;
                  }) => {
                    productVariants.push({
                      id: Logic.Common.makeid(16),
                      attributes: [
                        {
                          key: "color",
                          value: ticket.color || "",
                        },
                        {
                          key: "is_vote",
                          value: ticket.is_vote ? "yes" : "no",
                        },
                        {
                          key: "image_url",
                          value: ticket.image_url || "empty",
                        },
                      ],
                      images: "empty",
                      priceAdjustment: parseFloat(ticket.price),
                      sku: ticket.name,
                      inventory: fullCapacity,
                    });
                  }
                );

                if (!isEdit.value) {
                  if (Logic.Commerce.CreateProductForm) {
                    Logic.Commerce.CreateProductForm.input.variants =
                      productVariants;
                  }
                } else {
                  if (Logic.Commerce.UpdateProductForm) {
                    Logic.Commerce.UpdateProductForm.input.variants =
                      productVariants;
                  }
                }

                if (pageSettings.pages[1].action_btn.loading) {
                  return;
                }

                pageSettings.pages[1].action_btn.loading = true;

                try {
                  const eventProduct = isEdit.value
                    ? await Logic.Commerce.UpdateProduct()
                    : await Logic.Commerce.CreateProduct();

                  Logic.Common.showAlert({
                    show: true,
                    message: isEdit.value
                      ? "Product updated successfully"
                      : "Product created successfully",
                    type: "success",
                  });
                  if (eventProduct) {
                    Logic.Common.GoToRoute(
                      "/events/" + eventProduct.uuid + "?backRoute=/events"
                    );
                  }
                } catch (error) {
                  console.error(error);
                } finally {
                  pageSettings.pages[1].action_btn.loading = false;
                }
              }
            },
            is_disabled: false,
            loading: false,
          },
        },
      ],
    });

    const summaryCurrentPage = reactive({
      title: "Product Preview",
      key: "product_preview",
      action_btn: {
        label: "Add Product",
        handler: () => {
          //
        },
        is_disabled: false,
        loading: false,
      },
    });

    const currentPlatform = computed(() => {
      return getPlatforms()[0];
    });

    const initializeForm = () => {
      if (Logic.Common.route?.query?.uuid?.toString()) {
        isEdit.value = true;
        pageSettings.main_title = "Update Event";
      } else {
        isEdit.value = false;
        Logic.Commerce.SingleProduct = undefined;
        SingleProduct.value = undefined;
        pageSettings.main_title = "New Event";
      }
    };

    watch(currentPage, () => {
      showSummary.value = false;
    });

    onIonViewWillEnter(() => {
      initializeForm();
    });

    onMounted(() => {
      initializeForm();
      StatusBar.setBackgroundColor({ color: "#ffffff" }); // any hex color
      StatusBar.setStyle({ style: Style.Light }); // Light or Dark
      Logic.Commerce.watchProperty("SingleProduct", SingleProduct);
    });

    return {
      FormValidations,
      Logic,
      currentPage,
      pageSettings,
      currentPlatform,
      eventDetailsRef,
      eventTicketsRef,
      showSummary,
      summaryCurrentPage,
      SingleProduct,
      isEdit,
    };
  },
  data() {
    return {
      parentRefs: null,
    };
  },
  mounted() {
    const parentRefs: any = this.$refs;
    this.parentRefs = parentRefs;
  },
});
</script>
