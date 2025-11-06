<template>
  <div
    class="w-full flex flex-col items-center justify-start h-full space-y-6 pt-1"
  >
    <!-- Content -->
    <div class="w-full flex flex-col h-full">
      <!-- Image Section -->
      <div class="w-full flex flex-col px-4">
        <div class="w-full flex flex-col !z-[0]">
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
                v-for="(image, index) in eventData.images"
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
                  v-for="(image, index) in eventData.images"
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

      <!-- Summary -->
      <div
        class="w-full flex flex-col mt-1 pt-4 !border-t-[10px] !border-[#F0F3F6] !pb-4 px-4"
      >
        <app-normal-text class="!text-xl !font-semibold !text-left mb-1">
          {{ eventData.name }}
        </app-normal-text>

        <div class="w-full flex flex-col pt-2">
          <div class="w-full flex flex-row items-center mb-2">
            <app-icon name="event/calendar" custom-class="!h-[22px] mr-2" />

            <app-normal-text class="!text-left !text-[#616161]">
              {{ eventData.event_date }}
            </app-normal-text>
          </div>
          <div class="w-full flex flex-row items-center mb-2">
            <app-icon name="event/clock" custom-class="!h-[22px] mr-2" />

            <app-normal-text class="!text-left !text-[#616161]">
              {{ eventData.event_time }}
            </app-normal-text>
          </div>
          <div class="w-full flex flex-row items-center mb-2">
            <div class="!w-[25px]">
              <app-icon name="event/location" custom-class="!h-[22px]" />
            </div>

            <app-normal-text class="!text-left !text-[#616161] pl-1">
              {{ eventData.place }}
            </app-normal-text>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div
        class="w-full flex flex-col pt-4 !border-t-[10px] !border-[#F0F3F6] px-4 !pb-4"
      >
        <app-normal-text class="!text-xl !font-semibold !text-left mb-1">
          Description
        </app-normal-text>

        <app-normal-text class="!text-left mb-1 !leading-5 !text-[#616161]">
          {{ eventData.description }}
        </app-normal-text>
      </div>

      <!-- Location -->

      <div
        class="w-full flex flex-col pt-4 !border-t-[10px] !border-[#F0F3F6] !pb-4 px-4"
      >
        <app-normal-text class="!text-xl !font-semibold !text-left mb-1">
          Location
        </app-normal-text>

        <app-normal-text
          class="!text-left mb-1 !leading-5 !text-[#616161] !line-clamp-1"
        >
          {{ eventData.location }}
        </app-normal-text>

        <div
          class="w-full flex flex-row items-center"
          @click="
            openInNewTab(
              `https://www.google.com/maps/search/?api=1&query=${eventData.location}`
            )
          "
        >
          <app-normal-text class="!text-primary mr-2">
            See on map
          </app-normal-text>
          <app-icon name="arrow-right-green" custom-class="h-[24px]" />
        </div>
      </div>

      <!-- Tickets -->
      <div
        class="w-full flex flex-col pt-4 !border-t-[10px] !border-[#F0F3F6] px-4 !pb-[140px]"
      >
        <app-normal-text class="!text-xl !font-semibold !text-left mb-1">
          Tickets
        </app-normal-text>

        <div class="w-full flex flex-col">
          <div
            v-for="(item, index) in eventData.tickets"
            :key="index"
            class="w-full flex flex-row items-center justify-center relative mt-4"
          >
            <div class="w-[75%] h-[135px] -mr-[2%] relative">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 256 146"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <mask
                  id="path-1-outside-1_29687_39616"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="256"
                  height="146"
                  fill="black"
                >
                  <rect fill="white" width="256" height="146" />
                  <path
                    d="M244.003 1C244.129 7.17686 248.922 12.2066 255 12.708V131.791C248.84 132.299 244 137.459 244 143.75C244 144.061 244.012 144.369 244.035 144.674L244.06 145H1V1H244.003Z"
                  />
                </mask>
                <path
                  d="M244.003 1C244.129 7.17686 248.922 12.2066 255 12.708V131.791C248.84 132.299 244 137.459 244 143.75C244 144.061 244.012 144.369 244.035 144.674L244.06 145H1V1H244.003Z"
                  :fill="`${item.color}`"
                  fill-opacity="0.2"
                />
                <path
                  d="M244.003 1L245.003 0.979567L244.983 0H244.003V1ZM255 12.708H256V11.7871L255.082 11.7114L255 12.708ZM255 131.791L255.082 132.788L256 132.712V131.791H255ZM244.035 144.674L245.032 144.599L245.032 144.598L244.035 144.674ZM244.06 145V146H245.137L245.057 144.925L244.06 145ZM1 145H0V146H1V145ZM1 1V0H0V1H1ZM244.003 1L243.003 1.02043C243.14 7.71302 248.333 13.1613 254.918 13.7046L255 12.708L255.082 11.7114C249.512 11.2518 245.118 6.6407 245.003 0.979567L244.003 1ZM255 12.708H254V131.791H255H256V12.708H255ZM255 131.791L254.918 130.794C248.244 131.345 243 136.935 243 143.75H244H245C245 137.984 249.437 133.253 255.082 132.788L255 131.791ZM244 143.75H243C243 144.086 243.013 144.42 243.038 144.75L244.035 144.674L245.032 144.598C245.011 144.318 245 144.035 245 143.75H244ZM244.035 144.674L243.038 144.748L243.062 145.075L244.06 145L245.057 144.925L245.032 144.599L244.035 144.674ZM244.06 145V144H1V145V146H244.06V145ZM1 145H2V1H1H0V145H1ZM1 1V2H244.003V1V0H1V1Z"
                  :fill="`${item.color}`"
                  fill-opacity="0.2"
                  mask="url(#path-1-outside-1_29687_39616)"
                />
              </svg>
              <div
                class="absolute w-full h-full top-0 left-0 flex flex-col justify-between px-4 pt-3 pb-4 !pl-3"
              >
                <div class="w-full flex flex-col">
                  <app-normal-text class="!text-base !font-semibold mb-1">
                    {{ item.name }}
                  </app-normal-text>

                  <app-normal-text class="!text-[#616161] !font-[500]">
                    {{ item.date }}
                  </app-normal-text>
                  <app-normal-text class="!text-[#616161] !font-[500]">
                    {{ item.time }}
                  </app-normal-text>
                </div>

                <div
                  class="flex flex-row items-center justify-between w-full space-x-2"
                >
                  <app-normal-text class="!text-black !text-xl !font-semibold">
                    {{ item.price }}
                  </app-normal-text>

                  <div class="flex flex-col pr-2" v-if="item.is_vote">
                    <app-normal-text
                      class="!font-medium !text-sm !text-right !line-clamp-1"
                    >
                      Vote {{ item.ticket_name }}
                    </app-normal-text>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-[25%] h-[135px] relative">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 91 146"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="path-1-outside-1_29687_39675"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="91"
                  height="146"
                  fill="black"
                >
                  <rect fill="white" width="91" height="146" />
                  <path
                    d="M90 145H13.959L13.9648 144.924C13.988 144.619 14 144.311 14 144C14 137.709 9.15953 132.549 3 132.041V131.235H1V122.765H3V113.235H1V104.765H3V95.2354H1V86.7646H3V77.2354H1V68.7646H3V59.2354H1V50.7646H3V41.2354H1V32.7646H3V23.2354H1V14.7646H3V12.9688L3.16504 12.9629L3.84766 12.8584C9.59762 11.9704 14 6.99853 14 1H90V145Z"
                  />
                </mask>
                <path
                  d="M90 145H13.959L13.9648 144.924C13.988 144.619 14 144.311 14 144C14 137.709 9.15953 132.549 3 132.041V131.235H1V122.765H3V113.235H1V104.765H3V95.2354H1V86.7646H3V77.2354H1V68.7646H3V59.2354H1V50.7646H3V41.2354H1V32.7646H3V23.2354H1V14.7646H3V12.9688L3.16504 12.9629L3.84766 12.8584C9.59762 11.9704 14 6.99853 14 1H90V145Z"
                  :fill="`${item.color}`"
                />
                <path
                  d="M90 145V146H91V145H90ZM13.959 145L12.9619 144.923L12.8791 146H13.959V145ZM13.9648 144.924L14.9619 145.001L14.962 145L13.9648 144.924ZM3 132.041H2V132.962L2.91778 133.038L3 132.041ZM3 131.235H4V130.235H3V131.235ZM1 131.235H0V132.235H1V131.235ZM1 122.765V121.765H0V122.765H1ZM3 122.765V123.765H4V122.765H3ZM3 113.235H4V112.235H3V113.235ZM1 113.235H0V114.235H1V113.235ZM1 104.765V103.765H0V104.765H1ZM3 104.765V105.765H4V104.765H3ZM3 95.2354H4V94.2354H3V95.2354ZM1 95.2354H0V96.2354H1V95.2354ZM1 86.7646V85.7646H0V86.7646H1ZM3 86.7646V87.7646H4V86.7646H3ZM3 77.2354H4V76.2354H3V77.2354ZM1 77.2354H0V78.2354H1V77.2354ZM1 68.7646V67.7646H0V68.7646H1ZM3 68.7646V69.7646H4V68.7646H3ZM3 59.2354H4V58.2354H3V59.2354ZM1 59.2354H0V60.2354H1V59.2354ZM1 50.7646V49.7646H0V50.7646H1ZM3 50.7646V51.7646H4V50.7646H3ZM3 41.2354H4V40.2354H3V41.2354ZM1 41.2354H0V42.2354H1V41.2354ZM1 32.7646V31.7646H0V32.7646H1ZM3 32.7646V33.7646H4V32.7646H3ZM3 23.2354H4V22.2354H3V23.2354ZM1 23.2354H0V24.2354H1V23.2354ZM1 14.7646V13.7646H0V14.7646H1ZM3 14.7646V15.7646H4V14.7646H3ZM3 12.9688L2.96452 11.9694L2 12.0036V12.9688H3ZM3.16504 12.9629L3.20052 13.9623L3.25875 13.9602L3.31635 13.9514L3.16504 12.9629ZM3.84766 12.8584L3.99897 13.8469L4.00029 13.8467L3.84766 12.8584ZM14 1V0H13V1H14ZM90 1H91V0H90V1ZM90 145V144H13.959V145V146H90V145ZM13.959 145L14.956 145.077L14.9619 145.001L13.9648 144.924L12.9678 144.847L12.9619 144.923L13.959 145ZM13.9648 144.924L14.962 145C14.9871 144.67 15 144.336 15 144H14H13C13 144.285 12.989 144.568 12.9677 144.848L13.9648 144.924ZM14 144H15C15 137.185 9.75609 131.595 3.08222 131.044L3 132.041L2.91778 133.038C8.56297 133.503 13 138.234 13 144H14ZM3 132.041H4V131.235H3H2V132.041H3ZM3 131.235V130.235H1V131.235V132.235H3V131.235ZM1 131.235H2V122.765H1H0V131.235H1ZM1 122.765V123.765H3V122.765V121.765H1V122.765ZM3 122.765H4V113.235H3H2V122.765H3ZM3 113.235V112.235H1V113.235V114.235H3V113.235ZM1 113.235H2V104.765H1H0V113.235H1ZM1 104.765V105.765H3V104.765V103.765H1V104.765ZM3 104.765H4V95.2354H3H2V104.765H3ZM3 95.2354V94.2354H1V95.2354V96.2354H3V95.2354ZM1 95.2354H2V86.7646H1H0V95.2354H1ZM1 86.7646V87.7646H3V86.7646V85.7646H1V86.7646ZM3 86.7646H4V77.2354H3H2V86.7646H3ZM3 77.2354V76.2354H1V77.2354V78.2354H3V77.2354ZM1 77.2354H2V68.7646H1H0V77.2354H1ZM1 68.7646V69.7646H3V68.7646V67.7646H1V68.7646ZM3 68.7646H4V59.2354H3H2V68.7646H3ZM3 59.2354V58.2354H1V59.2354V60.2354H3V59.2354ZM1 59.2354H2V50.7646H1H0V59.2354H1ZM1 50.7646V51.7646H3V50.7646V49.7646H1V50.7646ZM3 50.7646H4V41.2354H3H2V50.7646H3ZM3 41.2354V40.2354H1V41.2354V42.2354H3V41.2354ZM1 41.2354H2V32.7646H1H0V41.2354H1ZM1 32.7646V33.7646H3V32.7646V31.7646H1V32.7646ZM3 32.7646H4V23.2354H3H2V32.7646H3ZM3 23.2354V22.2354H1V23.2354V24.2354H3V23.2354ZM1 23.2354H2V14.7646H1H0V23.2354H1ZM1 14.7646V15.7646H3V14.7646V13.7646H1V14.7646ZM3 14.7646H4V12.9688H3H2V14.7646H3ZM3 12.9688L3.03548 13.9681L3.20052 13.9623L3.16504 12.9629L3.12956 11.9635L2.96452 11.9694L3 12.9688ZM3.16504 12.9629L3.31635 13.9514L3.99897 13.8469L3.84766 12.8584L3.69634 11.8699L3.01373 11.9744L3.16504 12.9629ZM3.84766 12.8584L4.00029 13.8467C10.2304 12.8845 15 7.4993 15 1H14H13C13 6.49775 8.96479 11.0563 3.69503 11.8701L3.84766 12.8584ZM14 1V2H90V1V0H14V1ZM90 1H89V145H90H91V1H90Z"
                  :fill="`${item.color}`"
                  mask="url(#path-1-outside-1_29687_39675)"
                />
              </svg>

              <div
                class="absolute w-full h-full top-0 left-0 flex items-center justify-center"
              >
                <app-normal-text
                  v-if="!item.is_vote"
                  class="!text-white !text-xl !font-semibold !rotate-90"
                >
                  {{ item.ticket_name }}
                </app-normal-text>
                <app-image-loader
                  v-else
                  :photoUrl="item.image_url || '/images/profile-image.svg'"
                  class="h-[40px] w-[40px] rounded-full"
                >
                </app-image-loader>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  AppImageLoader,
  AppSwiper,
  AppNormalText,
  AppIcon,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { onMounted } from "vue";
