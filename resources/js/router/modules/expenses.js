import Layout from '@/layout';

const permissionRoutes = {
  path: '/expenses',
  component: Layout,
  redirect: 'noredirect',
  meta: { // permissions: ['view-menu-warehouse'],
    permissions: ['view expense', 'create expense', 'update expense', 'delete expense'],
  },
  children: [

    {
      path: '/expenses',
      component: () => import('@/app/expenses/index'),
      name: 'Expenses',
      meta: {
        title: 'Expenses',
        icon: 'el-icon-money',
        // permissions: ['view-menu-warehouse'],
        permissions: ['view expense', 'create expense', 'update expense', 'delete expense'],
      },
    },
    {
      path: '/create-expenditure',
      component: () => import('@/app/expenses/partials/Create'),
      name: 'CreateExpense',
      meta: {
        title: 'New Expenditure',
        permissions: ['create expense'],
      },
      hidden: true,
    },

  ],
};

export default permissionRoutes;
