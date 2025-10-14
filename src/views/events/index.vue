<template>
  <app-wrapper mobilePadding="!pt-0">
    <default-page-layout
      :title="'Events'"
      :photoUrl="
        Logic.Auth.GetDefaultBusiness()?.logo || '/images/profile-image.svg'
      "
    >
      <div
        class="w-full flex flex-col items-center h-[80%] justify-start !space-y-[20px]"
      >
        <template v-if="events.length == 0">
          <div class="h-full flex flex-col items-center justify-center">
            <app-empty-state
              icon="empty-events"
              title="Run Events With Ease"
              description="Create and promote events; offer paid or free tickets, track sales, and handle entry with built-in ticket scanning."
              class="!border-none"
              :buttonData="{
                label: 'Create Event',
                action: () => {
                  Logic.Common.GoToRoute('/events/create');
                },
              }"
            />
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col w-full px-4 pt-2 !pb-[100px]">
            <div
              class="w-full px-4 flex flex-row space-x-1 items-center border-[1.5px] border-primary py-3 rounded-[12px]"
              @click="Logic.Common.GoToRoute('/events/create')"
            >
              <app-icon name="add-green" custom-class="!h-[24px]" />
              <app-normal-text class="!text-primary !font-[500]">
                New Event
              </app-normal-text>
            </div>

            <div class="w-full flex flex-col pt-4">
              <div
                class="w-full flex flex-col"
                v-for="(item, index) in events"
                :key="index"
                @click="Logic.Common.GoToRoute('/events/' + item.uuid)"
              >
                <app-event :event="item"> </app-event>
              </div>
            </div>
          </div>
        </template>
      </div>
    </default-page-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  DefaultPageLayout,
  AppEmptyState,
  AppEvent,
  AppIcon,
  AppNormalText,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { onMounted } from "vue";
import { withdrawalAvailableCurrencies } from "../../composable";
import { ProductVariantInput } from "@greep/logic/src/gql/graphql";
import { onIonViewWillEnter } from "@ionic/vue";

export default defineComponent({
  name: "EventsIndexPage",
  components: {
    DefaultPageLayout,
    AppEmptyState,
    AppEvent,
    AppIcon,
    AppNormalText,
  },
  layout: "Dashboard",
  middlewares: {
    fetchRules: [
      {
        domain: "Commerce",
        property: "ManyEventProducts",
        method: "GetEventProducts",
        params: [1, 20],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
    ],
  },
  setup() {
    const ManyEventProducts = ref(Logic.Commerce.ManyEventProducts);
    const AuthUser = ref(Logic.Auth.AuthUser);

    const events = reactive<
      {
        image_url: string;
        title: string;
        sub_titles: string[];
        location: string;
        uuid: string;
      }[]
    >([]);

    const setProducts = () => {
      events.length = 0; 
      ManyEventProducts.value?.data?.forEach((product,  ) => { 
        const productImages = JSON.parse(product.images);
        if (productImages.length) {
        const currentCurrency = withdrawalAvailableCurrencies.find(
          (item) => item.code === product.currency
        );

        const productVariants: ProductVariantInput[] = JSON.parse(
          product.variants
        );

        const variantWithLowestPrice = productVariants.reduce(
          (acc: ProductVariantInput, variant: ProductVariantInput) => {
            if (!acc || variant.priceAdjustment < acc.priceAdjustment)
              return variant;
            return acc;
          }
        ).priceAdjustment;

        const amount = `${currentCurrency?.symbol}${Logic.Common.convertToMoney(
          variantWithLowestPrice,
          false,
          ""
        )}`;

        const productImages = JSON.parse(product.images);

        events.push({
          image_url: productImages[0].url,
          title: product.name,
          location: product.eventOnlineUrl ? "Online" : product.venueName || "",
          sub_titles: [
            `From ${amount}`,
            Logic.Common.fomartDate(
              product.eventStartDate || "",
              "ddd, DD MMM"
            ),
            Logic.Common.fomartDate(product.eventEndDate || "", "hA"),
          ],
          uuid: product.uuid,
        }); 
        }
      });  
    };

    onIonViewWillEnter(() => {
      setProducts();
    });

    onMounted(() => {
      Logic.Commerce.watchProperty("ManyEventProducts", ManyEventProducts);
      Logic.Auth.watchProperty("AuthUser", AuthUser);
    });

    return {
      Logic,
      events,
      AuthUser,
    };
  },
});
</script>
<style scoped></style>
