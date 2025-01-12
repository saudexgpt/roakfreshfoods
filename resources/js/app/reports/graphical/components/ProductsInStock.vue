<template>
  <div class="app-container">
    <el-row :gutter="0" class="panel-group" style="width: 100%">
      <highcharts :options="products_in_stock" />
    </el-row>
  </div>
</template>
<script>
import Resource from '@/api/resource';
const chartDataFetch = new Resource('reports/graphical/products-in-stock');
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
      products_in_stock: {
        chart: {
          type: 'column',
          options3d: {
            enabled: false,
            alpha: 0,
            beta: 0,
            depth: 100,
            viewDistance: 25,
          },
          // scrollablePlotArea: {
          //   minWidth: 900,
          //   scrollPositionX: 1,
          // },
        },
        title: {
          text: '',
        },
        subtitle: {
          text: '',
        },
        xAxis: {
          categories: [], // type: 'category', // categories: [],
          min: 0,
          max: 4,
          labels: {
            skew3d: true,
            style: {
              fontSize: '14px',
            },
          },
          title: {
            text: 'Products',
          },
        },
        yAxis: {
          min: 0,
          max: undefined,
          tickInterval: 50,
          title: {
            text: 'No. of Products',
          },
          stackLabels: {
            enabled: true,
            style: {
              fontWeight: 'bold',
              color: 'gray',
            },
          },
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: true,
            },
          },
        },
        series: [],

        // colors: ['#063', '#910000'],
        credits: {
          enabled: false,
        },
        scrollbar: {
          enabled: true,
          barBackgroundColor: 'gray',
          barBorderRadius: 7,
          barBorderWidth: 0,
          buttonBackgroundColor: 'gray',
          buttonBorderWidth: 0,
          buttonArrowColor: 'yellow',
          buttonBorderRadius: 7,
          rifleColor: 'yellow',
          trackBackgroundColor: '#fcfcfc',
          trackBorderWidth: 1,
          trackBorderColor: 'silver',
          trackBorderRadius: 7,
        },
      },
    };
  },
  watch: {
    warehouseId() {
      this.loadChart();
    },

    from() {
      this.loadChart();
    },
    to() {
      this.loadChart();
    },
  },
  created() {
    this.loadChart();
  },

  methods: {
    loadChart() {
      const app = this;
      const loader = chartDataFetch.loaderShow();
      chartDataFetch
        .list(app.params)
        .then((response) => {
          app.products_in_stock.series = response.series;
          app.products_in_stock.xAxis.categories = response.categories;
          app.products_in_stock.subtitle.text = response.subtitle;
          app.products_in_stock.title.text = response.title;
          loader.hide();
        })
        .catch((error) => {
          loader.hide();
          console.log(error);
        });
    },
    showCalendar() {
      this.show_calendar = !this.show_calendar;
    },
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
      app.params.from = from;
      app.params.to = to;
      app.params.panel = panel;
      app.loadChart();
    },
  },
};
</script>
<style>
.params-control {
  border-radius: 4px;
  box-shadow: none;
  border-color: #4db1eb;
  width: 100%;
  min-height: 35px;
}
</style>
