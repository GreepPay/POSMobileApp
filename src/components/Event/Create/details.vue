<template>
  <div class="w-full flex flex-col items-center justify-start h-full space-y-6">
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col space-y-[23px] h-full"
      v-if="!hideContent"
    >
      <div
        class="w-full flex no-scrollbar flex-row space-x-3 flex-nowrap overflow-x-auto scrollbar-hide"
      >
        <div class="flex flex-row py-2">
          <div class="pr-3 flex flex-col">
            <app-file-attachment
              :is-wrapper="true"
              @update:files-and-url="
                (newPhotos: any[]) => {
                  formData.photos.push(...newPhotos);
                }
              "
              :accept="`image/png, image/gif, image/jpeg`"
              is-multiple
              class="flex flex-row items-center justify-start !w-auto"
            >
              <template v-slot:content>
                <div
                  class="w-[96px] h-[96px] !border-[1.5px] border-[#E0E2E4] rounded-[16px] flex flex-row items-center justify-center"
                >
                  <app-icon name="gallery-add" custom-class="!h-[32px]" />
                </div>
              </template>
            </app-file-attachment>
          </div>

          <div
            class="pr-3 flex flex-col relative"
            v-for="(item, index) in formData.photos"
            :key="index"
          >
            <span
              class="absolute top-0 right-0 py-1 px-1 bg-white rounded-full"
              @click="formData.photos.splice(index, 1)"
            >
              <app-icon name="remove-image" custom-class="!h-[28px]" />
            </span>
            <app-image-loader
              :photo-url="item.url"
              class="w-[96px] h-[96px] !border-[1.5px] border-[#E0E2E4] rounded-[16px]"
            >
            </app-image-loader>
          </div>
        </div>
      </div>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Event name"
        ref="eventName"
        name="Name"
        v-model="formData.name"
        usePermanentFloatingLabel
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Full details of the event"
        ref="eventDescription"
        name="Description"
        v-model="formData.descriptions"
        usePermanentFloatingLabel
        is-textarea
        :max-character="10000"
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <div class="w-full grid grid-cols-12 gap-4">
        <div class="col-span-6 flex flex-col">
          <app-text-field
            :has-title="false"
            type="date"
            placeholder="Choose Event Date"
            ref="eventDate"
            name="Date"
            v-model="formData.date"
            usePermanentFloatingLabel
            prevent-back-date
            :rules="[FormValidations.RequiredRule]"
          >
            <template #inner-suffix>
              <app-icon name="calendar" class="h-[20px]" />
            </template>
          </app-text-field>
        </div>
        <div class="col-span-6 flex flex-col">
          <app-text-field
            :has-title="false"
            type="time"
            placeholder="00:00"
            ref="eventTime"
            name="Time"
            v-model="formData.time"
            usePermanentFloatingLabel
            :rules="[FormValidations.RequiredRule]"
          >
          </app-text-field>
        </div>
      </div>

      <div class="w-full flex flex-col">
        <app-checkbox v-model="formData.is_online" variant="switch">
          <template #label>
            <app-normal-text class="!font-[500] !text-sm -ml-2">
              {{ formData.is_online ? "Online event" : "Physical event" }}
            </app-normal-text>
          </template>
        </app-checkbox>
      </div>

      <template v-if="formData.is_online">
        <app-text-field
          :has-title="false"
          type="text"
          placeholder="Enter online event link"
          ref="eventOnlineLink"
          name="Link"
          v-model="formData.online_link"
          usePermanentFloatingLabel
          :rules="[FormValidations.RequiredRule, FormValidations.URLRule]"
        >
        </app-text-field>
      </template>
      <template v-else>
        <app-select
          :placeholder="'Enter full event address'"
          :hasTitle="false"
          v-model="formData.address_info.name"
          ref="eventAddressName"
          @OnSearch="handleAreaSearch"
          :options="areaOptions"
          autoComplete
          :hasSearch="true"
          name="Address"
          usePermanentFloatingLabel
          :searchMessage="'Search for your event address'"
          :searchIsLoading="areaSearchIsLoading"
        >
        </app-select>

        <app-text-field
          :has-title="false"
          type="text"
          placeholder="Enter helpful address info"
          ref="eventAddressDetails"
          name="Details"
          v-model="formData.address_info.details"
          usePermanentFloatingLabel
          :rules="[FormValidations.RequiredRule]"
          is-textarea
        >
        </app-text-field>
      </template>

      <!-- Spacer -->
      <div class="h-[30px]"></div>
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive, onMounted, ref } from "vue"
  import {
    AppNormalText,
    AppFormWrapper,
    AppTextField,
    AppIcon,
    AppFileAttachment,
    AppImageLoader,
    AppCheckbox,
    AppSelect,
  } from "@greep/ui-components"
  import { Logic } from "@greep/logic"
  import { Product } from "@greep/logic/src/gql/graphql"
  import { computed } from "vue"
  import { SelectOption } from "@greep/ui-components/src/types"

  export default defineComponent({
    components: {
      AppFormWrapper,
      AppTextField,
      AppIcon,
      AppFileAttachment,
      AppImageLoader,
      AppCheckbox,
      AppNormalText,
      AppSelect,
    },
    props: {
      product: {
        type: Object as () => Product,
      },
    },
    name: "ProductSetupProductInfo",
    setup(props) {
      const FormValidations = Logic.Form

      const hideContent = ref(false)
      const areaSearchIsLoading = ref(false)
      const areaOptions = reactive<SelectOption[]>([])

      const autocompleteSuggestion =
        // @ts-expect-error window.google.maps.places.AutocompleteService
        ref<window.google.maps.places.AutocompleteSuggestion>()

      const sessionToken =
        // @ts-expect-error window.google.maps.places.AutocompleteService
        ref<window.google.maps.places.AutocompleteSessionToken>()

      const formData = reactive<{
        name: string
        descriptions: string
        photos: {
          url: string
          rawValue: string
        }[]
        date: string
        time: string
        is_online: boolean
        online_link: string
        address_info: {
          name: string
          details: string
        }
      }>({
        name: "",
        descriptions: "",
        photos: [],
        date: "",
        time: "",
        is_online: false,
        address_info: {
          name: "",
          details: "",
        },
        online_link: "",
      })

      const formComponent = ref<any>(null)

      const formIsValid = computed(() => {
        return (
          formData.name !== "" &&
          formData.descriptions !== "" &&
          formData.date !== "" &&
          formData.time !== "" &&
          formData.photos.length > 0 &&
          (formData.is_online
            ? formData.online_link !== ""
            : formData.address_info.name !== "" &&
              formData.address_info.details !== "")
        )
      })

      const continueWithForm = () => {
        const state = formComponent.value?.validate()
        if (state && formIsValid.value) {
          return formData
        } else {
          return
        }
      }

      const setDefaultValues = () => {
        if (props.product) {
          hideContent.value = true

          const images: { url: string }[] = JSON.parse(props.product.images)
          const eventLocation =
            JSON.parse(props.product.eventLocation || "{}") || {}

          const addressInfo = JSON.parse(eventLocation.address) || {
            name: "",
            details: "",
          }

          areaOptions.length = 0

          areaOptions.push({
            key: addressInfo.name,
            value: addressInfo.name,
          })

          formData.name = props.product.name
          formData.descriptions = props.product.description
          formData.date = props.product.eventEndDate
            ? Logic.Common.fomartDate(props.product.eventEndDate, "YYYY-MM-DD")
            : ""
          formData.time = props.product.eventEndDate
            ? Logic.Common.fomartDate(props.product.eventEndDate, "HH:mm")
            : ""
          formData.photos = images.map((image) => {
            return {
              url: image.url,
              rawValue: "",
            }
          })
          formData.is_online = props.product.eventOnlineUrl ? true : false
          formData.online_link = props.product.eventOnlineUrl || ""
          formData.address_info = addressInfo

          setTimeout(() => {
            hideContent.value = false
          }, 100)
        }
      }

      const handleAreaSearch = async (searchValue: string) => {
        Logic.Common.debounce(async () => {
          try {
            areaOptions.length = 0
            if (!autocompleteSuggestion.value || !searchValue) return

            areaSearchIsLoading.value = true

            const predictions =
              await autocompleteSuggestion.value.fetchAutocompleteSuggestions({
                input: searchValue,
                sessionToken: sessionToken.value,
              })

            if (predictions.suggestions) {
              areaSearchIsLoading.value = false

              predictions.suggestions.forEach((prediction: any) => {
                const currentPrediction = prediction.placePrediction
                areaOptions.push({
                  key: currentPrediction.text.text,
                  value: currentPrediction.text.text,
                })
              })
            }
          } catch (error) {
            console.log(error)
          }
        }, 500)
      }

      async function initPlacesService() {
        // Load the Maps + Places libraries

        const { AutocompleteSuggestion, AutocompleteSessionToken } =
          // @ts-expect-error window.google.maps.places.AutocompleteService
          await google.maps.importLibrary("places")

        // Initialize service and session token

        autocompleteSuggestion.value = AutocompleteSuggestion

        sessionToken.value = new AutocompleteSessionToken()
      }

      onMounted(() => {
        setDefaultValues()
        initPlacesService()
      })

      return {
        FormValidations,
        Logic,
        formData,
        formComponent,
        continueWithForm,
        hideContent,
        formIsValid,
        areaSearchIsLoading,
        areaOptions,
        handleAreaSearch,
      }
    },
    data() {
      return {
        parentRefs: [],
      }
    },
    mounted() {
      const parentRefs: any = this.$refs
      this.parentRefs = parentRefs
    },
  })
</script>
