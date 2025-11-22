<template>
    <app-wrapper>
        <div class="flex h-full flex-col">
            <!-- White Header -->
            <div class="bg-white px-6 pt-6 pb-6">
                <div class="flex items-center justify-between">
                    <button @click="$router.back()" class="flex h-10 w-10 items-center justify-center">
                        <app-icon name="arrow-left" custom-class="!h-[24px]" />
                    </button>
                    <app-header-text class="!text-[#111827] !text-lg !font-semibold">Profile Asset</app-header-text>
                    <div class="w-10"></div>
                </div>
            </div>

            <!-- Green Gradient Body -->
            <div
                class="bg-gradient-to-br from-[#0F7F3C] to-[#16A55A] px-6 pt-12 pb-8 flex flex-col items-center text-center">
                <div class="relative">
                    <app-image-loader :photo-url="Logic.Auth.GetDefaultBusiness()?.logo ||
                        '/images/profile-image.svg'"
                        custom-class="!h-[220px] !w-[220px] rounded-full border-[12px] border-[#ffffff]" />
                    <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 flex justify-center">
                        <div class="rounded-3xl bg-white p-6">
                            <!-- <img :src="qrCodeUrl" alt="QR Code" class="h-28 w-28" /> -->
                        </div>
                    </div>
                </div>

                <app-header-text class="!mt-16 !text-[28px] !font-bold !text-white">
                    {{ Logic.Auth.GetDefaultBusiness()?.business_name }}
                </app-header-text>

                <app-normal-text class="!mt-4 !text-[20px] !leading-[125%] !italic !text-white !font-medium"
                    style="font-family: Poppins; font-weight: 500;">
                    We are now accepting <br /> orders on GreepPay!!!
                </app-normal-text>

                <div class="mt-6 flex w-full flex-col space-y-4">
                    <button class="flex w-full items-center justify-center space-x-3 rounded-full bg-white py-4">
                        <app-icon name="apple" custom-class="!h-[26px]" />
                        <app-normal-text class="!text-lg !font-semibold !text-[#111827]">
                            Get it on App Store
                        </app-normal-text>
                    </button>

                    <button class="flex w-full items-center justify-center space-x-3 rounded-full bg-white py-4">
                        <app-icon name="google-play" custom-class="!h-[26px]" />
                        <app-normal-text class="!text-lg !font-semibold !text-[#111827]">
                            Get it on Google Play
                        </app-normal-text>
                    </button>
                </div>

                <div class="mt-10 flex items-center justify-center space-x-2">
                    <app-icon name="greep-download-logo" custom-class="!h-[26px]" />
                </div>
            </div>

            <!-- White Footer -->
            <div class="rounded-t-[40px] bg-white px-8 py-8 border-t-4 border-[#0F7F3C]">
                <div class="mx-auto flex max-w-md items-center justify-between">
                    <button @click="" class="flex flex-col items-center space-y-2">
                        <div class="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-black">
                            <app-icon name="share-link" custom-class="!h-[28px]" />
                        </div>
                        <app-normal-text class="!text-sm !font-medium !text-[#111827]">
                            Copy Link
                        </app-normal-text>
                    </button>

                    <button @click="" class="flex flex-col items-center space-y-2">
                        <div class="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-black">
                            <app-icon name="share-icon" custom-class="!h-[26px]" />
                        </div>
                        <app-normal-text class="!text-sm !font-medium !text-[#111827]">
                            Share Asset
                        </app-normal-text>
                    </button>

                    <button @click="" class="flex flex-col items-center space-y-2">
                        <div class="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-black">
                            <app-icon name="arrow-download" custom-class="!h-[28px]" />
                        </div>
                        <app-normal-text class="!text-sm !font-medium !text-[#111827]">
                            Download
                        </app-normal-text>
                    </button>
                </div>
            </div>
        </div>
    </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import {
    AppImageLoader,
    AppNormalText,
    AppIcon,
    AppHeaderText,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";

export default defineComponent({
    name: "ProfileShareAssetPage",
    components: {
        AppImageLoader,
        AppNormalText,
        AppIcon,
        AppHeaderText,
    },
    setup() {
        const AuthUser = ref<User>(Logic.Auth.AuthUser);

        return {
            AuthUser,
            Logic,
        };
    },
});
</script>
