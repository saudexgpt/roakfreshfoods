<template>
  <div class="app-container">
    <el-row :gutter="0" class="panel-group" style="width: 100%">
      <highcharts :options="products_in_stock" />
    </el-row>
  </div>
</template>
<script>
import Resource from '@/api/resource';
const chartDataFetch = new Resource('reports/graphical/sales-by-items');
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
          type: 'pie',
        },
        title: {
          text: 'Sales Report by Category',
        },
        subtitle: {
          text: 'Click the slices to view by product',
        },

        accessibility: {
          announceNewData: {
            enabled: true,
          },
          point: {
            valuePrefix: '₦',
          },
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: false,
            },
            showInLegend: true,
          },
        },
        // plotOptions: {
        //   series: {
        //     borderRadius: 5,
        //     dataLabels: [{
        //       enabled: true,
        //       distance: 15,
        //       format: '{point.name}',
        //     }, {
        //       enabled: true,
        //       distance: '-30%',
        //       filter: {
        //         property: 'percentage',
        //         operator: '>',
        //         value: 5,
        //       },
        //       format: '{point.y:.1f}%',
        //       style: {
        //         fontSize: '0.9em',
        //         textOutline: 'none',
        //       },
        //     }],
        //   },
        // },

        tooltip: {
          headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
          pointFormat: '<span style="color:{point.color}">{point.name}</span>: ' +
            '<b>₦{point.y:.2f}</b><br/>',
        },

        series: [],
        drilldown: {
          series: [],
        },
        credits: {
          enabled: false,
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
          app.products_in_stock.drilldown.series = response.drilldown.series;
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
