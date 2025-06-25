<template>
  <app-wrapper mobilePadding="!pt-0">
    <app-onboarding-layout
      v-model="currentPage"
      :page-setting="pageSettings"
      :topPadding="`${currentPlatform === 'android' ? '!pt-6 !pb-0' : '!pb-0'}`"
      variant="white"
      :hideElements="showSummary"
      fallBackTitle="Product Preview"
      :fall-back-page="summaryCurrentPage"
    >
      <div
        class="w-full flex flex-col items-center justify-start h-full px-4 py-3 pt-2"
      >
        <template v-if="!showSummary">
          <div class="w-full flex flex-col mb-2">
            <app-normal-text class="!text-sm">
              {{
                pageSettings.pages?.find((item) => item.key == currentPage)
                  ?.title
              }}
            </app-normal-text>
          </div>

          <template v-if="currentPage == 'product_info'">
            <product-info ref="productInfoRef" />
          </template>

          <template v-if="currentPage == 'product_variant'">
            <product-variants ref="productVariantRef" />
          </template>

          <template v-if="currentPage == 'product_inventory'">
            <product-inventory ref="productInventoryRef" />
          </template>
        </template>

        <template v-else>
          <product-summary ref="productSummaryRef" />
        </template>

        <!-- Spacer -->
        <div class="py-[60px] w-full"></div>
      </div>
    </app-onboarding-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { AppOnboardingLayout, AppNormalText } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import ProductInfo from "../../../components/Product/product-info.vue";
import ProductVariants from "../../../components/Product/product-variants.vue";
import ProductInventory from "../../../components/Product/product-inventory.vue";
import ProductSummary from "../../../components/Product/product-summary.vue";
import { onMounted } from "vue";
import { StatusBar, Style } from "@capacitor/status-bar";
import { computed } from "vue";
import { getPlatforms } from "@ionic/vue";
import { watch } from "vue";

export default defineComponent({
  name: "AddProductPage",
  components: {
    ProductInfo,
    AppOnboardingLayout,
    AppNormalText,
    ProductVariants,
    ProductInventory,
    ProductSummary,
  },
  setup() {
    const FormValidations = Logic.Form;

    const currentPage = ref("product_info");

    const showSummary = ref(false);

    const productInfoRef = ref<any>(null);
    const productVariantRef = ref<any>(null);
    const productInventoryRef = ref<any>(null);
    const productSummaryRef = ref<any>(null);

    const pageSettings = reactive({
      main_title: "Add a product",
      pages: [
        {
          title: "Product Information",
          key: "product_info",
          action_btn: {
            label: "Next",
            handler: () => {
              currentPage.value = "product_variant";
            },
            is_disabled: false,
            loading: false,
          },
        },
        {
          title: "Product Variant",
          key: "product_variant",
          action_btn: {
            label: "Next",
            handler: () => {
              currentPage.value = "product_inventory";
            },
            is_disabled: false,
            loading: false,
          },
        },
        {
          title: "Product Inventory",
          key: "product_inventory",
          action_btn: {
            label: "Preview",
            handler: () => {
              showSummary.value = true;
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
      //
    };

    watch(currentPage, () => {
      showSummary.value = false;
    });

    onMounted(() => {
      initializeForm();
      onMounted(() => {
        StatusBar.setBackgroundColor({ color: "#ffffff" }); // any hex color
        StatusBar.setStyle({ style: Style.Light }); // Light or Dark
      });
    });

    return {
      FormValidations,
      Logic,
      currentPage,
      pageSettings,
      currentPlatform,
      productInfoRef,
      productVariantRef,
      productInventoryRef,
      productSummaryRef,
      showSummary,
      summaryCurrentPage,
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
