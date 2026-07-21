import { listSales, salesSummary } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/format";
import { isAdminSubject } from "@/lib/session";
import { getCurrentSubject } from "@/lib/auth";

export default async function AnalyticsPage() {
  if (!isAdminSubject(await getCurrentSubject())) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Sales analytics</h1>
        <p className="text-sm text-zinc-500">This page is only available to the shop owner.</p>
      </div>
    );
  }

  const summary = salesSummary();
  const sales = listSales();
  const maxSale = Math.max(1, ...sales.map((s) => s.salePriceCents));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Sales analytics</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total revenue" value={formatPrice(summary.totalRevenueCents)} />
        <StatTile label="Items sold" value={String(summary.totalSales)} />
        <StatTile label="Average sale price" value={formatPrice(summary.avgSaleCents)} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Sales by price</h2>
        {sales.length === 0 ? (
          <p className="text-zinc-500">No sales recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-3 text-sm">
                <span className="w-40 shrink-0 truncate text-zinc-600 dark:text-zinc-400">{sale.assetName}</span>
                <div className="h-4 flex-1 rounded bg-zinc-100 dark:bg-zinc-900">
                  <div
                    className="h-4 rounded bg-zinc-900 dark:bg-zinc-100"
                    style={{ width: `${(sale.salePriceCents / maxSale) * 100}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right font-medium">{formatPrice(sale.salePriceCents)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Recent sales</h2>
        <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 text-left dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2 font-medium">Item</th>
                <th className="px-4 py-2 font-medium">Sale price</th>
                <th className="px-4 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-4 py-2">{sale.assetName}</td>
                  <td className="px-4 py-2">{formatPrice(sale.salePriceCents)}</td>
                  <td className="px-4 py-2 text-zinc-500">{formatDate(sale.soldAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
