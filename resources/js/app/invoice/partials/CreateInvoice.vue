<template>
  <div class="app-container">
    <div>

      <span v-if="params">
        <router-link
          v-if="checkPermission(['view invoice'])"
          :to="{name:'Invoices'}"
          class="btn btn-default"
        >View Sales List</router-link>
      </span>

    </div>
    <div v-if="pageOption ==='create'">
      <div v-if="params" class="box">
        <div class="box-header">
          <h4 class="box-title">Create New Sales Record</h4>
          <span class="pull-right">
            <!-- <a
              v-if="checkPermission(['create invoice']) && upload_type ==='normal'"
              class="btn btn-success"
              @click="upload_type ='bulk'"
            >Bulk Upload</a> -->
            <a
              v-if="checkPermission(['create invoice']) && upload_type ==='bulk'"
              class="btn btn-primary"
              @click="upload_type ='normal'"
            >Normal Upload</a>
            <router-link
              v-if="checkPermission(['view invoice'])"
              :to="{name:'Invoices'}"
              class="btn btn-danger"
            >Cancel</router-link>
            <el-button
              type="primary"
              @click="loadOfflineData()"
            >Load Unsaved Record</el-button>

          </span>
        </div>

        <div v-if="upload_type ==='bulk'" class="box-body">
          <bulk-invoice-upload
            :params="params"
            :customers="customers"
            @created="onCreateUpdate"
          />
        </div>
        <div v-else class="box-body">
          <el-form ref="form" v-loading="loadForm" :model="form" label-width="120px">
            <el-row :gutter="5" class="padded">
              <el-col :xs="24" :sm="12" :md="12">
                <label for>Receipt Number</label>
                <el-input
                  v-model="form.invoice_number"
                  placeholder="Will be auto generated when submitted"
                  class="span"
                  disabled
                />
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
                <!-- <el-select
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
                    :disabled="warehouse.id !== 1"
                  />
                </el-select> -->
              </el-col>
              <el-col :xs="24" :sm="12" :md="12">
                <label for>
                  Select Customer
                  <a
                    v-if="checkRole(['admin'])"
                    style="color: brown"
                    @click="dialogFormVisible = true"
                  >(Click to Add New Customer)</a>
                </label>
                <el-select
                  v-model="form.customer_id"
                  placeholder="Select Customer"
                  filterable
                  class="span"
                >
                  <el-option
                    v-for="(customer, customer_index) in customers"
                    :key="customer_index"
                    :value="customer.id"
                    :label="(customer.user) ? customer.user.name + ' [' + customer.user.phone + ']' : ''"
                  />
                </el-select>
                <!-- <label for>Invoice Date</label>
                <el-date-picker
                  v-model="form.invoice_date"
                  type="date"
                  placeholder="Invoice Date"
                  style="width: 100%;"
                  format="yyyy/MM/dd"
                  value-format="yyyy-MM-dd"
                  :picker-options="pickerOptions"
                /> -->
              </el-col>
            </el-row>
            <div v-if="show_product_list">
              <!-- <div class="alert alert-warning">Please ensure you raise invoice only for products available in the warehouse. </div> -->
              <el-row :gutter="2" class="padded">
                <el-col>
                  <div style="overflow: auto">
                    <label for>Products</label>
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th />
                          <th>Choose Product</th>
                          <th>Quantity</th>
                          <th>Rate</th>
                          <!-- <th>Per</th> -->
                          <!-- <th>Specify Batch (Optional)</th> -->
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(invoice_item, index) in invoice_items" :key="index">
                          <td>
                            <span v-if="!can_submit">
                              <a
                                class="btn btn-danger btn-flat fa fa-trash"
                                @click="removeLine(index)"
                              />
                              <a
                                v-if="index + 1 === invoice_items.length"
                                class="btn btn-info btn-flat fa fa-plus"
                                @click="addLine(index)"
                              />
                            </span>
                            <span v-else>
                              {{ index + 1 }}
                            </span>
                          </td>
                          <td>
                            <el-select
                              v-model="invoice_item.item"
                              value-key="id"
                              placeholder="Select Product"
                              filterable
                              class="span"
                              :disabled="can_submit"
                              @input="fetchItemDetails(index)"
                            >
                              <el-option
                                v-for="(item, item_index) in params.items"
                                :key="item_index"
                                :value="item"
                                :label="item.name"
                                :disabled="item.enabled === 0"
                              />
                            </el-select>
                            <div v-if="params.enable_stock_quantity_check_when_raising_invoice === 'yes'" v-loading="invoice_item.load">
                              <!-- <br><small class="label label-primary">Physical Stock: {{ invoice_item.total_stocked }} {{ invoice_item.type }}</small>

                              <br><small class="label label-warning">Total Pending Invoice: {{ invoice_item.total_invoiced_quantity }} {{ invoice_item.type }}</small> -->

                              <small v-if="invoice_item.stock_balance !== null" class="label label-success">Stock Balance: {{ invoice_item.stock_balance }} {{ invoice_item.type }}</small>
                            </div>
                          </td>
                          <td>
                            <el-input
                              v-model="invoice_item.quantity"
                              type="number"
                              outline
                              placeholder="Quantity"
                              min="0"
                              :disabled="can_submit"
                              @input="calculateTotal(index);"
                            >
                              <template slot="append">{{ invoice_item.type }}</template>
                            </el-input>
                            <br>
                            <div v-if="params.enable_stock_quantity_check_when_raising_invoice === 'yes' && invoice_item.stock_balance < invoice_item.quantity" class="label label-danger">You cannot raise invoice for this product due to insufficient stock</div>
                          </td>
                          <td>
                            <!-- {{ currency }} {{ Number(invoice_item.rate).toLocaleString() }}
                            <br>
                            <el-switch
                              v-model="invoice_item.is_promo"
                              active-text="Is Promo"
                              inactive-text="Not Promo"
                              @change="setItemAsPromo(index, invoice_item.is_promo);"
                            /> -->
                            <el-input
                              v-if="checkPermission(['update invoice product price'])"
                              v-model="invoice_item.rate"
                              type="number"
                              outline
                              disabled
                              @input="calculateTotal(index)"
                            />
                            <span v-else>{{ currency }} {{ Number(invoice_item.rate).toLocaleString() }}</span>
                          </td>
                          <!-- <td>{{ invoice_item.type }}</td> -->
                          <!-- <td>
                            <el-select
                              v-model="invoice_item.batches"
                              placeholder="Specify product batch for this supply"
                              filterable
                              class="span"
                              multiple
                              collapse-tags
                            >
                              <el-option
                                v-for="(batch, batch_index) in invoice_item.batches_of_items_in_stock"
                                :key="batch_index"
                                :value="batch.id"
                                :label="batch.batch_no + ' | ' + batch.expiry_date"
                              >
                                <span
                                  style="float: left"
                                >{{ batch.batch_no + ' | ' + batch.expiry_date }}</span>
                                <span
                                  style="float: right; color: #8492a6; font-size: 13px"
                                >({{ batch.balance - batch.reserved_for_supply }})</span>
                              </el-option>
                            </el-select>
                          </td> -->
                          <td align="right">
                            <el-input v-model="invoice_item.amount" type="hidden" outline />
                            {{ currency }} {{ Number(invoice_item.amount).toLocaleString() }}
                          </td>
                        </tr>
                        <tr v-if="fill_fields_error">
                          <td colspan="4">
                            <label
                              class="label label-danger"
                            >Please fill all empty fields before adding another row</label>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="4" align="right">
                            <label>Subtotal</label>
                          </td>
                          <td align="right">{{ currency }} {{ Number(form.subtotal).toLocaleString() }}</td>
                        </tr>
                        <tr>
                          <td colspan="4" align="right">
                            <el-dropdown
                              class="avatar-container right-menu-item hover-effect"
                              trigger="click"
                            >
                              <div class="avatar-wrapper" style="color: brown">
                                <label style="cursor:pointer">Add Discount</label>
                              </div>
                              <el-dropdown-menu slot="dropdown" style="padding: 10px;">
                                <el-input
                                  v-model="discount_rate"
                                  type="number"
                                  min="0"
                                  style="width: 50%;"
                                  :disabled="can_submit"
                                  @input="calculateTotal(null)"
                                />% of Subtotal
                                <el-dropdown-item divided>Enter Discount percentage</el-dropdown-item>
                              </el-dropdown-menu>
                            </el-dropdown>
                          </td>
                          <td align="right">{{ currency }} {{ Number(form.discount).toLocaleString() }}</td>
                        </tr>
                        <tr>
                          <td colspan="4" align="right">
                            <label>Grand Total</label>
                          </td>
                          <td align="right">
                            <label style="color: green">{{ currency }} {{ Number(form.amount).toLocaleString() }}</label>
                          </td>
                        </tr>
                        <!-- <tr>
                          <td align="right">Notes</td>
                          <td colspan="5">
                            <textarea
                              v-model="form.notes"
                              class="form-control"
                              rows="3"
                              placeholder="Type extra note on this invoice here..."
                            />
                          </td>
                        </tr> -->
                      </tbody>
                    </table>
                  </div>
                </el-col>
              </el-row>
              <el-row :gutter="2" class="padded">
                <el-col :xs="24" :sm="24" :md="24">
                  <div align="center">
                    <div v-if="can_submit">

                      <el-button type="success" size="lg" @click="submitNewInvoice('delivered')">
                        <i class="el-icon-check" />
                        Payment Made (Submit)
                      </el-button>
                      <el-button type="primary" @click="saveInvoice('pending')">
                        <i class="el-icon-plus" />
                        Save as Pending
                      </el-button>
                      <el-button type="danger" @click="can_submit = false">
                        <i class="el-icon-edit" />
                        Continue Selling
                      </el-button>
                    </div>
                    <el-button v-else :loading="loadPreview" type="primary" @click="checkProductsQuantityInStock">
                      <i class="el-icon-file" />
                      Preview Entry
                    </el-button>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-form>
          <add-new-customer
            :dialog-form-visible="dialogFormVisible"
            :params="params"
            @created="onCreateUpdate"
            @close="dialogFormVisible=false"
          />

        </div>
      </div>
    </div>
    <div v-if="pageOption === 'print'">
      <invoice-details
        :invoice="submittedInvoice"
        :company-name="params.company_name"
        :company-contact="params.company_contact"
        :currency="currency"
      />
    </div>

  </div>
