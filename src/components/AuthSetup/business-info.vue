<template>
  <div class="w-full flex flex-col items-center justify-start h-full space-y-6">
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col space-y-[23px] h-full"
      v-if="!hideContent"
    >
      <!-- Info box -->
      <app-info-box v-if="!authUser">
        <app-normal-text custom-class="!leading-5">
          <span class="font-semibold">Let's keep rolling!</span>
          Showcase know your business and tell us where it is located.
        </app-normal-text>
      </app-info-box>

      <div class="w-full flex flex-row pb-3">
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

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Business Name *"
        ref="businessName"
        name="Business Name"
        v-model="formData.businessName"
        use-floating-label
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Business Category *"
        ref="businessCategory"
        name="Business Category"
        v-model="formData.businessCategory"
        use-floating-label
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Business Description *"
        ref="businessDescription"
        name="Business Description"
        v-model="formData.businessDescription"
        use-floating-label
        is-textarea
        :max-character="1500"
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
  AppIcon,
  AppFileAttachment,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { Country, State } from "country-state-city";
import { SelectOption } from "@greep/ui-components/src/types";
import { User } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppTextField,
    AppInfoBox,
    AppNormalText,
    AppSelect,
    AppIcon,
    AppFileAttachment,
  },
  props: {
    authUser: {
      type: Object as () => User,
    },
  },
  name: "AuthSetupBusinessInfo",
  setup(props) {
    const FormValidations = Logic.Form;

    const photoUrl = ref<string | null>("/images/avatar.svg");

    const hideContent = ref(false);

    const formData = reactive({
      businessName: "",
      businessCategory: "",
      businessDescription: "",
      country: "",
      state: "",
      photo: null,
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
          extras: country.name,
          extraInfo: "",
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
            extras: state.name,
            extraInfo: "",
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

    const setDefaultValues = () => {
      if (props.authUser) {
        hideContent.value = true;
        formData.businessName =
          props.authUser.profile?.business?.business_name || "";
        formData.businessCategory =
          props.authUser.profile?.business?.category || "";
        formData.businessDescription =
          props.authUser.profile?.business?.description || "";
        formData.country = props.authUser.profile?.business?.country || "";
        formData.state = props.authUser.profile?.business?.city || "";

        if (props.authUser.profile?.business?.logo) {
          photoUrl.value = props.authUser.profile?.business?.logo;
        }

        if (props.authUser.profile?.business?.country) {
          const country = countries.find(
            (c) => c.extras == props.authUser?.profile?.business?.country
          );
          countryCode.value = country?.key || "";
        }

        if (props.authUser.profile?.business?.city) {
          setStates();
          const state = states.find(
            (s) => s.extras == props.authUser?.profile?.business?.city
          );
          stateIsoCode.value = state?.key || "";
        }

        setTimeout(() => {
          hideContent.value = false;
        }, 100);
      }
    };

    onMounted(() => {
      setCountries();
      setDefaultValues();
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
      photoUrl,
      hideContent,
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