import { watch } from "vue";
import { SwiperSlide } from "swiper/vue";
import { Product, ProductVariantInput } from "@greep/logic/src/gql/graphql";
import {
  availableCurrencies,
  withdrawalAvailableCurrencies,
} from "../../composable";

export default defineComponent({
  components: {
    AppSwiper,
    AppImageLoader,
    SwiperSlide,
    AppNormalText,
    AppIcon,
  },
  props: {
    product: {
      type: Object as () => Product,
    },
  },
  name: "EventAboutSummary",
  setup(props) {
    const FormValidations = Logic.Form;

    const currentSlidePosition = ref(0);
    const slidePosition = ref(0);

    const openInNewTab = (url: string) => {
      window.open(url, "_blank");
    };

    const eventData = reactive<{
      images: { url: string }[];
      name: string;
      event_date: string;
      event_time: string;
      location: string;
      place: string;
      tickets: {
        ticket_name: string;
        name: string;
        price: string;
        color: string;
        time: string;
        date: string;
        is_vote?: boolean;
        image_url?: string;
      }[];
      description: string;
    }>({
      images: [
        { url: "/images/temps/event-1.png" },
        { url: "/images/temps/event-2.png" },
        { url: "/images/temps/event-3.png" },
      ],
      name: "Make It! Pottery Class",
      event_date: "Sunday, 27 July 2025",
      event_time: "10AM - 4PM",
      location: "12 Titsianou Aristotelous, Limassol, Cyprus.",
      place: "Limassol, Cyprus",
      description:
        "Unleash your creativity and learn the art of pottery in this hands-on workshop. Guided by expert instructors, you'll craft your own masterpiece and take it home to keep. Suitable for beginners and enthusiasts alike. All materials provided!",
      tickets: [
        {
          ticket_name: "Regular",
          name: "Make It! Pottery Class",
          color: "#009DE3",
          date: "Sunday, July 27",
          time: "10AM - 4PM",
          price: "₺450",
        },
        {
          ticket_name: "VIP",
          name: "Make It! Pottery Class",
          color: "#00A0B4",
          date: "Sunday, July 27",
          time: "10AM - 4PM",
          price: "₺600",
        },
        {
          ticket_name: "VIP +",
          name: "Make It! Pottery Class",
          color: "#8E3BE0",
          date: "Sunday, July 27",
          time: "10AM - 4PM",
          price: "₺900",
        },
      ],
    });

    const setDefaults = () => {
      if (props.product) {
        const product = props.product;

        const productImages: {
          url: string;
          alt: string;
        }[] = JSON.parse(product.images);

        eventData.images = productImages.map((image) => {
          return {
            url: image.url,
          };
        });
        eventData.name = product.name;
        eventData.event_date = Logic.Common.fomartDate(
          product.eventEndDate || "",
          "dddd, DD MMMM YYYY"
        );
        eventData.event_time = Logic.Common.fomartDate(
          product.eventEndDate || "",
          "hh:mm A"
        );
        eventData.location = product.venueName || "";
        eventData.place = product.venueName || "";
        eventData.description = product.description || "";

        const productVariants: ProductVariantInput[] = JSON.parse(
          product.variants
        );
        eventData.tickets = productVariants.map((variant) => {
          const currentCurrency = availableCurrencies.find(
            (item) => item.code === product.currency
          );

          const is_vote_attribute = variant.attributes.find(
            (attr) => attr.key === "is_vote"
          );

          const image_url_attribute = variant.attributes.find(
            (attr) => attr.key === "image_url"
          );

          return {
            ticket_name: variant.sku,
            name: product.name,
            color: variant.attributes[0].value,
            date: Logic.Common.fomartDate(
              product.eventEndDate || "",
              "dddd, DD MMMM YYYY"
            ),
            time: Logic.Common.fomartDate(
              product.eventEndDate || "",
              "hh:mm A"
            ),
            price: `${currentCurrency?.symbol}${Logic.Common.convertToMoney(
              variant.priceAdjustment,
              false,
              ""
            )}`,
            is_vote:
              is_vote_attribute && is_vote_attribute.value === "yes"
                ? true
                : false,
            image_url:
              image_url_attribute && image_url_attribute.value
                ? image_url_attribute.value
                : "",
          };
        });
      }
    };

    const continueWithForm = () => {
      //
    };

    watch(slidePosition, () => {
      currentSlidePosition.value = slidePosition.value;
    });

    onMounted(() => {
      setDefaults();
    });

    return {
      FormValidations,
      Logic,
      continueWithForm,
      eventData,
      currentSlidePosition,
      slidePosition,
      openInNewTab,
    };
  },
});
</script>