</template>

<script>
import moment from 'moment';
import checkPermission from '@/utils/permission';
import checkRole from '@/utils/role';
import showItemsInCartons from '@/utils/functions';
import AddNewCustomer from '@/app/users/AddNewCustomer';
import BulkInvoiceUpload from './BulkInvoiceUpload';
import InvoiceDetails from '../Details';
import Resource from '@/api/resource';
const createInvoice = new Resource('invoice/general/store');
const checkProductsInStock = new Resource('invoice/general/check-product-quantity-in-stock');

// const necessaryParams = new Resource('fetch-necessary-params');
const fetchProductBatches = new Resource('stock/items-in-stock/product-batches');
export default {
  // name: 'CreateInvoice',
  components: { AddNewCustomer, BulkInvoiceUpload, InvoiceDetails },

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
        customer_id: '',
        invoice_number: '',
        status: 'pending',
        invoice_date: '',
        subtotal: 0,
        discount: 0,
        amount: 0,
        notes: '',
        invoice_items: [
          {
            item: null,
            load: false,
            item_id: '',
            quantity: 0,
            type: '',
            item_rate: null,
            rate: null,
            is_promo: false,
            amount: 0,
            batches: [],
            batches_of_items_in_stock: [],
            total_stocked: null,
            total_invoiced_quantity: null,
          },
        ],
      },
      empty_form: {
        warehouse_id: '',
        customer_id: '',
        invoice_number: '',
        status: 'pending',
        invoice_date: '',
        subtotal: 0,
        discount: 0,
        amount: 0,
        notes: '',
        invoice_items: [
          {
            item: null,
            load: false,
            item_id: '',
            quantity: 0,
            type: '',
            item_rate: null,
            rate: null,
            is_promo: false,
            amount: 0,
            batches: [],
            batches_of_items_in_stock: [],
            total_stocked: null,
            total_invoiced_quantity: null,
          },
        ],
      },
      invoice_items: [],
      newCustomer: {
        name: '',
        email: null,
        phone: null,
        address: '',
        role: 'customer',
        customer_type_id: '',
        password: '',
        confirmPassword: '',
      },
      rules: {
        customer_type: [
          {
            required: true,
            message: 'Customer Type is required',
            trigger: 'change',
          },
        ],
        name: [
          { required: true, message: 'Name is required', trigger: 'blur' },
        ],
        // email: [
        //   { required: true, message: 'Email is required', trigger: 'blur' },
        //   { type: 'email', message: 'Please input correct email address', trigger: ['blur', 'change'] },
        // ],
        // phone: [{ required: true, message: 'Phone is required', trigger: 'blur' }],
      },
      discount_rate: 0,
      submittedInvoice: {},
      pageOption: 'create',
    };
  },
  computed: {
    params() {
      return this.$store.getters.params;
    },
    customers() {
      return this.$store.getters.customers;
    },
    customer_types() {
      return this.$store.getters.customer_types;
    },
    unsavedInvoice() {
      return this.$store.getters.unsavedInvoice;
    },
  },
  watch: {
    invoice_items() {
      this.blockRemoval = this.invoice_items.length <= 1;
    },
  },
  mounted() {
    this.loadOfflineData();
    this.fetchNecessaryParams();
    this.fetchCustomers();
    this.addLine();
  },
  methods: {
    moment,
    checkPermission,
    checkRole,
    showItemsInCartons,
    loadOfflineData() {
      this.loadForm = true;
      this.$store.dispatch('invoice/loadOfflineInvoice').then(() => {
        this.form = this.unsavedInvoice;
        this.invoice_items = this.form.invoice_items;
        if (this.form.warehouse_id !== '') {
          this.show_product_list = true;
        }
        this.loadForm = false;
      });
    },
    rowIsEmpty() {
      this.fill_fields_error = false;
      const checkEmptyLines = this.invoice_items.filter(
        (detail) =>
          detail.item_id === '' ||
          detail.quantity === '' ||
          detail.rate === null ||
          detail.tax === null ||
          detail.total === 0,
      );
      if (checkEmptyLines.length >= 1) {
        this.fill_fields_error = true;
        // this.invoice_items[index].seleted_category = true;
        return true;
      }
      false;
    },
    addLine(index) {
      if (this.rowIsEmpty() && this.invoice_items.length > 0) {
        return;
      } else {
        // if (this.invoice_items.length > 0)
        //     this.invoice_items[index].grade = '';
        this.invoice_items.push({
          item: null,
          load: false,
          item_id: '',
          quantity: 0,
          type: '',
          item_rate: null,
          rate: null,
          is_promo: false,
          amount: 0,
          batches: [],
          batches_of_items_in_stock: [],
          total_stocked: null,
          total_invoiced_quantity: null,
        });
        const unsavedInvoice = this.form;
        unsavedInvoice.invoice_items = this.invoice_items;
        this.$store.dispatch('invoice/saveUnsavedInvoice', unsavedInvoice);
      }
    },
    removeLine(detailId) {
      this.fill_fields_error = false;
      if (!this.blockRemoval) {
        this.invoice_items.splice(detailId, 1);
        this.calculateTotal(null);
        const unsavedInvoice = this.form;
        unsavedInvoice.invoice_items = this.invoice_items;
        this.$store.dispatch('invoice/saveUnsavedInvoice', unsavedInvoice);
      }
    },
    fetchNecessaryParams() {
      const app = this;
      app.$store.dispatch('app/setNecessaryParams');
    },
    fetchCustomers() {
      const app = this;
      app.$store.dispatch('customer/fetch');
    },
    stockIsZero() {
      let isZero = 0;
      this.invoice_items.forEach(item => {
        const stock_balance = parseInt(item.stock_balance);
        const quantity = parseInt(item.quantity);
        if (stock_balance < 1) {
          isZero++;
        }
        if (stock_balance < quantity) {
          isZero++;
        }
      });
      return isZero;
    },
    checkProductsQuantityInStock() {
      const app = this;
      const form = app.form;
      form.invoice_items = app.invoice_items;
      app.loadPreview = true;
      checkProductsInStock
        .store(form)
        .then((response) => {
          app.can_submit = response.can_submit;
          app.invoice_items = response.invoice_items;
          app.loadPreview = false;
        })
        .catch((error) => {
          app.loadPreview = false;
          console.log(error.message);
        });
    },
    submitNewInvoice(status) {
      const app = this;
      if (this.stockIsZero() > 0) {
        app.$alert('Please remove all entries with insufficient stock');
        return;
      }
      if (this.rowIsEmpty()) {
        app.$alert('Please fill in all fields on each row');
        return;
      }
      var form = app.form;
      const checkEmptyFields =
        form.warehouse_id === '' ||
        form.currency_id === '';
      if (!checkEmptyFields) {
        if (confirm('Click OK to confirm that payment for the items are made')) {
          app.loadForm = true;
          form.invoice_items = app.invoice_items;
          form.status = status;
          app.disable_submit = true;
          createInvoice
            .store(form)
            .then((response) => {
              app.submittedInvoice = response.invoice;
              app.$message({
                message: 'Invoice Created Successfully!!!',
                type: 'success',
              });
              const warehouse_id = app.form.warehouse_id;
              app.form = app.empty_form;
              app.form.warehouse_id = warehouse_id;
              app.invoice_items = app.form.invoice_items;

              // persist it
              const unsavedInvoice = this.form;
              app.$store.dispatch('invoice/saveUnsavedInvoice', unsavedInvoice);

              app.disable_submit = false;
              app.pageOption = 'print';
              // app.$router.push({ name: 'Invoices' });
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
    saveInvoice(status) {
      const app = this;
      if (this.stockIsZero() > 0) {
        app.$alert('Please remove all entries with insufficient stock');
        return;
      }
      if (this.rowIsEmpty()) {
        app.$alert('Please fill in all fields on each row');
        return;
      }
      var form = app.form;
      const checkEmptyFields =
        form.warehouse_id === '' ||
        form.currency_id === '';
      if (!checkEmptyFields) {
        app.loadForm = true;
        form.invoice_items = app.invoice_items;
        form.status = status;
        app.disable_submit = true;
        createInvoice
          .store(form)
          .then((response) => {
            app.$message({
              message: 'Invoice Created Successfully!!!',
              type: 'success',
            });
            const warehouse_id = app.form.warehouse_id;
            app.form = app.empty_form;
            app.form.warehouse_id = warehouse_id;
            app.invoice_items = app.form.invoice_items;

            // persist it
            const unsavedInvoice = this.form;
            app.$store.dispatch('invoice/saveUnsavedInvoice', unsavedInvoice);

            app.disable_submit = false;
            app.$router.push({ name: 'Invoices' });
            app.loadForm = false;
          })
          .catch((error) => {
            app.loadForm = false;
            console.log(error.message);
          });
      } else {
        alert('Please fill the form fields completely');
      }
    },

    onCreateUpdate(created_row) {
      const app = this;
      app.customers.push(created_row);
    },
    fetchItemDetails(index) {
      const app = this;
      const item = app.invoice_items[index].item;
      app.invoice_items[index].item_rate = item.price.sale_price;
      app.invoice_items[index].rate = item.price.sale_price;
      app.invoice_items[index].item_id = item.id;
      app.invoice_items[index].type = item.basic_unit;
      app.invoice_items[index].quantity_per_carton = item.quantity_per_carton;
      app.invoice_items[index].no_of_cartons = 0;
      app.invoice_items[index].quantity = 1;
      // let tax = 0;
      // for (let a = 0; a < item.taxes.length; a++) {
      //   tax += parseFloat(item.taxes[a].rate);
      // }
      // app.invoice_items[index].tax = tax;

      // if (app.params.enable_stock_quantity_check_when_raising_invoice === 'yes') {
      //   app.setProductBatches(index, app.form.warehouse_id, item.id);
      // }
      app.calculateTotal(index);
    },
    setProductBatches(index, warehouse_id, item_id) {
      const app = this;
      const param = {
        warehouse_id: warehouse_id,
        item_id: item_id,
      };
      app.invoice_items[index].load = true;
      app.disable_submit = false;
      fetchProductBatches.list(param).then((response) => {
        app.invoice_items[index].load = false;

        const total_stocked = (response.total_balance) ? response.total_balance.total_balance : 0;
        const total_invoiced_quantity = (response.total_invoiced_quantity) ? response.total_invoiced_quantity.total_invoiced : 0;

        app.invoice_items[index].total_stocked = total_stocked;
        app.invoice_items[index].total_invoiced_quantity = total_invoiced_quantity;
        const stock_balance = total_stocked - total_invoiced_quantity;

        app.invoice_items[index].stock_balance = (stock_balance < 0) ? 0 : stock_balance;

        if (stock_balance < 1) {
          app.disable_submit = true;
        }
      });
    },
    showItemsInStock(index) {
      const app = this;
      app.batches_of_items_in_stock =
        app.invoice_items[index].batches_of_items_in_stock;
      app.items_in_stock_dialog = true;
    },
    calculateNoOfCartons(index) {
      const app = this;
      if (index !== null) {
        const quantity = app.invoice_items[index].quantity;
        const quantity_per_carton = app.invoice_items[index].quantity_per_carton;
        if (quantity_per_carton > 0) {
          const no_of_cartons = quantity / quantity_per_carton;
          app.invoice_items[index].no_of_cartons = no_of_cartons; // + parseFloat(tax);
        }
      }
    },
    checkStockBalance(index) {
      const app = this;
      // Get total amount for this item without tax
      if (app.params.enable_stock_quantity_check_when_raising_invoice === 'yes') {
        // if (index !== null) {
        //   const invoice_item = app.invoice_items[index];
        //   const item = app.invoice_items[index].item;
        //   const quantity = invoice_item.quantity;
        //   const available_stock = invoice_item.total_stocked - invoice_item.total_invoiced_quantity;
        //   app.disable_submit = false;
        //   if (quantity > available_stock) {
        //     app.disable_submit = true;
        //     app.$alert(`${item} stock balance is less than ${quantity}. Please enter a value within range`);
        //     app.invoice_items[index].quantity = 0;
        //     app.calculateTotal(index);
        //   }
        // }
      }
    },
    calculateTotal(index) {
      const app = this;
      // Get total amount for this item without tax
      if (index !== null) {
        const quantity = app.invoice_items[index].quantity;
        const unit_rate = app.invoice_items[index].rate;
        app.invoice_items[index].amount = parseFloat(
          quantity * unit_rate,
        ).toFixed(2); // + parseFloat(tax);
      }

      // we now calculate the running total of items invoiceed for with tax //////////
      // let total_tax = 0;
      let subtotal = 0;
      for (let count = 0; count < app.invoice_items.length; count++) {
        // const tax_rate = app.invoice_items[count].tax;
        // const quantity = app.invoice_items[count].quantity;
        // const unit_rate = app.invoice_items[count].rate;
        // total_tax += parseFloat(tax_rate * quantity * unit_rate);
        subtotal += parseFloat(app.invoice_items[count].amount);
      }
      // app.form.tax = total_tax.toFixed(2);
      app.form.subtotal = subtotal.toFixed(2);
      app.form.discount = parseFloat(
        (app.discount_rate / 100) * subtotal,
      ).toFixed(2);
      // subtract discount
      app.form.amount = parseFloat(subtotal - app.form.discount).toFixed(2);
    },
    setItemAsPromo(index, value) {
      const app = this;
      const item_rate = app.invoice_items[index].item_rate;
      app.invoice_items[index].rate = item_rate;
      if (value === true) {
        app.invoice_items[index].rate = 0;
      }
      app.calculateTotal(index);
    },

  },
};
</script>

