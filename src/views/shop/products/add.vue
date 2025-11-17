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
      <template #top-right-section v-if="isEdit">
        <div class="flex flex-col">
          <app-button
            variant="secondary"
            :outlined="SingleProduct?.status == 'active'"
            :class="`!py-1 !font-[500] !border-[1.5px] !w-fit`"
            @click="toggleProductStatus()"
          >
            {{ SingleProduct?.status == "active" ? "Archive" : "Activate" }}
          </app-button>
        </div>
      </template>
      <div
        class="w-full flex flex-col items-center justify-start h-full px-4 py-3 pt-2"
        v-if="!hidePageContent"
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
            <product-info ref="productInfoRef" :data="fullProductData" />
          </template>

          <template v-if="currentPage == 'product_variant'">
            <product-variants ref="productVariantRef" :data="fullProductData" />
          </template>

          <template v-if="currentPage == 'product_inventory'">
            <product-inventory
              ref="productInventoryRef"
              :data="fullProductData"
            />
          </template>
        </template>

        <template v-else>
          <product-summary ref="productSummaryRef" :data="fullProductData" />
        </template>

        <!-- Spacer -->
        <div class="py-[60px] w-full"></div>
      </div>
    </app-onboarding-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import {
  AppOnboardingLayout,
  AppNormalText,
  AppButton,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import ProductInfo from "../../../components/Product/product-info.vue";
import ProductVariants from "../../../components/Product/product-variants.vue";
import ProductInventory from "../../../components/Product/product-inventory.vue";
import ProductSummary from "../../../components/Product/product-summary.vue";
import { onMounted } from "vue";
import { StatusBar, Style } from "@capacitor/status-bar";
import { computed } from "vue";
import { getPlatforms, onIonViewWillEnter } from "@ionic/vue";
import { watch } from "vue";
import { BaseProductSummary, VariantAttribute } from "../../../composable/shop";
import {
  DigitalProductInput,
  LicenseType,
  PhysicalProductInput,
  ProductStatus,
  ProductType,
  ProductVariantInput,
  ShippingClass,
} from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "AddProductPage",
  components: {
    ProductInfo,
    AppOnboardingLayout,
    AppNormalText,
    AppButton,
    ProductVariants,
    ProductInventory,
    ProductSummary,
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

    const currentPage = ref("product_info");
    const SingleProduct = ref(Logic.Commerce.SingleProduct);

    const hidePageContent = ref(false);

    const showSummary = ref(false);

    const isEdit = ref(false);

    const fullProductData = reactive<BaseProductSummary>({
      name: "",
      category: "",
      descriptions: "",
      photos: [],
      stock: 0,
      price: "0",
      variants: [],
      currency: "",
      type: "physical",
      cuisineCountry: "",
      isNationalCuisine: false,
    });

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
              const formData = productInfoRef.value?.continueWithForm();

              if (formData) {
                fullProductData.name = formData.name;
                fullProductData.category = formData.category;
                fullProductData.descriptions = formData.descriptions;
                fullProductData.photos = formData.photos;
                fullProductData.type = formData.type;
                fullProductData.cuisineCountry = formData.cuisineCountry;
                fullProductData.isNationalCuisine = formData.isNationalCuisine;

                currentPage.value = "product_variant";
              }
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
              const formData = productVariantRef.value?.continueWithForm();

              if (formData) {
                fullProductData.variants = formData;
                currentPage.value = "product_inventory";
              }
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
              const formData = productInventoryRef.value?.continueWithForm();

              if (formData) {
                fullProductData.stock = formData.stock;
                fullProductData.price = formData.price;
                fullProductData.currency = formData.currency;

                showSummary.value = true;
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
          const productVariants: ProductVariantInput[] = [];

          fullProductData.variants.forEach((variant) => {
            productVariants.push({
              id: Logic.Common.makeid(16),
              attributes:
                variant.values?.map((value) => ({
                  key: variant.key,
                  value: value,
                })) || [],
              images: "empty",
              priceAdjustment: parseFloat(fullProductData.price),
              sku: variant.name,
              inventory: parseInt(fullProductData.stock?.toString()),
            });
          });

          const physicalData: PhysicalProductInput = {
            weight: 0,
            dimensions: {
              height: 0,
              length: 0,
              width: 0,
            },
            inventory: {
              isBackorderAllowed: false,
              lowStockThreshold: 0,
              stock: parseInt(fullProductData.stock?.toString()),
            },
            shippingClass: ShippingClass.Standard,
            type: "standard",
          };

          const digitalGoodData: DigitalProductInput = {
            download: {
              url: "",
              accessExpiration: "never",
              downloadLimit: 10,
            },
            fileInfo: {
              format: "",
              size: 0,
            },
            type: "standard",
            license: {
              key: "",
              type: LicenseType.Single,
            },
          };

          if (isEdit.value) {
            Logic.Commerce.UpdateProductForm = {
              input: {
                id: parseInt(SingleProduct.value?.id.toString() || "0"),
                businessId: parseInt(Logic.Auth.GetDefaultBusiness().id),
                categoryIds: [fullProductData.category],
                currency: fullProductData.currency,
                description: fullProductData.descriptions,
                name: fullProductData.name,
                price: parseFloat(fullProductData.price),
                sku: Logic.Common.makeid(10),
                status: ProductStatus.Active,
                tags: [],
                type:
                  fullProductData.type == "digital"
                    ? ProductType.Digital
                    : ProductType.Physical,
                images: fullProductData.photos.map((photo: any) => {
                  return {
                    url: photo.url.includes("https") ? photo.url : "",
                    rawValue: photo.rawValue ? photo.rawValue : undefined,
                  };
                }),
                variants: productVariants,
                physicalDetails:
                  fullProductData.type == "physical" ? physicalData : undefined,
                digitalDetails:
                  fullProductData.type == "digital"
                    ? digitalGoodData
                    : undefined,
                inventoryCount: parseInt(fullProductData.stock?.toString()),
                national_cuisine: fullProductData.isNationalCuisine || false,
                national_cuisine_country:
                  fullProductData.cuisineCountry || null,
              },
            };
          } else {
            Logic.Commerce.CreateProductForm = {
              input: {
                businessId: parseInt(Logic.Auth.GetDefaultBusiness().id),
                categoryIds: [fullProductData.category],
                currency: fullProductData.currency,
                description: fullProductData.descriptions,
                name: fullProductData.name,
                price: parseFloat(fullProductData.price),
                sku: Logic.Common.makeid(10),
                status: ProductStatus.Active,
                tags: [],
                type:
                  fullProductData.type == "digital"
                    ? ProductType.Digital
                    : ProductType.Physical,
                images: fullProductData.photos.map((photo: any) => {
                  return {
                    url: photo.url.includes("https") ? photo.url : "",
                    rawValue: photo.rawValue ? photo.rawValue : undefined,
                  };
                }),
                variants: productVariants,
                physicalDetails:
                  fullProductData.type == "physical" ? physicalData : undefined,
                digitalDetails:
                  fullProductData.type == "digital"
                    ? digitalGoodData
                    : undefined,
                inventoryCount: parseInt(fullProductData.stock?.toString()),
                national_cuisine: fullProductData.isNationalCuisine || false,
                national_cuisine_country:
                  fullProductData.cuisineCountry || null,
              },
            };
          }

          if (summaryCurrentPage.action_btn.loading) return;

          summaryCurrentPage.action_btn.loading = true;

          const action = isEdit.value
            ? Logic.Commerce.UpdateProduct()
            : Logic.Commerce.CreateProduct();

          action?.then(() => {
            summaryCurrentPage.action_btn.loading = false;

            Logic.Common.showAlert({
              show: true,
              message: isEdit.value
                ? "Product updated successfully."
                : "Product added successfully.",
              type: "success",
            });

            showSummary.value = false;

            Logic.Common.GoToRoute("/shop");
          });
        },
        is_disabled: false,
        loading: false,
      },
    });

    const currentPlatform = computed(() => {
      return getPlatforms()[0];
    });

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
              ? "Product activated successfully."
              : "Product archived successfully.",
        });
        Logic.Common.hideLoader();
      }
    };

    const initializeForm = () => {
      if (Logic.Common.route?.query?.uuid?.toString()) {
        isEdit.value = true;
        pageSettings.main_title = "Update Product";
        summaryCurrentPage.action_btn.label = "Update Product";
      } else {
        isEdit.value = false;
        Logic.Commerce.SingleProduct = undefined;
        SingleProduct.value = undefined;
        pageSettings.main_title = "Add a product";
        hidePageContent.value = false;
      }

      if (isEdit.value) {
        hidePageContent.value = true;
        const productData = SingleProduct.value;
        const images: { url: string }[] = JSON.parse(
          productData?.images || "[]"
        );
        fullProductData.name = productData?.name || "";
        fullProductData.category = productData?.category?.name || "";
        fullProductData.descriptions = productData?.description || "";
        fullProductData.photos =
          images?.map((item) => {
            return {
              url: item.url,
              rawValue: "",
            };
          }) || [];
        fullProductData.type =
          productData?.type == ProductType.Digital ? "digital" : "physical";
        fullProductData.stock = productData?.inventoryCount || 0;
        fullProductData.price = parseFloat(
          productData?.price.toString() || "0"
        ).toString();
        fullProductData.currency =
          productData?.currency ||
          Logic.Auth.GetDefaultBusiness().default_currency;

        const productVariants: ProductVariantInput[] = JSON.parse(
          productData?.variants || "[]"
        );
        fullProductData.variants =
          productVariants?.map((variant) => {
            return {
              name: variant.sku || "",
              key: variant.attributes[0]?.key || "",
              values: variant.attributes.map((attr) => attr.value) || [],
              count: variant.attributes.length,
              deletable: true,
              editable: true,
              selected: true,
              type: variant.attributes[0]?.key == "color" ? "color" : "text",
            } as VariantAttribute;
          }) || [];

        fullProductData.isNationalCuisine =
          productData?.national_cuisine || false;
        fullProductData.cuisineCountry =
          productData?.national_cuisine_country || "";

        setTimeout(() => {
          hidePageContent.value = false;
        }, 200);
      } else {
        fullProductData.name = "";
        fullProductData.category = "";
        fullProductData.descriptions = "";
        fullProductData.photos = [];
        fullProductData.type = "physical";
        fullProductData.stock = 0;
        fullProductData.price = "0";
        fullProductData.currency =
          Logic.Auth.GetDefaultBusiness().default_currency || "USD";
        fullProductData.variants = [];
        fullProductData.cuisineCountry = "";
        fullProductData.isNationalCuisine = false;
      }
    };

    watch(currentPage, () => {
      showSummary.value = false;
    });

    onIonViewWillEnter(() => {
      initializeForm();
      showSummary.value = false;
      currentPage.value = "product_info";
    });

    onMounted(() => {
      Logic.Commerce.watchProperty("SingleProduct", SingleProduct);
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
      fullProductData,
      isEdit,
      hidePageContent,
      toggleProductStatus,
      SingleProduct,
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
