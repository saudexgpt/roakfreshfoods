import Layout from '@/layout';

const permissionRoutes = {
  path: '/outbound',
  component: Layout,
  redirect: 'noredirect',
  alwaysShow: true, // will always show the root menu
  meta: {
    title: 'Sales',
    icon: 'el-icon-s-promotion',
    permissions: ['view invoice', 'view waybill', 'manage waybill'],
    // roles: ['admin', 'stock officer'],
  },
  children: [
    {
      path: 'create-new',
      component: () => import('@/app/invoice/partials/CreateInvoice'),
      name: 'CreateInvoice',
      meta: {
        title: 'New Sales Record',
        permissions: ['create invoice'],
      },
      // hidden: false,
    },

    {
      path: 'invoices',
      component: () => import('@/app/invoice/Invoice'),
      name: 'Invoices',
      meta: {
        title: 'Income',
        permissions: ['create invoice', 'view invoice'],
      },
    },
    // {
    //   path: 'invoice-reversals',
    //   component: () => import('@/app/invoice/InvoiceReversals'),
    //   name: 'InvoiceReversals',
    //   meta: {
    //     title: 'Invoices Reversals',
    //     permissions: ['manage invoice reversals'],
    //   },
    // },
    // {
    //   path: 'archive-invoices',
    //   component: () => import('@/app/invoice/ArchiveInvoices'),
    //   name: 'ArchiveInvoices',
    //   meta: {
    //     title: 'Archive Invoices',
    //     permissions: ['archive invoices'],
    //   },
    // },
    // {
    //   path: 'details/:id',
    //   component: () => import('@/app/invoice/Details'),
    //   name: 'InvoiceDetails',
    //   meta: { title: 'Invoice Details', noCache: true, permissions: ['view invoice'] },
    //   hidden: true,
    // },
    // {
    //   path: 'waybill',
    //   component: () => import('@/app/invoice/Waybill'),
    //   name: 'Waybills',
    //   meta: {
    //     title: 'Waybills',
    //     permissions: ['view waybill', 'manage waybill'],
    //   },
    // },
    // {
    //   path: 'waybill-delivery-cost',
    //   component: () => import('@/app/invoice/WaybillDeliveryCost'),
    //   name: 'WaybillDeliveryCost',
    //   meta: {
    //     title: 'Delivery Cost',
    //     permissions: ['manage waybill cost'],
    //   },
    // },
    // {
    //   path: 'extra-delivery-cost',
    //   component: () => import('@/app/invoice/ExtraDeliveryCost'),
    //   name: 'ExtraDeliveryCost',
    //   meta: {
    //     title: 'Extra Delivery Cost',
    //     permissions: ['manage waybill cost'],
    //   },
    // },
    {
      path: 'generate-waybill',
      component: () => import('@/app/invoice/partials/GenerateWaybill'),
      name: 'GenerateWaybill',
      meta: {
        title: 'Generate Waybill',
        permissions: ['generate waybill', 'manage waybill'],
      },
      hidden: true,
    },
  ],
};

export default permissionRoutes;
