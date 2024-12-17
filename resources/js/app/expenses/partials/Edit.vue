<template>
  <div class>
    <div>
      <div v-if="params" class="box">
        <div class="box-header">
          <h4 class="box-title">Edit Expense</h4>
        </div>
        <div class="box-body">
          <el-form ref="form" :model="form" label-width="120px">
            <el-row :gutter="5" class="padded">
              <el-col :xs="24" :sm="8" :md="8">
                <label for>Select Store</label>
                <el-select
                  v-model="form.warehouse_id"
                  placeholder="Select Store"
                  filterable
                  class="span"
                  @input="show_product_list = true"
                >
                  <el-option
                    v-for="(warehouse, warehouse_index) in params.warehouses"
                    :key="warehouse_index"
                    :value="warehouse.id"
                    :label="warehouse.name"
                  />
                </el-select>
              </el-col>
              <el-col :xs="24" :sm="8" :md="8">
                <label for>Purpose Store</label>
                <el-input
                  v-model="form.purpose"
                  outline
                  placeholder="example: Petrol purchase"
                />
              </el-col>
              <el-col :xs="24" :sm="8" :md="8">
                <label for>Amount</label>
                <el-input
                  v-model="form.amount"
                  type="number"
                  outline
                />
              </el-col>
            </el-row>
            <el-row :gutter="2" class="padded">
              <el-col :xs="24" :sm="6" :md="6">
                <el-button :disabled="disable_submit" type="success" @click="updateExpense">
                  <i class="el-icon-check" />
                  Update
                </el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import checkPermission from '@/utils/permission';
import checkRole from '@/utils/role';
import showItemsInCartons from '@/utils/functions';
import Resource from '@/api/resource';
const editExpense = new Resource('expense/update');
const necessaryParams = new Resource('fetch-necessary-params');
export default {
  // name: 'AddNewExpense',
  props: {
    expense: {
      type: Object,
      default: () => ({}),
    },
    page: {
      type: Object,
      default: () => ({
        option: 'edit_expense',
      }),
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      load: false,
      pickerOptions: {
        disabledDate(date) {
          var d = new Date(); // today
          d.setDate(d.getDate()); // one year from now
          return date > d;
        },
      },
      currency: '₦',
      customers: [],
      customer_types: [],
      items_in_stock_dialog: false,
      dialogFormVisible: false,
      userCreating: false,
      fill_fields_error: false,
      show_product_list: false,
      disable_submit: false,
      form: {
        warehouse_id: '',
        purpose: '',
        amount: 0,
      },
      empty_form: {
        warehouse_id: '',
        purpose: '',
        amount: 0,
      },
    };
  },
  watch: {
    expense_items() {
      this.blockRemoval = this.expense_items.length <= 1;
    },
  },
  mounted() {
    this.form = this.expense;
    // this.addLine();
  },
  methods: {
    moment,
    checkPermission,
    checkRole,
    showItemsInCartons,
    fetchNecessaryParams() {
      const app = this;
      necessaryParams.list().then((response) => {
        app.params = response.params;
      });
    },
    updateExpense() {
      const app = this;
      var form = app.form;
      const checkEmptyFields =
            form.warehouse_id === '' ||
            form.purpose === '' ||
            form.amount === '';
      if (!checkEmptyFields) {
        if (confirm('Click OK to confirm that payment for the items are made')) {
          app.load = true;
          form.expense_items = app.expense_items;
          form.status = 'delivered';
          form.deletable_expense_items = app.deletable_expense_items;
          editExpense
            .update(form.id, form)
            .then((response) => {
              app.$message({
                message: 'Expense Updated Successfully!!!',
                type: 'success',
              });
              // app.form = app.empty_form;
              app.$emit('update', response.expense);
              app.load = false;
              app.page.option = 'list';
            })
            .catch((error) => {
              app.load = false;
              console.log(error.message);
            });
        }
      } else {
        app.$alert('Please fill the form fields completely');
      }
    },
  },
};
</script>

