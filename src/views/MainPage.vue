<template>
  <div class="main-page-wrap">
    <AssetListForm></AssetListForm>
  </div>
</template>

<script>
import AssetListForm from '@/components/AssetListForm.vue';
import listMixins from '@/mixins/listMixins.js';
export default {
  components: {
    AssetListForm,
  },
  mixins: [listMixins],
};
</script>

<style></style>
