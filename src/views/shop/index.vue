<template>
  <app-wrapper mobilePadding="!pt-0">
    <default-page-layout
      :title="'Shop'"
      :photoUrl="
        Logic.Auth.GetDefaultBusiness()?.logo || '/images/profile-image.svg'
      "
    >
      <div
        class="w-full flex flex-col items-center h-[80%] justify-start !space-y-[20px]"
      >
        <template v-if="products.length == 0">
          <div class="h-full flex flex-col items-center justify-center">
            <app-empty-state
              icon="empty-products"
              title="List Products"
              description="Your shop is empty; add first product to start selling, attract customers, and grow your shop on the marketplace."
              class="!border-none"
              :buttonData="{
                label: 'Add Product',
                action: () => {
                  Logic.Common.GoToRoute('/shop/products/add');
                },
              }"
            />
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col w-full px-4 pt-2 !pb-[100px]">
            <div
              class="w-full px-4 flex flex-row space-x-1 items-center border-[2px] border-primary py-3 rounded-[12px]"
              @click="Logic.Common.GoToRoute('/shop/products/add')"
            >
              <app-icon name="add-green" custom-class="!h-[24px]" />
              <app-normal-text class="!text-primary !font-[500]">
                Add Product
              </app-normal-text>
            </div>

            <div class="w-full flex flex-col pt-4">
              <div
                class="w-full flex flex-col"
                v-for="(item, index) in products"
                :key="index"
                @click="
                  Logic.Common.GoToRoute('/shop/products/add?uuid=' + item.uuid)
                "
              >
                <app-product :product="item"> </app-product>
              </div>
            </div>
          </div>
        </template>
      </div>
    </default-page-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from "vue";
import {
  DefaultPageLayout,
  AppEmptyState,
  AppProduct,
  AppNormalText,
  AppIcon,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";
import { availableCurrencies } from "../../composable";
import { onIonViewWillEnter } from "@ionic/vue";

export default defineComponent({
  name: "ShopIndexPage",
  components: {
    DefaultPageLayout,
    AppEmptyState,
    AppProduct,
    AppNormalText,
    AppIcon,
  },
  layout: "Dashboard",
  middlewares: {
    fetchRules: [
      {
        domain: "Commerce",
        property: "ManyShopProducts",
        method: "GetShopProducts",
        params: [1, 20],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
    ],
  },
  setup() {
    const AuthUser = ref<User>(Logic.Auth.AuthUser);

    const ManyShopProducts = ref(Logic.Commerce.ManyShopProducts);

    const products = reactive<
      {
        image_url: string;
        title: string;
        category: string;
        stock: number;
        currency_symbol: string;
        price: number;
        uuid: string;
      }[]
    >([]);

    const setProducts = () => {
      products.length = 0;
      ManyShopProducts.value?.data?.forEach((product) => {
        const productImages = JSON.parse(product.images);
        if (productImages.length) {
          const currentCurrency = availableCurrencies.find(
            (item) => item.code === product.currency
          );

          const productImages = JSON.parse(product.images);

          products.push({
            image_url: productImages[0].url,
            title: product.name,
            category: product.category?.name || "uncategorized",
            stock: product.inventoryCount || 0,
            currency_symbol: currentCurrency?.symbol || "$",
            price: product.price,
            uuid: product.uuid,
          });
        }
      });
    };

    watch(ManyShopProducts, () => {
      setProducts();
    });

    onIonViewWillEnter(() => {
      setProducts();
    });

    onMounted(() => {
      Logic.Commerce.watchProperty("ManyShopProducts", ManyShopProducts);
      setProducts();
    });

    return {
      Logic,
      AuthUser,
      products,
    };
  },
});
</script>
<style scoped></style>
