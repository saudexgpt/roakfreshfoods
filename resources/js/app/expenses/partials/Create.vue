<template>
  <div class="app-container">
    <div>

      <span v-if="params">
        <router-link
          v-if="checkPermission(['view expense'])"
          :to="{name:'Expenses'}"
          class="btn btn-default"
        >View Sales List</router-link>
      </span>

    </div>
    <div v-if="pageOption ==='create'">
      <div v-if="params" class="box">
        <div class="box-header">
          <h4 class="box-title">Create New Expenditure</h4>
          <span class="pull-right">
            <router-link
              v-if="checkPermission(['view expense'])"
              :to="{name:'Expenses'}"
              class="btn btn-danger"
            >Cancel</router-link>

          </span>
        </div>
        <div class="box-body">
          <el-form ref="form" v-loading="loadForm" :model="form" label-width="120px">
            <el-row :gutter="5" class="padded">
              <el-col :xs="24" :sm="12" :md="12">
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
            </el-row>
            <div v-if="show_product_list">
              <!-- <div class="alert alert-warning">Please ensure you raise expense only for products available in the warehouse. </div> -->
              <el-row :gutter="2" class="padded">
                <el-col>
                  <div style="overflow: auto">
                    <label for>Expenses Details</label>
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th />
                          <th>Purpose of Expenditure (Give details)</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(expense_item, index) in expense_items" :key="index">
                          <td>
                            <span v-if="!can_submit">
                              <a
                                class="btn btn-danger btn-flat fa fa-trash"
                                @click="removeLine(index)"
                              />
                              <a
                                v-if="index + 1 === expense_items.length"
                                class="btn btn-info btn-flat fa fa-plus"
                                @click="addLine(index)"
                              />
                            </span>
                            <span v-else>
                              {{ index + 1 }}
                            </span>
                          </td>
                          <td>
                            <el-input
                              v-model="expense_item.purpose"
                              outline
                              placeholder="example: Petrol purchase"
                            />
                          </td>
                          <td>
                            <el-input
                              v-model="expense_item.amount"
                              type="number"
                              outline
                            />
                          </td>
                        </tr>
                        <tr v-if="fill_fields_error">
                          <td colspan="4">
                            <label
                              class="label label-danger"
                            >Please fill all empty fields before adding another row</label>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </el-col>
              </el-row>
              <el-row :gutter="2" class="padded">
                <el-col :xs="24" :sm="24" :md="24">
                  <div align="center">
                    <div>

                      <el-button type="success" @click="submitNewExpense">
                        <i class="el-icon-check" />
                        Submit
                      </el-button>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
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
import Resource from '@/api/resource';
const createExpense = new Resource('expense/store');
export default {
  // name: 'CreateExpense',
  components: { },

  data() {
    return {
      pickerOptions: {
        disabledDate(date) {
          var d = new Date(); // today
          d.setDate(d.getDate()); // one year from now
          return date > d;
        },
      },
      currency: '₦',
      upload_type: 'normal',
      // customers: [],
      // customer_types: [],
      items_in_stock_dialog: false,
      dialogFormVisible: false,
      userCreating: false,
      loadPreview: false,
      fill_fields_error: false,
      show_product_list: false,
      loadForm: false,
      batches_of_items_in_stock: [],
      disable_submit: false,
      can_submit: false,
      form: {
        warehouse_id: '',
        expense_items: [
          {
            purpose: '',
            amount: 0,
          },
        ],
      },
      empty_form: {
        warehouse_id: '',
        expense_items: [
          {
            purpose: '',
            amount: 0,
          },
        ],
      },
      expense_items: [],
      pageOption: 'create',
    };
  },
  computed: {
    params() {
      return this.$store.getters.params;
    },
  },
  watch: {
    expense_items() {
      this.blockRemoval = this.expense_items.length <= 1;
    },
  },
  mounted() {
    this.fetchNecessaryParams();
    this.addLine();
  },
  methods: {
    moment,
    checkPermission,
    checkRole,
    rowIsEmpty() {
      this.fill_fields_error = false;
      const checkEmptyLines = this.expense_items.filter(
        (detail) =>
          detail.purpose === '' ||
          detail.amount === 0,
      );
      if (checkEmptyLines.length >= 1) {
        this.fill_fields_error = true;
        // this.expense_items[index].seleted_category = true;
        return true;
      }
      false;
    },
    addLine(index) {
      if (this.rowIsEmpty() && this.expense_items.length > 0) {
        return;
      } else {
        // if (this.expense_items.length > 0)
        //     this.expense_items[index].grade = '';
        this.expense_items.push({
          purpose: '',
          amount: 0,
        });
      }
    },
    removeLine(detailId) {
      this.fill_fields_error = false;
      if (!this.blockRemoval) {
        this.expense_items.splice(detailId, 1);
      }
    },
    fetchNecessaryParams() {
      const app = this;
      app.$store.dispatch('app/setNecessaryParams');
    },
    submitNewExpense(status) {
      const app = this;
      if (this.rowIsEmpty()) {
        app.$alert('Please fill in all fields on each row');
        return;
      }
      var form = app.form;
      const checkEmptyFields =
        form.warehouse_id === '';
      if (!checkEmptyFields) {
        if (confirm('Click OK to confirm')) {
          app.loadForm = true;
          form.expense_items = app.expense_items;
          form.status = status;
          app.disable_submit = true;
          createExpense
            .store(form)
            .then((response) => {
              app.submittedExpense = response.expense;
              app.$message({
                message: 'Expense Created Successfully!!!',
                type: 'success',
              });
              const warehouse_id = app.form.warehouse_id;
              app.form = app.empty_form;
              app.form.warehouse_id = warehouse_id;
              app.expense_items = app.form.expense_items;

              // persist it

              app.disable_submit = false;
              app.$router.push({ name: 'Expenses' });
              app.loadForm = false;
            })
            .catch((error) => {
              app.loadForm = false;
              console.log(error.message);
            });
        }
      } else {
        alert('Please fill the form fields completely');
      }
    },

    onCreateUpdate(created_row) {
      const app = this;
      app.customers.push(created_row);
    },

  },
};
</script>

