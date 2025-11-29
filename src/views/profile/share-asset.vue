<template>
  <app-wrapper>
    <subpage-layout title="Share Profile">
      <div
        class="h-full !leading-0 flex flex-col items-center justify-center -mt-[20%]"
        style="
          background: linear-gradient(269.64deg, #0d965e 0.31%, #00683f 89.75%),
            linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3));
        "
        id="business-asset"
      >
        <div class="w-full flex flex-col items-center justify-center">
          <app-avatar
            :src="currentBusiness?.logo || ''"
            class="!size-[160px] !border-[8px] !border-white relative"
          >
            <div
              class="absolute bottom-[-15%] left-0 w-full !h-fit flex flex-row items-center justify-center"
            >
              <div class="!h-[60px] !w-[60px] rounded-[12px]">
                <app-qr-code :data="getBusinessProfileLink" class="!py-0" />
              </div>
            </div>
          </app-avatar>
        </div>

        <div
          class="w-full flex flex-col items-center justify-center pt-12 pb-2"
        >
          <app-header-text class="!text-white !text-3xl !text-center">
            {{ currentBusiness?.business_name }}
          </app-header-text>

          <app-normal-text
            class="!text-white italic px-8 !font-semibold !text-lg !text-center mt-2"
          >
            We are now accepting orders on GreepPay!!!
          </app-normal-text>
        </div>

        <div class="w-full flex flex-row items-center justify-center pt-4">
          <app-normal-text class="!text-white px-4 !text-sm !text-center">
            Download on
          </app-normal-text>
        </div>

        <div
          class="w-full flex flex-row px-4 mt-3 items-center justify-center gap-4"
        >
          <div
            class="flex items-center justify-center bg-white h-[56px] w-[56px] rounded-full"
          >
            <img src="/images/apple-store.svg" class="!h-[26px]" />
          </div>

          <div
            class="flex items-center justify-center bg-white h-[56px] w-[56px] rounded-full"
          >
            <img src="/images/google-play-store.svg" class="!h-[26px]" />
          </div>
        </div>

        <div class="w-full flex flex-col justify-center mt-6">
          <img src="/images/logo-white-text.png" class="!h-[25px]" />
        </div>
      </div>

      <!-- Bottom Sections -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 grid grid-cols-3"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div
          @click="Logic.Common.copytext(getBusinessProfileLink)"
          class="col-span-1 items-center justify-center flex flex-col"
        >
          <app-icon name="copy-link" custom-class="h-[56px]" />
          <app-normal-text class="pt-[4px]"> Copy Link </app-normal-text>
        </div>

        <div
          @click="share"
          class="col-span-1 items-center justify-center flex flex-col"
        >
          <app-icon name="share-asset" custom-class="h-[56px]" />
          <app-normal-text class="pt-[4px]"> Share Asset </app-normal-text>
        </div>

        <div
          @click="share"
          class="col-span-1 items-center justify-center flex flex-col"
        >
          <app-icon name="download" custom-class="h-[56px]" />
          <app-normal-text class="pt-[4px]"> Download </app-normal-text>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import {
  AppImageLoader,
  AppNormalText,
  AppIcon,
  AppHeaderText,
  AppAvatar,
  AppQrCode,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { Business } from "@greep/logic/src/gql/graphql";
import { getBottomPadding } from "../../composable";
import html2canvas from "html2canvas";

export default defineComponent({
  name: "ProfileShareAssetPage",
  components: {
    AppImageLoader,
    AppNormalText,
    AppIcon,
    AppHeaderText,
    AppAvatar,
    AppQrCode,
  },
  setup() {
    const currentBusiness = computed<Business>(() =>
      Logic.Auth.GetDefaultBusiness()
    );

    const getBusinessProfileLink = computed<string>(() => {
      const business = Logic.Auth.GetDefaultBusiness();
      return `${import.meta.env.VITE_SHARE_APP_BASE_URL}/shops/${
        business?.uuid
      }`;
    });

    const blobToBase64 = (blob: Blob): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1]; // strip data:application/pdf;base64,
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    const share = async () => {
      Logic.Common.showLoader({
        show: true,
        loading: true,
      });
      const businessElement = document.getElementById("business-asset");
      if (!businessElement) return;
      html2canvas(businessElement, {
        scale: 2,
        useCORS: true,
        height: businessElement.scrollHeight,
        width: businessElement.scrollWidth,
      }).then(async function (canvas) {
        try {
          //  convert canvas as image blob
          const imageData = canvas.toDataURL("image/png");

          const base64Data = await blobToBase64(
            await (await fetch(imageData)).blob()
          );
          await Logic.Common.shareFile(
            `greep-pay-assets-${currentBusiness.value?.business_name}`,
            base64Data,
            "image/png"
          );
        } finally {
          Logic.Common.hideLoader();
        }
      });
    };

    return {
      currentBusiness,
      Logic,
      getBottomPadding,
      getBusinessProfileLink,
      share,
    };
  },
});
</script>
