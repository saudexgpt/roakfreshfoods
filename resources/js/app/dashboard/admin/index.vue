<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="10" class="panel-group">
      <el-col :md="6">
        <panel-group v-if="data_summary" :data-summary="data_summary" />
      </el-col>
      <el-col :md="18">
        <el-row :gutter="10" class="panel-group">
          <el-col :md="6" class="card-panel-col">
            <router-link :to="{name: 'ManageItem'}">
              <el-card shadow="hover">
                <h3>
                  <i class="el-icon-present" />
                  <span>Products</span>
                </h3>
              </el-card>
            </router-link>
          </el-col>
          <el-col :md="6" class="card-panel-col">
            <router-link :to="{name: 'CreateInvoice'}">
              <el-card shadow="hover">
                <h3>
                  <i class="el-icon-sell" />
                  <span>New Sales</span>
                </h3>
              </el-card>
            </router-link>
          </el-col>
          <el-col :md="6" class="card-panel-col">
            <router-link :to="{name: 'Invoices'}">
              <el-card shadow="hover">
                <h3>
                  <i class="el-icon-money" />
                  <span>Income</span>
                </h3>
              </el-card>
            </router-link>
          </el-col>
          <el-col :md="6" class="card-panel-col">
            <router-link :to="{name: 'Expenses'}">
              <el-card shadow="hover">
                <h3>
                  <i class="el-icon-s-finance" />
                  <span>Expenses</span>
                </h3>
              </el-card>
            </router-link>
          </el-col>
          <el-col :md="6" class="card-panel-col">
            <router-link :to="{name: 'ViewWarehouse'}">
              <el-card shadow="hover">
                <h3>
                  <i class="el-icon-house" />
                  <span>Stores</span>
                </h3>
              </el-card>
            </router-link>
          </el-col>
          <el-col :md="6" class="card-panel-col">
            <router-link :to="{name: 'CustomerList'}">
              <el-card shadow="hover">
                <h3>
                  <i class="el-icon-user" />
                  <span>Customers</span>
                </h3>
              </el-card>
            </router-link>
          </el-col>
          <el-col :md="6" class="card-panel-col">
            <router-link :to="{name: 'BinCard'}">
              <el-card shadow="hover">
                <h3>
                  <i class="el-icon-files" />
                  <span>Stock Balance</span>
                </h3>
              </el-card>
            </router-link>
          </el-col>
          <el-col :md="6" class="card-panel-col">
            <router-link :to="{name: 'GraphicalReports'}">
              <el-card shadow="hover">
                <h3>
                  <i class="el-icon-data-analysis" />
                  <span>Report</span>
                </h3>
              </el-card>
            </router-link>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-row>
      <graphical-report :use-carousel="true" />
    </el-row>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup';
import GraphicalReport from '@/app/reports/graphical';
import Resource from '@/api/resource';
const adminDashboard = new Resource('dashboard/admin');

export default {
  name: 'AdminDashboard',
  components: {
    PanelGroup,
    GraphicalReport,
  },
  data() {
    return {
      data_summary: '',
      warehouses: [],
    };
  },
  mounted() {
    this.fetchDashboardDetails();
  },
  methods: {
    fetchDashboardDetails() {
      const app = this;
      adminDashboard.list()
        .then(response => {
          app.data_summary = response.data_summary;
          app.warehouses = response.warehouses;
        });
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
.panel-group {
  margin-top: 5px;
  .card-panel-col{
    margin-bottom: 10px;
  }
}
</style>
