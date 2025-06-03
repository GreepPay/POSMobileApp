<template>
  <app-wrapper>
    <subpage-layout title="Setup Your Account">
      <div
        class="w-full flex flex-col items-center justify-start h-full space-y-3 px-4 pt-4"
      >
        <!-- Form -->
        <app-form-wrapper
          ref="formComponent"
          :parent-refs="parentRefs"
          class="w-full flex flex-col"
        >
          <div class="w-full flex justify-center items-center pb-7">
            <div
              :style="`background-image: url(${photoUrl});  background-size: cover;
      background-repeat: no-repeat;
      background-position: center;`"
              class="h-[90px] w-[90px] rounded-full flex flex-row items-center relative"
            >
              <app-file-attachment
                :is-wrapper="true"
                v-model="formData.photo"
                v-model:local-file-url="photoUrl"
                :accept="`image/png, image/gif, image/jpeg`"
                class="flex flex-row items-center justify-start !w-auto absolute bottom-[-10%] right-[-10%]"
              >
                <template v-slot:content>
                  <app-icon name="upload-image" custom-class="!h-[48px]" />
                </template>
              </app-file-attachment>
            </div>
          </div>

          <div class="w-full flex flex-col pb-5">
            <app-text-field
              :has-title="false"
              type="text"
              placeholder="First Name"
              ref="firstName"
              name="First Name"
              use-floating-label
              v-model="formData.first_name"
              :update-value="formData.first_name"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>
          </div>

          <div class="w-full flex flex-col pb-5">
            <app-text-field
              :has-title="false"
              type="text"
              placeholder="Last Name"
              ref="lastName"
              name="Last Name"
              use-floating-label
              v-model="formData.last_name"
              :update-value="formData.last_name"
              :rules="[FormValidations.RequiredRule]"
            >
            </app-text-field>
          </div>

          <div class="w-full grid grid-cols-12 gap-3 pb-5">
            <div class="col-span-3 flex flex-col">
              <app-select
                :placeholder="'Country'"
                :hasTitle="false"
                :paddings="'py-4 !px-3'"
                :options="countries"
                ref="country"
                use-floating-label
                v-model="phoneCountryCode"
                auto-complete
              >
              </app-select>
            </div>
            <div class="col-span-9 flex flex-col">
              <app-text-field
                :has-title="false"
                type="tel"
                placeholder="Phone Number"
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

          <div class="w-full flex flex-col pb-5">
            <app-select
              :placeholder="'Country'"
              :hasTitle="false"
              :paddings="'py-4 !px-4'"
              :options="countries"
              ref="country"
              use-floating-label
              v-model="countryCode"
              auto-complete
            >
            </app-select>
          </div>
          <div class="w-full flex flex-col pb-5">
            <app-select
              v-if="showStateSelector"
              :placeholder="'State'"
              :hasTitle="false"
              :paddings="'py-4 !px-4'"
              :options="states"
              ref="state"
              v-model="stateIsoCode"
              use-floating-label
              auto-complete
            >
            </app-select>
          </div>
        </app-form-wrapper>
      </div>

      <!-- Bottom section -->
      <div
        class="w-full flex flex-col px-4 fixed z-50 bottom-0 left-0 pt-4 bg-white"
        style="padding-bottom: calc(env(safe-area-inset-bottom) + 16px)"
      >
        <app-button
          variant="secondary"
          class="!py-4 col-span-4"
          @click="handleNext"
          :loading="loadingState"
        >
          Continue
        </app-button>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppFormWrapper,
  AppTextField,
  AppButton,
  AppSelect,
  AppFileAttachment,
  AppIcon,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import { Country, State } from "country-state-city";
import { SelectOption } from "@greep/ui-components/src/types";
import { onMounted } from "vue";
import { watch } from "vue";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppTextField,
    AppButton,
    AppSelect,
    AppFileAttachment,
    AppIcon,
  },
  name: "SetupAccountBasePage",
  setup() {
    const FormValidations = Logic.Form;

    const loadingState = ref(false);

    const formComponent = ref<any>();

    const showStateSelector = ref(true);
    const photoUrl = ref<string | null>("/images/avatar.svg");

    const formData = reactive({
      first_name: "",
      last_name: "",
      phone_number: "",
      country: "",
      state: "",
      photo: "",
    });

    const stateIsoCode = ref("");
    const countryCode = ref("");

    const baseCountries = reactive<SelectOption[]>([]);
    const states = reactive<SelectOption[]>([]);

    const phoneCountryCode = ref("+234");

    const countries = reactive<SelectOption[]>([]);

    const setCountries = () => {
      countries.length = 0;
      baseCountries.length = 0;
      const allCountries = Country.getAllCountries();
      allCountries.forEach((country) => {
        countries.push({
          key: country.phonecode.startsWith("+")
            ? country.phonecode
            : `+${country.phonecode}`,
          value: country.phonecode.startsWith("+")
            ? country.phonecode
            : `+${country.phonecode}`,
          altValue: `${country.flag} ${country.name} (${country.phonecode})`,
          extraInfo: "",
        });

        baseCountries.push({
          key: country.isoCode,
          value: ` ${country.flag} ${country.name}`,
          extras: country.name,
          extraInfo: "",
        });
      });
    };

    const setStates = () => {
      if (countryCode.value) {
        const allStates = State.getStatesOfCountry(countryCode.value);
        states.length = 0;
        states.push(
          ...allStates.map((state) => ({
            key: state.isoCode,
            value: state.name,
            extras: state.name,
            extraInfo: "",
          }))
        );
      }
    };

    const handleNext = async () => {};

    watch(countryCode, () => {
      setStates();
      showStateSelector.value = false;
      setTimeout(() => {
        showStateSelector.value = true;
      }, 100);
    });

    onMounted(() => {
      setCountries();
    });

    return {
      FormValidations,
      Logic,
      formData,
      handleNext,
      formComponent,
      loadingState,
      countryCode,
      showStateSelector,
      countries,
      photoUrl,
      phoneCountryCode,
      stateIsoCode,
      baseCountries,
      states,
    };
  },
  data() {
    return {
      parentRefs: [],
    };
  },
  mounted() {
    const parentRefs: any = this.$refs;
    this.parentRefs = parentRefs;
  },
});
</script>
