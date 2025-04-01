<template>
  <div class="w-full flex flex-col items-center justify-start h-full space-y-6">
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col space-y-[20px] h-full"
    >
      <!-- Info box -->
      <app-info-box>
        <app-normal-text custom-class="!leading-5">
          <span class="font-semibold">Alright, let's get you rolling!</span>
          Help us get to know you and your business.
        </app-normal-text>
      </app-info-box>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="First Name"
        ref="firstName"
        name="First Name"
        use-floating-label
        v-model="formData.firstName"
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Last Name"
        ref="lastName"
        name="Last Name"
        use-floating-label
        v-model="formData.lastName"
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="tel"
        placeholder="Phone Number"
        ref="phoneNumber"
        name="Phone Number"
        use-floating-label
        v-model="formData.phoneNumber"
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Email Address"
        ref="email"
        name="Email"
        v-model="formData.email"
        use-floating-label
        :rules="[FormValidations.RequiredRule, FormValidations.EmailRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Business Name"
        ref="businessName"
        name="Business Name"
        v-model="formData.businessName"
        use-floating-label
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <div class="w-full grid grid-cols-2 gap-3">
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

        <app-select
          v-if="showStateSelector"
          :placeholder="'State'"
          :hasTitle="false"
          :paddings="'py-4 !px-3'"
          :options="states"
          ref="state"
          v-model="stateIsoCode"
          use-floating-label
          auto-complete
        >
        </app-select>
      </div>

      <!-- Spacer -->
      <div class="h-[30px]"></div>

      <!-- Spacer -->
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, watch, ref } from "vue";
import {
  AppFormWrapper,
  AppTextField,
  AppInfoBox,
  AppNormalText,
  AppSelect,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { Country, State } from "country-state-city";
import { SelectOption } from "@greep/ui-components/src/types";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppTextField,
    AppInfoBox,
    AppNormalText,
    AppSelect,
  },
  props: {},
  name: "AuthSetupAccountInfo",
  setup() {
    const FormValidations = Logic.Form;

    const formData = reactive({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      businessName: "",
      country: "",
      state: "",
    });

    const showStateSelector = ref(true);
    const formComponent = ref<any>(null);

    const stateIsoCode = ref("");
    const countryCode = ref("");

    const countries = reactive<SelectOption[]>([]);
    const states = reactive<SelectOption[]>([]);

    const setCountries = () => {
      countries.length = 0;
      const allCountries = Country.getAllCountries();
      countries.push(
        ...allCountries.map((country) => ({
          key: country.isoCode,
          value: ` ${country.flag} ${country.name}`,
        }))
      );
    };

    const setStates = () => {
      if (countryCode.value) {
        const allStates = State.getStatesOfCountry(countryCode.value);
        states.length = 0;
        states.push(
          ...allStates.map((state) => ({
            key: state.isoCode,
            value: state.name,
          }))
        );
      }
    };

    const continueWithForm = () => {
      const state = formComponent.value?.validate();
      if (state) {
        // Proceed with form submission
        formData.country =
          Country.getCountryByCode(countryCode.value)?.name || "";
        formData.state =
          State.getStateByCodeAndCountry(stateIsoCode.value, countryCode.value)
            ?.name || "";
        return formData;
      } else {
        return;
      }
    };

    onMounted(() => {
      setCountries();
    });

    watch(countryCode, () => {
      setStates();
      showStateSelector.value = false;
      setTimeout(() => {
        showStateSelector.value = true;
      }, 100);
    });

    return {
      FormValidations,
      Logic,
      formData,
      countries,
      states,
      stateIsoCode,
      countryCode,
      showStateSelector,
      formComponent,
      continueWithForm,
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
