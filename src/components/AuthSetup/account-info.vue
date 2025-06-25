<template>
  <div class="w-full flex flex-col items-center justify-start h-full space-y-6">
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col space-y-[20px] h-full"
      v-if="!hideContent"
    >
      <!-- Info box -->
      <app-info-box v-if="!authUser">
        <app-normal-text custom-class="!leading-5">
          <span class="font-semibold">Let's get started!</span>
          Let's get started! Help us get to know you, the face behind the
          business.

          <br /><br /><span class="pt-2"
            >Required fields are marked with (*)</span
          >
        </app-normal-text>
      </app-info-box>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="First Name *"
        ref="firstName"
        name="First Name"
        use-floating-label
        v-model="formData.firstName"
        :update-value="formData.firstName"
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Last Name *"
        ref="lastName"
        name="Last Name"
        use-floating-label
        v-model="formData.lastName"
        :update-value="formData.lastName"
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <div class="w-full grid grid-cols-12 gap-3">
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
            v-model="formData.phoneNumber"
            :update-value="formData.phoneNumber"
            :rules="[FormValidations.RequiredRule]"
          >
          </app-text-field>
        </div>
      </div>

      <app-text-field
        v-if="!hideEmail"
        :has-title="false"
        type="text"
        placeholder="Email Address *"
        ref="email"
        name="Email"
        v-model="formData.email"
        use-floating-label
        :rules="[FormValidations.RequiredRule, FormValidations.EmailRule]"
      >
      </app-text-field>

      <!-- Spacer -->
      <div class="h-[30px]"></div>
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
import { Country } from "country-state-city";
import { SelectOption } from "@greep/ui-components/src/types";
import { User } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppTextField,
    AppInfoBox,
    AppNormalText,
    AppSelect,
  },
  props: {
    hideEmail: {
      type: Boolean,
      default: false,
    },
    authUser: {
      type: Object as () => User,
    },
  },
  name: "AuthSetupAccountInfo",
  setup(props) {
    const FormValidations = Logic.Form;

    const formData = reactive({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      businessName: "",
    });

    const hideContent = ref(false);

    const showStateSelector = ref(true);
    const formComponent = ref<any>(null);

    const countryCode = ref("+234");

    const countries = reactive<SelectOption[]>([]);

    const setCountries = () => {
      countries.length = 0;
      const allCountries = Country.getAllCountries();
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
      );
    };

    const continueWithForm = () => {
      const state = formComponent.value?.validate();
      if (state) {
        // Set phone number
        formData.phoneNumber = Logic.Form.getPhoneNumber(
          countryCode.value,
          formData.phoneNumber
        );
        return formData;
      } else {
        return;
      }
    };

    const setDefaultValues = () => {
      if (props.authUser) {
        hideContent.value = true;
        formData.firstName = props.authUser.first_name;
        formData.lastName = props.authUser.last_name;
        formData.email = props.authUser.email;
        formData.phoneNumber = props.authUser.phone
          ? Logic.Form.getPhoneAndCode(props.authUser.phone || "").phone
          : "";
        countryCode.value = Logic.Form.getPhoneAndCode(
          props.authUser.phone || ""
        ).code
          ? Logic.Form.getPhoneAndCode(props.authUser.phone || "").code
          : "+234";
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
      countryCode,
      showStateSelector,
      formComponent,
      continueWithForm,
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
