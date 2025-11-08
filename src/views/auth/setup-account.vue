<template>
  <app-wrapper>
    <subpage-layout title="Setup Your Account">
      <div
        class="w-full flex flex-col items-center justify-start space-y-3 px-4 pt-4 overflow-y-auto"
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

          <template v-if="showFormItems">
            <div class="w-full flex flex-col pb-6">
              <app-text-field
                :has-title="false"
                type="text"
                placeholder="James"
                ref="firstName"
                name="First Name"
                usePermanentFloatingLabel
                v-model="formData.first_name"
                :update-value="formData.first_name"
                :rules="[FormValidations.RequiredRule]"
              >
              </app-text-field>
            </div>

            <div class="w-full flex flex-col pb-6">
              <app-text-field
                :has-title="false"
                type="text"
                placeholder="Micheal"
                ref="lastName"
                name="Last Name"
                usePermanentFloatingLabel
                v-model="formData.last_name"
                :update-value="formData.last_name"
                :rules="[FormValidations.RequiredRule]"
              >
              </app-text-field>
            </div>

            <div class="w-full grid grid-cols-12 gap-3 pb-6">
              <div class="col-span-3 flex flex-col">
                <app-select
                  :placeholder="'Country'"
                  :hasTitle="false"
                  :paddings="'py-4 !px-3'"
                  :options="countries"
                  name="Code"
                  ref="country"
                  usePermanentFloatingLabel
                  v-model="phoneCountryCode"
                  auto-complete
                >
                </app-select>
              </div>
              <div class="col-span-9 flex flex-col">
                <app-text-field
                  :has-title="false"
                  type="tel"
                  placeholder="0000000000"
                  ref="phoneNumber"
                  name="Phone Number"
                  usePermanentFloatingLabel
                  v-model="formData.phone_number"
                  :update-value="formData.phone_number"
                  :rules="[FormValidations.RequiredRule]"
                >
                </app-text-field>
              </div>
            </div>

            <div class="h-[100px] py-3"></div>
          </template>
        </app-form-wrapper>
      </div>

      <!-- Bottom section -->
      <div
        :class="`w-full flex flex-col px-4 fixed z-50 bottom-0 left-0 pt-4 bg-white ${
          formIsValid ? '' : 'opacity-50'
        }`"
        :style="`
          ${getBottomPadding}
        `"
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
import { Country } from "country-state-city";
import { SelectOption } from "@greep/ui-components/src/types";
import { onMounted } from "vue";
import { watch } from "vue";
import { computed } from "vue";
import { getBottomPadding } from "../../composable";
import { onIonViewWillEnter } from "@ionic/vue";

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

    const showFormItems = ref(false);

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
      });
    };

    const formIsValid = computed(() => {
      return (
        formData.first_name !== "" &&
        formData.last_name !== "" &&
        formData.phone_number !== ""
      );
    });

    const handleNext = async () => {
      const state = formComponent.value.validate();

      if (state && formIsValid.value) {
        if (loadingState.value) return;

        try {
          loadingState.value = true;

          formData.phone_number = Logic.Form.getPhoneNumber(
            phoneCountryCode.value,
            formData.phone_number
          );

          Logic.User.UpdateProfileForm = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone_number: formData.phone_number,
            country: formData.country,
            state: formData.state,
            profile_photo: formData.photo ? formData.photo : undefined,
          };

          await Logic.User.UpdateProfile();
          await Logic.Auth.GetAuthUser();

          Logic.Common.hideLoader();
          Logic.Common.GoToRoute("/auth/setup");
        } catch {
          //
        } finally {
          loadingState.value = false;
        }
      }
    };

    watch(countryCode, () => {
      showStateSelector.value = false;
      setTimeout(() => {
        showStateSelector.value = true;
      }, 100);
    });

    onIonViewWillEnter(() => {
      if (Logic.Auth.AuthUser) {
        showFormItems.value = false;
        formData.first_name = Logic.Auth.AuthUser?.first_name;
        formData.last_name = Logic.Auth.AuthUser?.last_name;

        setTimeout(() => {
          showFormItems.value = true;
        }, 200);
      } else {
        showFormItems.value = true;
      }
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
      formIsValid,
      getBottomPadding,
      showFormItems,
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
