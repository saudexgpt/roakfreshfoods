<template>
  <div class="app-container">
    <div v-if="page.option==='list'">
      <router-link
        v-if="checkPermission(['create expense'])"
        :to="{name:'CreateExpense'}"
        class="btn btn-default"
      >Create New Expenses</router-link>
      <el-row :gutter="10">
        <el-col :xs="24" :sm="8" :md="8">
          <label for>Select Store</label>
          <el-select
            v-model="selected_warehouse"
            value-key="id"
            placeholder="Select Store"
            class="span"
            filterable
            @input="getExpenses"
          >
            <el-option
              v-for="(warehouse, index) in params.warehouses"
              :key="index"
              :value="warehouse"
              :label="warehouse.name"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="10" :md="10">
          <br>
          <el-popover placement="right" trigger="click">
            <date-range-picker
              :from="$route.query.from"
              :to="$route.query.to"
              :panel="panel"
              :panels="panels"
              :submit-title="submitTitle"
              :future="future"
              @update="setDateRange"
            />
            <el-button id="pick_date" slot="reference" type="primary">
              <i class="el-icon-date" /> Pick Date Range
            </el-button>
          </el-popover>
        </el-col>
      </el-row>
      <br>
    </div>
    <div v-if="page.option==='list'" class="box">
      <div class="box-header">
        <h4 class="box-title">{{ table_title }}</h4>
      </div>
      <div class="box-body">
        <div>
          <label class="radio-label" style="padding-left:0;">Filename:</label>
          <el-input
            v-model="filename"
            :placeholder="$t('excel.placeholder')"
            style="width:340px;"
            prefix-icon="el-icon-document"
          />
          <el-button
            :loading="downloadLoading"
            style="margin:0 0 20px 20px;"
            type="primary"
            icon="document"
            @click="handleDownload"
          >Export Excel</el-button>
        </div>
        <v-client-table v-model="expenses" :columns="columns" :options="options">

          <div
            slot="amount"
            slot-scope="props"
          >{{ currency + Number(props.row.amount).toLocaleString() }}</div>
          <div
            slot="creator.user.name"
            slot-scope="props"
          >{{ (props.row.creator) ? props.row.creator.name : '' }}</div>
          <div
            slot="approver.user.name"
            slot-scope="props"
          >{{ (props.row.approver) ? props.row.approver.name : 'pending approval' }}</div>
          <div
            slot="created_at"
            slot-scope="props"
          >{{ moment(props.row.created_at).format('MMMM Do YYYY, h:mm:ss a') }}</div>
          <div slot="action" slot-scope="props">
            <div>
              <a class="btn btn-default" @click="expense=props.row; page.option='expense_details'">
                <i class="el-icon-tickets" />
              </a>
              <a
                v-if="props.row.approved_by === null && checkPermission(['update expense'])"
                class="btn btn-warning"
                @click="expense=props.row; page.option='edit_expense'; selected_row_index=props.index"
              >
                <i class="el-icon-edit" />
              </a>
              <a
                v-if="props.row.approved_by === null && checkPermission(['delete expense'])"
                class="btn btn-danger"
                @click="deleteExpense(props.index, props.row)"
              >
                <i class="fa fa-trash" />
              </a>
            </div>
          </div>
        </v-client-table>
      </div>
      <el-row :gutter="20">
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="form.page"
          :limit.sync="form.limit"
          @pagination="getExpenses"
        />
      </el-row>
    </div>
    <div v-if="page.option==='edit_expense'">
      <a class="btn btn-danger no-print" @click="page.option='list'">Go Back</a>
      <edit-expense :expense="expense" :page="page" :params="params" @update="onEditUpdate" />
    </div>
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'; // Secondary package based on el-pagination
import moment from 'moment';
import { parseTime } from '@/utils';
import Resource from '@/api/resource';
import checkPermission from '@/utils/permission';
import checkRole from '@/utils/role';
import EditExpense from './partials/Edit';
// const necessaryParams = new Resource('fetch-necessary-params');
const fetchExpenses = new Resource('expense');
const deleteExpenseResource = new Resource('expense/delete');
export default {
  name: 'Expenses',
  components: { EditExpense, Pagination },
  props: {
    canCreateNewExpense: {
      type: Boolean,
      default: () => true,
    },
  },
  data() {
    return {
      checkAll: false,
      isIndeterminate: true,
      checkedExpenses: [],
      archiving: false,
      // params: {},
      warehouses: [],
      expenses: [],
      expense_statuses: [],
      currency: '',
      columns: [
        'action',
        'purpose',
        'amount',
        'creator.name',
        'approver.name',
        'created_at',
      ],

      options: {
        headings: {
          'creator.name': 'Created By',
          'approver.name': 'Approved By',
          created_at: 'Date',

          // id: 'S/N',
        },
        pagination: {
          dropdown: true,
          chunk: 10,
        },
        perPage: 10,
        // editableColumns:['name', 'category.name', 'sku'],
        sortable: [
          'creator.name',
          'approver.name',
        ],
        filterable: [
          'purpose',
        ],
      },
      page: {
        option: 'list',
      },
      selected_warehouse: '',
      form: {
        warehouse_id: '',
        from: '',
        to: '',
        panel: '',
        status: 'pending',
        page: 1,
        limit: 10,
        keyword: '',
      },
      total: 0,
      loading: false,
      load_table: false,
      downloading: false,
      userCreating: false,
      submitTitle: 'Fetch',
      panel: 'month',
      future: false,
      panels: ['range', 'week', 'month', 'quarter', 'year'],
      show_calendar: false,
      table_title: '',
      in_warehouse: '',
      expense: {},
      selected_row_index: '',
      downloadLoading: false,
      filename: 'Expenses-Records',
    };
  },
  computed: {
    params() {
      return this.$store.getters.params;
    },
  },
  mounted() {
    this.fetchNecessaryParams();
    this.getExpenses();
  },
  beforeDestroy() {},
  methods: {
    moment,
    checkPermission,
    checkRole,
    fetchNecessaryParams() {
      const app = this;
      app.$store.dispatch('app/setNecessaryParams');
      // const params = app.params;
      app.warehouses = app.params.warehouses;
      app.invoice_statuses = app.params.invoice_statuses;
      app.currency = app.params.currency;
    },
    onEditUpdate(updated_row) {
      const app = this;
      // app.items_in_stock.splice(app.itemInStock.index-1, 1);
      app.getExpenses();
    },
    showCalendar() {
      this.show_calendar = !this.show_calendar;
    },
    format(date) {
      var month = date.toLocaleString('en-US', { month: 'short' });
      return month + ' ' + date.getDate() + ', ' + date.getFullYear();
    },
    setDateRange(values) {
      const app = this;
      document.getElementById('pick_date').click();
      app.show_calendar = false;
      let panel = app.panel;
      let from = app.week_start;
      let to = app.week_end;
      if (values !== '') {
        to = this.format(new Date(values.to));
        from = this.format(new Date(values.from));
        panel = values.panel;
      }
      app.form.from = from;
      app.form.to = to;
      app.form.panel = panel;
      app.getExpenses();
    },
    handleFilter() {
      this.form.page = 1;
      this.getExpenses();
    },
    getExpenses() {
      const app = this;
      const loader = fetchExpenses.loaderShow();
      const { limit, page } = app.form;
      app.options.perPage = limit;
      const param = app.form;
      app.expenses = [];
      param.warehouse_id = app.selected_warehouse.id;
      var extra_tableTitle = '';
      if (app.form.from !== '' && app.form.to !== '') {
        extra_tableTitle = ' from ' + app.form.from + ' to ' + app.form.to;
      }
      app.table_title = `Expenses Records` +
          // app.selected_warehouse.name +
          extra_tableTitle;
      fetchExpenses
        .list(param)
        .then(response => {
          // app.expenses = response.expenses;
          app.expenses = response.expenses.data;
          app.expenses.forEach((element, index) => {
            element['index'] = (page - 1) * limit + index + 1;
          });
          app.total = response.expenses.total;
          loader.hide();
        })
        .catch(error => {
          loader.hide();
          console.log(error.message);
        });
    },
    deleteExpense(index, expense) {
      const app = this;
      const message = 'Are you sure? This cannot be undone!';
      if (confirm(message)) {
        deleteExpenseResource.destroy(expense.id, expense).then(response => {
          app.expenses.splice(index - 1, 1);
        });
      }
    },
    handleDownload() {
      this.downloadLoading = true;
      import('@/vendor/Export2Excel').then(excel => {
        const multiHeader = [[this.table_title, '', '', '', '', '', '']];
        const tHeader = [
          'PURPOSE',
          'AMOUNT',
          'CREATED  BY',
          'APPROVED BY',
          'DATE',
        ];
        const filterVal = [
          'purpose',
          'amount',
          'creator.user.name',
          'approver.user.name',
          'created_at',
        ];
        const list = this.expenses;
        const data = this.formatJson(filterVal, list);
        excel.export_json_to_excel({
          multiHeader,
          header: tHeader,
          data,
          filename: this.filename,
          autoWidth: true,
          bookType: 'csv',
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          if (j === 'approver.user.name') {
            return v['approver']['user']['name'];
          }
          if (j === 'creator.user.name') {
            return v['creator']['user']['name'];
          }
          if (j === 'created_at') {
            return parseTime(v[j]);
          }
          return v[j];
        }),
      );
    },
  },
};
</script>
