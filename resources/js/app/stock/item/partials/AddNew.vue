<template>
  <div class="box">
    <div class="box-header">
      <h4 class="box-title">Create New Product</h4>
      <span class="pull-right">
        <a class="btn btn-danger" @click="page.option = 'list'"> Back</a>
      </span>
    </div>
    <div class="box-body">
      <aside>
        <el-form ref="form" :model="form" label-width="120px">
          <el-row :gutter="20" class="padded">
            <el-col :xs="24" :sm="12" :md="12">
              <label for="">Product Name</label>
              <el-input v-model="form.name" placeholder="Enter item name" class="span" />
              <label for="">Select Product Category</label>
              <el-select v-model="form.category_id" placeholder="Select item category" filterable class="span">
                <el-option v-for="(category, index) in categories" :key="index" :value="category.id" :label="category.name" />

              </el-select>
              <!-- <label for="">Stock Keeping Unit (SKU)</label>
              <el-input v-model="form.sku" placeholder="Stock Keeping Unit (SKU)" class="span" /> -->
              <label for="">Basic Unit</label>
              <el-select v-model="form.basic_unit" placeholder="Select Product" filterable class="span">
                <el-option v-for="(type, type_index) in params.package_types" :key="type_index" :value="type" :label="type" />

              </el-select>

              <label for="">Cost Price </label>
              <el-input v-model="form.cost_price" placeholder="Cost Price" class="span">
                <template slot="append">per {{ form.basic_unit }}</template>
              </el-input>

              <label for="">Selling Price</label>
              <el-input v-model="form.sale_price" placeholder="Selling Price" class="span">
                <template slot="append">per {{ form.basic_unit }}</template>
              </el-input>
              <!-- <label for="">Basic Unit Quantity per {{ form.package_type }}</label>
              <el-input v-model="form.basic_unit_quantity_per_package_type" placeholder="Enter Quantity" class="span" /> -->
              <label for="">Select Currency</label>
              <el-select v-model="form.currency_id" placeholder="Select Currency" class="span">
                <el-option v-for="(currency, index) in params.currencies" :key="index" :value="currency.id" :label="currency.name+' ('+currency.code+')'" />

              </el-select>

              <!-- <label for="">Quantity in a carton</label>
              <el-input v-model="form.quantity_per_carton" type="number" placeholder="Quantity in a carton" class="span" /> -->
            </el-col>
            <el-col :xs="24" :sm="12" :md="12">
              <label for="">Product Description</label>
              <textarea v-model="form.description" placeholder="Product Description" rows="5" class="form-control" />
              <p />
              <image-cropper
                v-show="imagecropperShow"
                :key="imagecropperKey"
                :width="150"
                :height="150"
                url="upload-file"
                lang-type="en"
                @close="close"
                @crop-upload-success="cropUploadSuccess"
                @crop-upload-fail="cropUploadFail"
              />
              <br><br>

              <a @click="imagecropperShow=true">
                <img :src="form.picture" width="150">
                Click to upload item image
              </a>

            </el-col>
          </el-row>
          <el-row :gutter="2" class="padded">
            <el-col :xs="24" :sm="6" :md="6">
              <el-button type="success" @click="addProduct"><i class="el-icon-upload" />
                Submit
              </el-button>
            </el-col>
          </el-row>
        </el-form>
      </aside>

    </div>
  </div>
</template>

<script>
import ImageCropper from '@/components/ImageCropper';
import Resource from '@/api/resource';
const createProduct = new Resource('stock/general-items/store');

export default {
  name: 'AddNewProduct',
  components: { ImageCropper },
  props: {
    params: {
      type: Object,
      default: () => ({}),
    },
    categories: {
      type: Array,
      default: () => ([]),
    },
    items: {
      type: Array,
      default: () => ([]),
    },
    page: {
      type: Object,
      default: () => ({
        option: 'add_new',
      }),
    },

  },
  data() {
    return {
      form: {
        name: '',
        package_type: '',
        quantity_per_carton: '',
        basic_unit: '',
        basic_unit_quantity_per_package_type: '',
        category_id: '',
        description: '',
        picture: 'images/no-image.jpeg',
        currency_id: 1,
        // tax_ids: [],
        cost_price: 0,
        sale_price: 0,
      },
      imagecropperShow: false,
      imagecropperKey: 0,
      image: 'images/no-image.jpeg',

    };
  },

  methods: {

    cropUploadSuccess(jsonData, field){
      console.log('-------- upload success --------');
      // console.log(jsonData);
      // console.log('field: ' + field);
      const app = this;
      app.imagecropperShow = false;
      app.imagecropperKey = app.imagecropperKey + 1;
      app.form.picture = jsonData.avatar;
    },
    cropUploadFail(status, field){
      console.log('-------- upload fail --------');
      console.log(status);
      console.log('field: ' + field);
    },
    close() {
      this.imagecropperShow = false;
    },
    addProduct() {
      const app = this;
      const load = createProduct.loaderShow();
      createProduct.store(app.form)
        .then(response => {
          app.$message({ message: 'New Product Added Successfully!!!', type: 'success' });
          app.items.push(response.item);
          app.resetForm();
          app.$emit('update', response);
          load.hide();
        })
        .catch(error => {
          load.hide();
          alert(error.message);
        });
    },
    resetForm() {
      const app = this;
      app.form = {
        name: '',
        package_type: '',
        // sku: '',
        category_id: '',
        description: '',
        picture: 'images/no-image.jpeg',
        currency_id: 1,
        // tax_ids: [],
        // purchase_price: '',
        sale_price: 0,
      };
    },

  },
};
</script>

