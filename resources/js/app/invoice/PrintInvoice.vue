<template>
  <div v-if="invoice" class="print-padded">
    <section class="invoice">
      <!-- title row -->
      <div class="row">
        <div class="col-xs-12 page-header">
          <img src="svg/logo.png" alt="Company Logo" width="50">
          <span>
            <label>{{ companyName }}</label>
            <div class="pull-right no-print">
              <a @click="doPrint()">
                <i class="el-icon-printer" /> Print Receipt
              </a>
            </div>
          </span>
        </div>
        <!-- /.col -->
      </div>
      <!-- info row -->
      <div class="row invoice-info">
        <div v-if="invoice.customer" class="col-sm-4 invoice-col">
          <label>Customer Details</label>
          <address>
            <label>{{ invoice.customer.user.name.toUpperCase() }}</label>
            <br>
            <!-- {{
                    (invoice.customer.type)
                      ? invoice.customer.type.toUpperCase()
                      : ''
                  }}
                  <br> -->
            Phone: {{ invoice.customer.user.phone }}
            <!-- <br>
                  Email: {{ invoice.customer.user.email }}-->
            <br>
            {{ invoice.customer.user.address }}
          </address>
        </div>
        <!-- /.col -->
        <div class="col-sm-4 invoice-col">
          <label>Originating Store</label>
          <address>
            <strong>{{ invoice.warehouse.name.toUpperCase() }}</strong>
          </address>
        </div>
        <!-- /.col -->
        <div class="col-sm-4 invoice-col">
          <label>Receipt No.: {{ invoice.invoice_number }}</label>
          <br>
          <label>Date:</label>
          {{
            moment(invoice.created_at).format('MMMM Do YYYY')
          }}
          <br>
        </div>
        <!-- /.col -->
      </div>
      <!-- /.row -->

      <!-- Table row -->
      <div class="row">
        <div class="col-xs-12">
          <legend>Items</legend>
          <table>
            <thead>
              <tr>
                <th>S/N</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(invoice_item, index) in invoice.invoice_items"
                :key="index"
              >
                <th>
                  <div :id="invoice_item.id">
                    <div>{{ index + 1 }}</div>
                  </div>
                </th>
                <th>
                  {{ invoice_item.item ? invoice_item.item.name : '' }}
                </th>
                <!-- <th>{{ invoice_item.item.description }}</th> -->
                <th>
                  {{ invoice_item.quantity }} {{ invoice_item.type }}
                  <br><code v-html="showItemsInCartons(invoice_item.quantity, invoice_item.quantity_per_carton, invoice_item.type)" />
                </th>
                <th align="right">
                  {{
                    currency + Number(invoice_item.rate).toLocaleString()
                  }}
                </th>
              </tr>
              <tr>
                <th colspan="3" align="right">
                  <label>Subtotal</label>
                </th>
                <th align="right">
                  {{ currency + Number(invoice.subtotal).toLocaleString() }}
                </th>
              </tr>
              <tr>
                <th colspan="3" align="right">
                  <label>Discount</label>
                </th>
                <th align="right">
                  {{ currency + Number(invoice.discount).toLocaleString() }}
                </th>
              </tr>
              <tr>
                <th colspan="3" align="right">
                  <label>Grand Total</label>
                </th>
                <th align="right">
                  <label style="color: black">{{
                    currency + Number(invoice.amount).toLocaleString()
                  }}</label>
                </th>
              </tr>
              <tr>
                <th colspan="5" align="right"><label>In Words: {{ inWords(invoice.amount).toUpperCase() }}</label></th>
              </tr>
            </tbody>
          </table>
          <table>
            <tr>
              <th>Goods bought in good condition cannot be returned</th>
            </tr>
          </table>
        </div>

        <!-- /.col -->
      </div>
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import { parseTime } from '@/utils';
import checkPermission from '@/utils/permission';
import checkRole from '@/utils/role';
import showItemsInCartons from '@/utils/functions';
// import NewWaybill from './partials/NewWaybill';
import Resource from '@/api/resource';
const confirmReceiptDetailsResource = new Resource('audit/confirm/invoice');
export default {
  // components: { NewWaybill },
  props: {
    invoice: {
      type: Object,
      default: () => ({}),
    },
    page: {
      type: Object,
      default: () => ({
        option: 'invoice_details',
      }),
    },
    companyName: {
      type: String,
      default: () => 'Roak Fresh Foods',
    },
    companyContact: {
      type: String,
      default: () => '',
    },
    currency: {
      type: String,
      default: () => '₦',
    },
  },
  data() {
    return {
      activeActivity: 'first',
      updating: false,
      partialPage: {
        option: '',
      },
      downloadLoading: false,
      confirmed_items: [],
      activate_confirm_button: false,
      confirm_loader: false,
    };
  },
  mounted() {
    setTimeout(() => {
      this.doPrint();
    }, 500);
  },
  methods: {
    checkPermission,
    checkRole,
    showItemsInCartons,
    moment,
    doPrint() {
      window.print();
    },
    activateConfirmButton() {
      this.activate_confirm_button =
        this.invoice.invoice_items.length === this.confirmed_items.length;
    },
    confirmReceiptDetails() {
      const app = this;
      var param = { invoice_item_ids: app.confirmed_items };
      const message = 'Are you sure everything is intact? Click OK to confirm.';
      if (confirm(message)) {
        app.confirm_loader = true;
        confirmReceiptDetailsResource
          .update(app.invoice.id, param)
          .then(response => {
            if (response.confirmed === 'success') {
              app.activate_confirm_button = false;
              app.$message('Receipt Items Confirmed Successfully');
            }
            app.confirm_loader = false;
          });
      }
    },
    handleDownload() {
      this.downloadLoading = true;
      import('@/vendor/Export2Excel').then(excel => {
        const multiHeader = [
          [
            'Receipt History for Receipt No.: ' + this.invoice.invoice_number,
            '',
            '',
          ],
        ];
        const tHeader = ['Title', 'Description', 'Date'];
        const filterVal = ['title', 'description', 'created_at'];
        const list = this.invoice.histories;
        const data = this.formatJson(filterVal, list);
        excel.export_json_to_excel({
          multiHeader,
          header: tHeader,
          data,
          filename: 'Receipt History ' + this.invoice.invoice_number,
          autoWidth: true,
          bookType: 'csv',
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          if (j === 'created_at') {
            return parseTime(v[j]);
          }
          return v[j];
        }),
      );
    },

    inWords(n, decimal = false) {
      const num2word = n.toString();
      const num2word_array = num2word.split('.');
      const whole_no = num2word_array[0];
      const dec_no = num2word_array[1];
      var string = whole_no, units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words, and = 'and';

      /* Remove spaces and commas */
      string = string.replace(/[, ]/g, '');

      /* Is number zero? */
      if (parseInt(string) === 0) {
        return 'zero';
      }

      /* Array of units as words */
      units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

      /* Array of tens as words */
      tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

      /* Array of scales as words */
      scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion'];

      /* Split user argument into 3 digit chunks from right to left */
      start = string.length;
      chunks = [];
      while (start > 0) {
        end = start;
        chunks.push(string.slice((start = Math.max(0, start - 3)), end));
      }

      /* Check if function has enough scale words to be able to stringify the user argument */
      chunksLen = chunks.length;
      if (chunksLen > scales.length) {
        return '';
      }

      /* Stringify each integer in each chunk */
      words = [];
      for (i = 0; i < chunksLen; i++) {
        chunk = parseInt(chunks[i]);

        if (chunk) {
          /* Split chunk into array of individual integers */
          ints = chunks[i].split('').reverse().map(parseFloat);

          /* If tens integer is 1, i.e. 10, then add 10 to units integer */
          if (ints[1] === 1) {
            ints[0] += 10;
          }

          /* Add scale word if chunk is not zero and array item exists */
          if ((word = scales[i])) {
            words.push(word);
          }

          /* Add unit word if array item exists */
          if ((word = units[ ints[0] ])) {
            words.push(word);
          }

          /* Add tens word if array item exists */
          if ((word = tens[ ints[1] ])) {
            words.push(word);
          }

          /* Add 'and' string after units or tens integer if: */
          if (ints[0] || ints[1]) {
            /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
            if (ints[2] || !i && chunksLen) {
              words.push(and);
            }
          }

          /* Add hundreds word if array item exists */
          if ((word = units[ ints[2] ])) {
            words.push(word + ' hundred');
          }
        }
      }
      let decimalWords = '';
      let currency_fraction = 'NAIRA';
      if (decimal) {
        currency_fraction = 'KOBO';
      }
      const wholeNumWords = words.reverse().join(' ') + ' ' + currency_fraction;
      if (dec_no !== undefined && dec_no !== null && dec_no !== '') {
        decimalWords = this.inWords(parseInt(dec_no), true);
      }
      return wholeNumWords + decimalWords + ' ONLY';
    },
  },
};
</script>

  <style lang="scss" scoped>
  .invoice-activity {
    .invoice-block {
      .invoicename,
      .description {
        display: block;
        margin-left: 50px;
        padding: 2px 0;
      }
      img {
        width: 40px;
        height: 40px;
        float: left;
      }
      :after {
        clear: both;
      }
      .img-circle {
        padding: 2px;
      }
      span {
        font-weight: 500;
        font-size: 12px;
      }
    }
    .post {
      font-size: 14px;
      margin-bottom: 15px;
      padding-bottom: 15px;
      color: #666;
      .image {
        width: 100%;
      }
      .invoice-images {
        padding-top: 20px;
      }
    }
    .list-inline {
      padding-left: 0;
      margin-left: -5px;
      list-style: none;
      li {
        display: inline-block;
        padding-right: 5px;
        padding-left: 5px;
        font-size: 13px;
      }
      .link-black {
        &:hover,
        &:focus {
          color: #999;
        }
      }
    }

  }
  .print-table {
    font-size: 8px !important;
    font-family: monospace;
  }
  .invoice {
    font-size: 10px !important;
    font-family: monospace;
  }
  </style>
  <style>

  @media print {
    .el-tabs__header {
      display: none !important;
    }

  }
  </style>
