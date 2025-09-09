<template>
  <app-wrapper>
    <subpage-layout
      :title="`Accept ${transferResponse?.source_deposit_instructions?.currency.toUpperCase()}`"
    >
      <div
        class="w-full flex flex-col px-4 pb-5 pt-4"
        id="qrPaymentContentCrypto"
      >
        <div class="w-full flex flex-col items-center justify-center">
          <!-- Network switch -->
          <div class="w-full flex flex-row justify-center items-center pb-3">
            <div
              class="px-3 py-3 border-[1.5px] border-[#F0F3F6] rounded-[12px] justify-center items-center flex flex-col min-w-[150px]"
            >
              <app-normal-text class="!text-[#616161] !text-center pb-1">
                Network
              </app-normal-text>

              <app-select
                v-if="currentPaymentRail"
                v-model="currentPaymentRail"
                :options="paymentRailOptions"
                is-wrapper
                @OnOptionSelected="
                  (option) => {
                    handlePaymentRailSelected(option)
                  }
                "
              >
                <div
                  class="flex flex-row space-x-[3px] items-center w-full justify-center"
                >
                  <app-normal-text
                    custom-class="!text-black !font-semibold !text-left !text-sm"
                    >{{
                      paymentRailOptions?.find(
                        (item) => item.key == currentPaymentRail
                      )?.value
                    }}</app-normal-text
                  >
                  <app-icon
                    name="chevron-down-black"
                    custom-class="!h-[18px]"
                  />
                </div>
              </app-select>
            </div>
          </div>
          <div class="!w-[70%] h-[230px] xs:h-[230px]">
            <div class="w-full h-full flex items-center justify-center py-3">
              <app-qr-code v-if="qrCodeData" :data="qrCodeData" />
            </div>
          </div>
        </div>
        <app-image-loader
          class="w-full h-fit !mt-3 rounded-[12px] flex flex-col relative justify-center items-center px-3 py-2 xs:!py-2 bg-[linear-gradient(359.13deg,#0D965E_25.37%,#00683F_99.25%)]"
          :photoUrl="''"
        >
          <div
            class="w-full relative flex flex-row justify-between items-center z-[2] py-2"
          >
            <div class="!w-[80%] flex flex-row">
              <app-normal-text
                class="!text-left !text-white !font-[500] !text-sm break-words whitespace-pre-line w-full overflow-hidden"
                style="word-break: break-all"
              >
                {{ transferResponse?.source_deposit_instructions?.to_address }}
              </app-normal-text>
            </div>

            <div
              class="pr-1 pt-0.5"
              @click="
                Logic.Common.copytext(
                  transferResponse?.source_deposit_instructions?.to_address ||
                    ''
                )
              "
            >
              <div class="justify-end cursor-pointer items-center">
                <app-icon name="copy-white" custom-class="!h-[25px]" />
              </div>
            </div>
          </div>
        </app-image-loader>

        <div class="w-full flex flex-col pt-3">
          <div
            class="w-full flex flex-col space-y-2 px-4 border-[1px] border-light-gray-one rounded-[10px] py-4 mt-2"
          >
            <div
              :class="`w-full flex flex-row items-center justify-between pb-2 pt-2 ${
                index < paymentDetails.length - 1
                  ? 'border-b-[1.5px] border-light-gray-one'
                  : ''
              }  `"
              v-for="(item, index) in paymentDetails"
              :key="index"
            >
              <app-normal-text class="!text-gray-two !text-left">
                {{ item.title }}
              </app-normal-text>

              <app-normal-text
                class="!text-black !text-right !text-sm font-[500]"
              >
                {{ item.value }}
              </app-normal-text>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 grid-cols-12 grid gap-3"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div class="col-span-12 flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4 !border-[#E0E2E4]`"
            outlined
            @click="downloadReceipt('image', 'qrPaymentContentCrypto')"
          >
            <div class="flex flex-row justify-center items-center">
              <app-icon name="send-green" class="h-[20px]" />
              <span class="!text-[#17A068] pl-2 !text-sm">Share</span>
            </div>
          </app-button>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
  import { defineComponent, reactive } from "vue"
  import {
    AppNormalText,
    AppQrCode,
    AppButton,
    AppImageLoader,
    AppIcon,
    AppSelect,
  } from "@greep/ui-components"
  import { ref } from "vue"
  import { Logic } from "@greep/logic"
  import { onMounted } from "vue"
  import { onIonViewWillEnter } from "@ionic/vue"
  import { computed } from "vue"
  import { OffRamp, User } from "@greep/logic/src/gql/graphql"
  import {
    depositCryptoAndNetworkMap,
    getBottomPadding,
  } from "../../composable"
  import { SingleTransferResponse } from "../../composable/financials"
  import { SelectOption } from "@greep/ui-components/src/types"
  import { downloadReceipt } from "../../composable/common"

  export default defineComponent({
    name: "RequestCryptoQRPage",
    components: {
      AppNormalText,
      AppQrCode,
      AppButton,
      AppImageLoader,
      AppIcon,
      AppSelect,
    },
    setup() {
      const AuthUser = ref<User>(Logic.Auth.AuthUser)
      const narration = ref("")

      const cryptoTransferResponse = ref<OffRamp | null>(null)
      const transferResponse = ref<SingleTransferResponse | null>(null)
      const currentPaymentRail = ref("")
      const paymentRailOptions = reactive<SelectOption[]>([])
      const switchIsLock = ref(true)

      const paymentDetails = reactive<{ title: string; value: string }[]>([])

      const qrCodeData = computed(() => {
        const sourceInfo = transferResponse.value?.source_deposit_instructions
        return `${sourceInfo?.payment_rail}:${sourceInfo?.to_address}${
          sourceInfo?.blockchain_memo
            ? `?memo=${sourceInfo.blockchain_memo}`
            : ""
        }`
      })

      const setCryptoDetails = () => {
        cryptoTransferResponse.value = localStorage.getItem(
          "currentCryptoTransfer"
        )
          ? JSON.parse(localStorage.getItem("currentCryptoTransfer") || "")
          : null

        if (cryptoTransferResponse.value) {
          const extraData: any = JSON.parse(
            cryptoTransferResponse.value?.extra_data || "{}"
          )
          if (extraData) {
            transferResponse.value = extraData?.transferResponse || null
          }
        }

        paymentDetails.length = 0
        if (transferResponse.value) {
          const paymentRails =
            depositCryptoAndNetworkMap[
              transferResponse.value?.source?.currency?.toUpperCase() as keyof typeof depositCryptoAndNetworkMap
            ] || []

          currentPaymentRail.value =
            transferResponse.value?.source_deposit_instructions?.payment_rail ||
            ""
          paymentDetails.push(
            {
              title: "Currency",
              value: `${transferResponse.value?.source?.currency?.toUpperCase()}`,
            },
            {
              title: "Network",
              value:
                paymentRails?.find(
                  (item) =>
                    item.key ==
                    transferResponse.value?.source_deposit_instructions
                      ?.payment_rail
                )?.title || "-",
            }
          )

          if (
            transferResponse.value?.source_deposit_instructions?.blockchain_memo
          ) {
            paymentDetails.push({
              title: "Memo",
              value:
                transferResponse.value?.source_deposit_instructions
                  ?.blockchain_memo || "-",
            })
          }

          if (paymentRails.length > 1) {
            paymentRailOptions.length = 0
            paymentRails.forEach((rail) => {
              paymentRailOptions.push({
                key: rail.key,
                value: rail.title,
              })
            })
            currentPaymentRail.value =
              transferResponse.value?.source_deposit_instructions
                ?.payment_rail || paymentRails[0].key
          }
        }
      }

      const handlePaymentRailSelected = async (option: SelectOption) => {
        if (switchIsLock.value) return
        Logic.Common.showLoader({
          show: true,
          loading: true,
        })

        const cryptoTransferResponse = await Logic.Wallet.CreateCrpytoTransfer(
          transferResponse?.value?.source?.currency?.toUpperCase() || "",
          option?.key || ""
        )

        localStorage.setItem(
          "currentCryptoTransfer",
          JSON.stringify(cryptoTransferResponse)
        )

        Logic.Common.hideLoader()

        setCryptoDetails()
      }

      const continueToNext = () => {
        // Navigate to the next page
        // Logic.Common.navigate("/request/qr");
      }

      onIonViewWillEnter(() => {
        setCryptoDetails()
        setTimeout(() => {
          switchIsLock.value = false
        }, 600)
      })

      onMounted(() => {
        setCryptoDetails()
        Logic.Auth.watchProperty("AuthUser", AuthUser)
      })

      return {
        Logic,
        qrCodeData,
        continueToNext,
        getBottomPadding,
        narration,
        transferResponse,
        paymentDetails,
        currentPaymentRail,
        paymentRailOptions,
        handlePaymentRailSelected,
        downloadReceipt,
      }
    },
  })
</script>
