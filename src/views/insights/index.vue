<template>
  <app-wrapper>
    <subpage-layout title="Insights">
      <div
        class="w-full flex flex-col items-center justify-start px-4 h-full pt-2"
      >
         <div class="w-full grid gap-3">
          <!--  -->
          <app-details :details="[{title: 'Revenue', content: '₺1.15M' }]" />

          <!--  -->
          <app-details :details="[{title: 'Events Hosted', content: '16' }]" />

          <!--  -->
          <app-details :details="[{title: 'Tickets Sold', content: '4232' }]" />
          
          <!--  --> 
          <app-details :details="[{title: 'Tickets Sold Today',}]" >
            <template #content="{  defaultClass }">
              <div class="flex items-center space-x-1 w-fit">
                <app-normal-text :class="defaultClass"> 154 </app-normal-text>
                <app-normal-text custom-class="!text-green !font-semibold"> 22% </app-normal-text>
                <app-icon name="arrow-up"/> 
              </div>
            </template>
          </app-details>

          <!--  --> 
          <app-details :details="[{title: 'Tickets Sold Yesterday',}]" >
            <template #content="{  defaultClass }">
              <div class="flex items-center space-x-1 w-fit">
                <app-normal-text :class="defaultClass"> 124 </app-normal-text>
                <app-normal-text custom-class="!text-green !font-semibold"> 22% </app-normal-text>
                <app-icon name="arrow-down"/> 
              </div>
            </template>
          </app-details>

          <!--  -->
          <app-details :details="[{title: 'Tickets Sold This Month', content: 'test' }]" >
            <template #content="{  defaultClass }">
              <div class="flex items-center space-x-1 w-fit">
                <app-normal-text :class="defaultClass"> 8776 </app-normal-text>
                <app-normal-text custom-class="!text-green !font-semibold"> 22% </app-normal-text>
                <app-icon name="arrow-up"/> 
              </div>
            </template>
          </app-details>
        </div>
      </div> 
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { 
  AppNormalText, 
  AppDetails,
  AppIcon
} from "@greep/ui-components"; 
 

export default defineComponent({
  name: "InsightsPage",
  components: { 
    AppNormalText, 
    AppDetails,
    AppIcon
  }, 
  setup() { 

    return { 
    };
  },
});
</script>
