<template>
  <div class="">
    <br>
    <div class="box">
      <div class="box-header">
        <h4 class="box-title">{{ table_title }}</h4>
      </div>
      <div class="box-body">
        <div>
          <label class="radio-label" style="padding-left:0;">Filename: </label>
          <el-input v-model="filename" :placeholder="$t('excel.placeholder')" style="width:340px;" prefix-icon="el-icon-document" />
          <el-button :loading="downloadLoading" style="margin:0 0 20px 20px;" type="primary" icon="document" @click="handleDownload">
            Export Excel
          </el-button>
        </div>
        <v-client-table v-model="invoice_items" :columns="columns" :options="options">
          <div slot="amount" slot-scope="props">
            {{ currency + Number(props.row.amount).toLocaleString() }}
          </div>
          <div slot="date" slot-scope="props">
            {{ moment(props.row.date).format('MMM D, YYYY') }}
          </div>

        </v-client-table>

      </div>

    </div>
  </div>
</template>
<script>
import moment from 'moment';
import { parseTime } from '@/utils';
import Resource from '@/api/resource';
const outboundReport = new Resource('reports/tabular/outbounds');
// const deleteItemInStock = new Resource('stock/items-in-stock/delete');
export default {
  props: {
    params: {
      type: Object,
      default: () => ({
        warehouse_id: '', // initially set the id of first warehouse
        from: '',
        to: '',
        panel: '',
      }),
    },
    warehouseId: {
      type: Number,
      default: () => (null),
    },
    from: {
      type: String,
      default: () => (null),
    },
    to: {
      type: String,
      default: () => (null),
    },
  },
  data() {
    return {
      activeTab: 'Invoice',
      warehouses: [],
      invoice_items: [],
      invoice_statuses: [],
      currency: '',
      columns: ['invoice_no', 'customer', 'product', 'amount', 'quantity', 'status', 'date'],

      options: {
        headings: {
        },
        filterByColumn: true,
        // editableColumns:['name', 'category.name', 'sku'],
        sortable: ['invoice_no', 'customer', 'product', 'amount', 'quantity', 'status', 'date'],
        filterable: ['invoice_no', 'customer', 'product', 'amount', 'quantity', 'status', 'date'],
      },
      page: {
        option: 'list',
      },
      form: {
        warehouse_index: '',
        warehouse_id: '',
        from: '',
        to: '',
        panel: '',
      },
      submitTitle: 'Fetch Report',
      panel: 'month',
      future: false,
      panels: ['range', 'week', 'month', 'quarter', 'year'],
      show_calendar: false,
      table_title: 'Sales Report',
      in_warehouse: '',
      invoice: {},
      selected_row_index: '',
      downloadLoading: false,
      filename: 'Outbounds',

    };
  },
  watch: {
    warehouseId() {
      this.getInvoices();
    },

    from() {
      this.getInvoices();
    },
    to() {
      this.getInvoices();
    },
  },
  created() {
    this.getInvoices();
  },
  beforeDestroy() {

  },
  methods: {
    moment,
    getInvoices() {
      const app = this;
      outboundReport.list(app.params)
        .then(response => {
          app.invoice_items = response.outbounds;
          app.columns = response.columns;
          app.table_title = response.title;
        })
        .catch(error => {
          console.log(error.message);
        });
    },
    handleDownload() {
      this.downloadLoading = true;
      import('@/vendor/Export2Excel').then(excel => {
        const multiHeader = [[this.tableTitle, '', '', '', '', '', '', '']];
        const tHeader = ['Invoice No.', 'Customer', 'Product', 'Amount', 'Quantity', 'Status', 'Date'];
        const filterVal = this.columns;
        const list = this.invoice_items;
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
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'date') {
          return parseTime(v['date']);
        }
        return v[j];
      }));
    },
  },
};
</script>
