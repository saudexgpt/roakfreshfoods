<?php

namespace App\Http\Controllers\Expenses;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpensesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $warehouse_id = $request->warehouse_id;
        $expenseQuery = Expense::query();
        if (isset($request->from, $request->to) && $request->from != '' && $request->from != '') {
            $date_from = date('Y-m-d', strtotime($request->from)) . ' 00:00:00';
            $date_to = date('Y-m-d', strtotime($request->to)) . ' 23:59:59';

            $expenseQuery->where('created_at', '>=', $date_from)
                ->where('created_at', '<=', $date_to);
        }
        $expenses = $expenseQuery->with('creator', 'approver')
            ->where('warehouse_id', $warehouse_id)
            ->paginate(10);

        return response()->json(compact('expenses'), 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return null
     */
    public function store(Request $request)
    {
        $user = $this->getUser();
        $expenses = json_decode(json_encode($request->expense_items));
        $warehouse_id = $request->warehouse_id;
        foreach ($expenses as $exp) {
            $expense = new Expense();
            $expense->warehouse_id = $warehouse_id;
            $expense->amount = $exp->amount;
            $expense->purpose = $exp->purpose;
            $expense->entered_by = $user->id;
            $expense->save();
        }

    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Expense  $expense
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Expense $expense)
    {
        $expense->amount = $request->amount;
        $expense->purpose = $request->purpose;
        $expense->save();
        return response()->json(compact('expense'), 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Expense  $expense
     * @return null
     */
    public function destroy(Expense $expense)
    {
        if ($expense->approved_by == NULL) {
            $expense->delete();
        }

    }
}
