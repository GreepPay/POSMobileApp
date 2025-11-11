<template>
  <div class="w-full flex flex-col items-center justify-start space-y-6">
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col space-y-[23px]"
      v-if="!hideContent"
    >
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
        placeholder="Your legal business name"
        ref="businessName"
        name="Name"
        v-model="formData.businessName"
        usePermanentFloatingLabel
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <app-select
        :placeholder="'Select business category'"
        :hasTitle="false"
        :paddings="'py-4 !px-4'"
        :options="ecommerceCategories"
        name="Category"
        ref="businessCategory"
        usePermanentFloatingLabel
        v-model="formData.businessCategory"
        auto-complete
      >
      </app-select>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Enter your business details"
        ref="businessDescription"
        name="Description"
        v-model="formData.businessDescription"
        usePermanentFloatingLabel
        is-textarea
        :max-character="1500"
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <div class="w-full flex flex-col">
        <app-normal-text
          class="w-full !font-[500] pt-1 mb-6 !text-sm !text-gray-500"
        >
          Business Location
        </app-normal-text>

        <div class="w-full flex flex-col">
          <div class="w-full flex flex-col pb-6">
            <app-select
              :placeholder="'Select country'"
              :hasTitle="false"
              :paddings="'py-4 !px-4'"
              :options="countries"
              name="Country"
              ref="country"
              usePermanentFloatingLabel
              v-on:update:model-value="
                (data) => {
                  formData.country = data;
                }
              "
              v-model="countryCode"
              auto-complete
            >
            </app-select>
          </div>
          <div class="w-full flex flex-col pb-6">
            <app-select
              v-if="showStateSelector"
              :placeholder="'Select state'"
              :hasTitle="false"
              :paddings="'py-4 !px-4'"
              :options="states"
              ref="state"
              name="State"
              v-on:update:model-value="
                (data) => {
                  formData.state = data;
                }
              "
              v-model="stateIsoCode"
              usePermanentFloatingLabel
              auto-complete
            >
            </app-select>
          </div>
        </div>
      </div>

      <!-- Info box -->
      <app-info-box>
        <app-normal-text custom-class="!leading-5">
          Address below is for where we pickup your items; we handle your
          delivery.
        </app-normal-text>
      </app-info-box>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Enter full business address"
        ref="businessAddress"
        name="Address"
        v-model="formData.address"
        usePermanentFloatingLabel
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Optional helpful address info"
        ref="businessAddressNote"
        name="Address Note"
        v-model="formData.address_note"
        usePermanentFloatingLabel
        is-textarea
        :rules="[FormValidations.RequiredRule]"
      >
      </app-text-field>

      <!-- Spacer -->
      <div class="h-[80px]"></div>

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
  AppIcon,
  AppFileAttachment,
  AppSelect,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { SelectOption } from "@greep/ui-components/src/types";
import { User } from "@greep/logic/src/gql/graphql";
import { Country, State } from "country-state-city";

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
      address: "",
      address_note: "",
    });

    const ecommerceCategories = reactive<SelectOption[]>([
      { key: "payment-solutions", value: "Payment Solutions" },
      { key: "currency-exchange", value: "Currency Exchange" },
      { key: "events-and-tickets", value: "Events & Tickets" },
      { key: "logistics-and-shipping", value: "Logistics & Shipping" },
      { key: "fashion-and-apparel", value: "Fashion & Apparel" },
      { key: "electronics", value: "Electronics" },
      { key: "home-and-kitchen", value: "Home & Kitchen" },
      { key: "beauty-and-personal-care", value: "Beauty & Personal Care" },
      { key: "health-and-wellness", value: "Health & Wellness" },
      { key: "sports-and-outdoors", value: "Sports & Outdoors" },
      { key: "baby-and-kids", value: "Baby & Kids" },
      { key: "automotive", value: "Automotive" },
      { key: "books-and-media", value: "Books & Media" },
      { key: "food-and-grocery", value: "Food & Grocery" },
      { key: "pet-supplies", value: "Pet Supplies" },
      { key: "jewelry-and-accessories", value: "Jewelry & Accessories" },
      { key: "office-supplies", value: "Office Supplies" },
      { key: "toys-and-games", value: "Toys & Games" },
      { key: "furniture", value: "Furniture" },
      { key: "tools-and-diy", value: "Tools & DIY" },
      { key: "arts-and-crafts", value: "Arts & Crafts" },
      { key: "music-and-instruments", value: "Music & Instruments" },
      { key: "travel-and-luggage", value: "Travel & Luggage" },
      { key: "green-products", value: "Green Products" },
    ]);

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
          value: `${country.flag} ${country.name}`,
          extraInfo: "",
        }))
      );
    };

    const continueWithForm = () => {
      const state = formComponent.value?.validate();
      if (state) {
        return formData;
      } else {
        return;
      }
    };

    const setDefaultValues = () => {
      if (props.authUser) {
        const business = Logic.Auth.GetDefaultBusiness();
        hideContent.value = true;
        formData.businessName = business?.business_name || "";
        formData.businessCategory = business?.category || "";
        formData.businessDescription = business?.description || "";
        formData.country = business?.country || "";
        formData.state = business?.city || "";

        if (business?.logo) {
          photoUrl.value = business?.logo;
        }

        setTimeout(() => {
          hideContent.value = false;
        }, 100);
      }
    };

    onMounted(() => {
      setDefaultValues();
      setCountries();
    });

    const setStates = () => {
      if (countryCode.value) {
        const allStates = State.getStatesOfCountry(countryCode.value);
        states.length = 0;
        states.push(
          ...allStates.map((state) => ({
            key: state.name,
            value: state.name,
            extraInfo: "",
          }))
        );
      }
    };

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
      ecommerceCategories,
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
