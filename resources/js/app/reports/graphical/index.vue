<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12" :md="12">
        <label for="">Select Store</label>
        <el-select v-model="form.warehouse_id" style="width: 100%">
          <el-option value disabled="disabled">Select Warehouse</el-option>
          <el-option
            v-for="(warehouse, index) in params.warehouses"
            :key="index"
            :value="warehouse.id"
            :label="warehouse.name"
          />
        </el-select>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12">
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
          <el-button id="pick_date" slot="reference" type="success">
            <i class="el-icon-date" /> Pick Date Range
          </el-button>
        </el-popover>
      </el-col>
    </el-row>
    <br>
    <el-row :gutter="10">
      <el-col :md="14">
        <el-card>
          <products-in-stock
            v-if="form.warehouse_id !== ''"
            :params="form"
            :warehouse-id="form.warehouse_id"
            :from="form.from"
            :to="form.to"
          />
        </el-card>
      </el-col>
      <el-col :md="10">
        <el-card>
          <pie-chart
            v-if="form.warehouse_id !== ''"
            :params="form"
            :warehouse-id="form.warehouse_id"
            :from="form.from"
            :to="form.to"
          />
        </el-card>
      </el-col>
      <el-col :md="24">
        <el-card>
          <out-bound
            v-if="form.warehouse_id !== ''"
            :params="form"
            :warehouse-id="form.warehouse_id"
            :from="form.from"
            :to="form.to"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import ProductsInStock from './components/ProductsInStock';
import PieChart from './components/PieChart';
import OutBound from '@/app/reports/tabular/outbound';
export default {
  name: 'AdminReport',
  components: {
    ProductsInStock,
    OutBound,
    // LineChart,
    // RaddarChart,
    PieChart,
    // BarChart,
    // TransactionTable,
    // TodoList,
    // BoxCard,
  },
  props: {
    useCarousel: {
      type: Boolean,
      default: () => (false),
    },
  },
  data() {
    return {
      activeActivity: 'first',
      data_summary: '',
      submitTitle: 'Fetch Report',
      panel: 'month',
      future: false,
      panels: ['range', 'week', 'month', 'quarter', 'year'],
      show_calendar: false,
      form: {
        warehouse_id: 1,
        from: '',
        to: '',
        panel: '',
      },
    };
  },
  computed: {
    params() {
      return this.$store.getters.params;
    },
  },
  watch: {
    params() {
      if (this.params.warehouses.length > 0) {
        this.form.wareouse_id = this.params.warehouses[0].id;
      }
    },
  },
  created() {
    this.form.wareouse_id = this.params.warehouses[0].id;
  },
  methods: {
    paramsat(date) {
      var month = date.toLocaleString('en-US', { month: 'short' });
      return month + ' ' + date.getDate() + ', ' + date.getFullYear();
    },
    setDateRange(values) {
      const app = this;
      document.getElementById('pick_date').click();
      let panel = app.panel;
      let from = app.week_start;
      let to = app.week_end;
      if (values !== '') {
        to = this.paramsat(new Date(values.to));
        from = this.paramsat(new Date(values.from));
        panel = values.panel;
      }
      app.form.from = from;
      app.form.to = to;
      app.form.panel = panel;
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 10px;
  background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 10px;
  }
}
</style>
