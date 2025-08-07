<template>
  <app-wrapper>
    <subpage-layout title="KYC Verification">
      <app-form-wrapper
        ref="formComponent"
        :parent-refs="parentRefs"
        class="w-full flex flex-col p-4 pt-2"
      >
        <app-text-field
          :has-title="true"
          v-model="formData.full_name"
          type="text"
          placeholder="Enter Full Name"
          class="mb-4"
          ref="FullNameRef"
          name="Full Name"
          use-floating-label
          :rules="[FormValidations.RequiredRule]"
        >
        </app-text-field>

        <div class="w-full grid grid-cols-12 gap-3 pb-3 pt-1">
          <div class="col-span-3 flex flex-col">
            <app-select
              :placeholder="'Country'"
              :hasTitle="false"
              :paddings="'py-4 !px-3'"
              :options="countries"
              ref="country"
              use-floating-label
              v-model="countryCode"
              auto-complete
            >
            </app-select>
          </div>
          <div class="col-span-9 flex flex-col">
            <app-text-field
              :has-title="false"
              type="tel"
              placeholder="Phone Number *"
              ref="phoneNumber"
              name="Phone Number"
              use-floating-label
              v-model="formData.phone_number"
              :update-value="formData.phone_number"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>
          </div>
        </div>

        <app-text-field
          :has-title="true"
          v-model="formData.date_of_birth"
          type="date"
          placeholder="Enter Date of Birth"
          class="mb-4"
          ref="DateOfBirthRef"
          name="Date of Birth"
          use-floating-label
          :rules="[FormValidations.RequiredRule]"
        >
        </app-text-field>

        <app-text-field
          :has-title="true"
          v-model="formData.address"
          type="text"
          placeholder="Enter Address"
          class="mb-4"
          ref="AddressRef"
          name="Address"
          use-floating-label
          :rules="[FormValidations.RequiredRule]"
        >
        </app-text-field>

        <div class="mb-5">
          <app-select
            v-model="formData.id_country"
            placeholder="Country"
            :hasTitle="false"
            :paddings="'py-4 !px-3'"
            :options="getCountryKeyValueList()"
            ref="country"
            use-floating-label
            is-textarea
            :max-character="1500"
          >
          </app-select>
        </div>

        <div v-if="formData.id_country === 'NG'">
          <app-text-field
            :has-title="true"
            v-model="formData.nin"
            type="tel"
            placeholder="National Identification Number (NIN)"
            class="mb-4"
            ref="NiNumberRef"
            name="National Identification Number "
            use-floating-label
            :rules="[
              formData.id_country === 'NG' && FormValidations.RequiredRule,
            ]"
          >
          </app-text-field>

          <app-text-field
            :has-title="true"
            v-model="formData.bvn"
            type="tel"
            placeholder="Bank Verification Number (BVN)"
            class="mb-4"
            ref="BvNumberRef"
            name="Bank Verification Number"
            use-floating-label
            :rules="[
              formData.id_country === 'NG' && FormValidations.RequiredRule,
            ]"
          >
          </app-text-field>
        </div>

        <div v-else>
          <div class="mb-5">
            <app-select
              v-model="formData.id_type"
              placeholder="Id Type"
              :hasTitle="false"
              :paddings="'py-4 !px-3'"
              :options="idVerificationMethods"
              ref="Id Type"
              use-floating-label
              auto-complete
            >
            </app-select>
          </div>

          <app-text-field
            :has-title="true"
            v-model="formData.id_number"
            type="text"
            placeholder="Enter your Id Number"
            class="mb-4"
            ref="IdNumberRef"
            name="Id Number"
            use-floating-label
            :rules="[
              formData.id_country !== 'NG' && FormValidations.RequiredRule,
            ]"
          >
          </app-text-field>
        </div>
      </app-form-wrapper>

      <!--  -->
      <!-- <template #bottom-section> -->
      <div class="bg-white w-full px-4 py-3.5">
        <app-button
          class="!py-4 w-full"
          variant="secondary"
          :loading="loadingState"
          @click.prevent="handleKYCVerification"
        >
          Verify KYC
        </app-button>
      </div>
      <!-- </template> -->
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, onMounted, reactive } from "vue"
  import {
    AppFormWrapper,
    AppTextField,
    AppSelect,
    AppButton,
  } from "@greep/ui-components"
  import { Logic } from "@greep/logic"
  import {
    getCountryKeyValueList,
    getVerificationMethodsByIsoCode,
  } from "../../utils/mappers"
  import { SelectOption } from "@greep/ui-components/src/types"
  import { Country } from "country-state-city"

  export default defineComponent({
    name: "KYCVerificationPage",
    components: {
      AppFormWrapper,
      AppTextField,
      AppSelect,
      AppButton,
    },
    setup() {
      const AuthUser = ref(Logic.Auth.AuthUser)
      const FormValidations = Logic.Form

      const loadingState = ref(false)
      const formComponent = ref<any>(null)

      const countryCode = ref("+234")

      const countries = reactive<SelectOption[]>([])

      const formData = ref({
        user_uuid: AuthUser.value?.uuid || "",
        id_type: "",
        id_number: "",
        id_country: "NG",
        full_name: `${AuthUser.value?.first_name} ${AuthUser.value?.last_name}`,
        phone_number: "",
        date_of_birth: "",
        address: "",
        additional_ids: [],
        checks: { dob: false, name: false, phone: false },
        nin: "",
        bvn: "",
      })

      const setCountries = () => {
        countries.length = 0
        const allCountries = Country.getAllCountries()
        countries.push(
          ...allCountries.map((country) => ({
            key: country.phonecode.startsWith("+")
              ? country.phonecode
              : `+${country.phonecode}`,
            value: country.phonecode.startsWith("+")
              ? country.phonecode
              : `+${country.phonecode}`,
            altValue: `${country.flag} ${country.name} (${country.phonecode})`,
            extraInfo: "",
          }))
        )
      }

      const idVerificationMethods = computed(
        () =>
          getVerificationMethodsByIsoCode(formData.value.id_country) || [
            { key: "", value: "" },
          ]
      )

      const handleKYCVerification = async () => {
        const state = formComponent.value?.validate()

        const { nin, bvn, ...rest } = formData.value
        let payload = null

        const fullPhoneNumber = Logic.Form.getPhoneNumber(
          countryCode.value,
          formData.value.phone_number
        )

        if (formData.value.id_country === "NG") {
          payload = {
            ...rest,
            phone_number: "+" + fullPhoneNumber,
            id_type: "NIN",
            id_number: nin,
            additional_ids: [{ type: "BVN", number: bvn }],
          }
        } else {
          payload = { ...rest, additional_ids: [] }
        }

        if (state) {
          loadingState.value = true
          Logic.Auth.VerifyUserIdentityPayload = { ...payload }

          try {
            await Logic.Auth.VerifyUserIdentity()
            await Logic.Auth.GetAuthUser()
            Logic.Common.showAlert({
              show: true,
              message: "KYC verification successful.",
              type: "success",
            })
            Logic.Common.goBack()
          } finally {
            loadingState.value = false
          }
        }
      }

      onMounted(() => {
        setCountries()
        Logic.Auth.watchProperty("AuthUser", AuthUser)
      })

      return {
        FormValidations,
        formData,
        formComponent,
        loadingState,
        idVerificationMethods,
        getCountryKeyValueList,
        handleKYCVerification,
        countryCode,
        countries,
      }
    },
    data() {
      return {
        parentRefs: null,
      }
    },
    mounted() {
      const parentRefs: any = this.$refs
      this.parentRefs = parentRefs
    },
  })
</script>
