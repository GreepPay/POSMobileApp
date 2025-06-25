<template>
  <div
    class="w-full flex flex-col items-center justify-start h-full space-y-6 pt-1"
  >
    <!-- Content -->
    <div class="w-full flex flex-col h-full">
      <!-- Image Section -->
      <div class="w-full flex flex-col">
        <div
          class="w-full flex flex-col border-b-[1.5px] border-[#F0F3F6] !z-[0]"
        >
          <div class="w-full flex flex-col space-y-2 !z-[0] mb-2">
            <app-swiper
              :free-mode="false"
              :show-pagination="false"
              :space-between="10"
              :slide-per-view="1"
              :currentSlidePosition="currentSlidePosition"
              custom-class="h-[300px]"
              :swiperClass="''"
              v-model="slidePosition"
              id="swiperContainerProducts"
            >
              <swiper-slide
                class="w-full h-full"
                v-for="(image, index) in productSummaryData.images"
                :key="index"
              >
                <app-image-loader
                  :photoUrl="image.url"
                  class="rounded-[12px] h-[300px] w-full border-[1px] border-gray-200 dark:!border-gray-700 cursor-pointer"
                />
              </swiper-slide>
            </app-swiper>

            <div
              class="w-full flex no-scrollbar flex-row space-x-3 flex-nowrap overflow-x-auto scrollbar-hide"
            >
              <div class="flex flex-row py-2 pt-1 pr-4">
                <div
                  class="flex flex-row cursor-pointer pr-2"
                  v-for="(image, index) in productSummaryData.images"
                  :key="index"
                  @click="currentSlidePosition = index"
                  :id="`image${index}`"
                >
                  <app-image-loader
                    :photoUrl="image.url"
                    :class="`rounded-[12px] h-[70px] w-[70px] border-[1.5px] border-gray-200 dark:!border-gray-700 ${
                      currentSlidePosition == index
                        ? '!border-black border-[2px]'
                        : ''
                    }`"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Title Section -->
      <div
        class="w-full flex flex-col pt-4 pb-5 border-b-[1.5px] border-[#F0F3F6]"
      >
        <app-normal-text class="!text-xl !font-semibold !text-left mb-1">
          {{ productSummaryData.name }}
        </app-normal-text>
        <div class="w-full flex flex-row items-center">
          <app-normal-text class="!text-[#999999] !text-left">
            {{ productSummaryData.category }}
          </app-normal-text>

          <span class="h-[4px] w-[4px] bg-primary rounded-full mx-2"></span>

          <app-normal-text class="!text-primary !text-left">
            {{ productSummaryData.stock_quantity }} piece{{
              productSummaryData.stock_quantity > 1 ? "s" : ""
            }}
            left
          </app-normal-text>
        </div>
      </div>

      <!-- Attributes Section -->
      <template
        v-for="(item, index) in productSummaryData.variants"
        :key="index"
      >
        <div
          class="w-full flex flex-col pt-4 pb-4 border-b-[1.5px] border-[#F0F3F6]"
        >
          <app-normal-text class="!text-xl !font-semibold !text-left mb-1">
            {{ item.name }}
          </app-normal-text>
          <div class="w-full flex flex-row flex-wrap">
            <template v-if="item.type == 'color'">
              <div
                class="pr-2 pb-2"
                v-for="(attr, index) in item.values"
                :key="index"
              >
                <div
                  class="border-[1.5px] border-[#E0E2E4] h-[32px] w-[32px] rounded-full"
                  :style="`background-color: ${attr};`"
                ></div>
              </div>
            </template>
            <template v-if="item.type == 'text'">
              <div
                class="pr-2 pb-2"
                v-for="(attr, index) in item.values"
                :key="index"
              >
                <div
                  class="border-[1.5px] border-[#E0E2E4] px-4 py-3 rounded-[10px] flex flex-row items-center justify-center"
                >
                  <app-normal-text class="!text-black !font-[500]">
                    {{ attr }}
                  </app-normal-text>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- Description -->
      <div
        class="w-full flex flex-col pt-4 border-b-[1.5px] border-[#F0F3F6] !pb-[140px]"
      >
        <app-normal-text class="!text-xl !font-semibold !text-left mb-1">
          Description
        </app-normal-text>

        <app-normal-text class="!text-left mb-1 !leading-5">
          {{ productSummaryData.description }}
        </app-normal-text>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { AppImageLoader, AppSwiper, AppNormalText } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { onMounted } from "vue";
import { VariantAttribute } from "../../composable/shop";
import { watch } from "vue";
import { SwiperSlide } from "swiper/vue";

export default defineComponent({
  components: {
    AppSwiper,
    AppImageLoader,
    SwiperSlide,
    AppNormalText,
  },
  props: {},
  name: "ProductSetupSummary",
  setup() {
    const FormValidations = Logic.Form;

    const currentSlidePosition = ref(0);
    const slidePosition = ref(0);

    const productSummaryData = reactive<{
      images: { url: string }[];
      name: string;
      category: string;
      stock_quantity: number;
      price: {
        amount: number;
        currency: string;
        currency_symbol: string;
      };
      variants: VariantAttribute[];
      description: string;
    }>({
      images: [
        {
          url: "/images/temps/product-1.png",
        },
        {
          url: "/images/temps/product-2.png",
        },
        {
          url: "/images/temps/product-3.png",
        },
      ],
      name: "Air Force 1",
      category: "Shoes",
      stock_quantity: 14,
      price: {
        amount: 2000,
        currency: "TRY",
        currency_symbol: "₺",
      },
      variants: [
        {
          name: "Color",
          type: "color",
          count: 2,
          selected: true,
          values: ["#FFFFFF", "#0A141E"],
          deletable: false,
          editable: false,
          key: "color",
        },
        {
          name: "Size",
          type: "text",
          count: 3,
          selected: true,
          values: ["10", "11", "12"],
          deletable: false,
          editable: false,
          key: "size",
        },
        {
          name: "Material",
          type: "text",
          count: 2,
          selected: false,
          values: ["Leather", "Canvas"],
          deletable: false,
          editable: false,
          key: "material",
        },
      ],
      description:
        "The quick brown rabbit jumps over the lazy frogs with no effort.",
    });

    const continueWithForm = () => {
      return productSummaryData;
    };

    watch(slidePosition, () => {
      currentSlidePosition.value = slidePosition.value;
    });

    onMounted(() => {
      //
    });

    return {
      FormValidations,
      Logic,
      continueWithForm,
      productSummaryData,
      currentSlidePosition,
      slidePosition,
    };
  },
});
</script>
