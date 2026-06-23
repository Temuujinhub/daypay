"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mapProduct, Product, userApi, UserApiError } from "@/lib/consumer";
import { ErrorNote, PageTitle, Spinner } from "../ui";

export default function ServicesPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userApi
      .products()
      .then((rows) => setProducts(rows.map(mapProduct)))
      .catch((e) => setError(e instanceof UserApiError ? e.message : "Failed to load products"));
  }, []);

  return (
    <div>
      <PageTitle>Loan Products</PageTitle>
      {error && <ErrorNote>{error}</ErrorNote>}
      {!products ? (
        <Spinner />
      ) : (
        <div className="space-y-5">
          {products.map((p) => (
            <div key={p.code} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex h-28 items-start justify-end bg-gradient-to-br from-brand-light to-brand-dark p-4">
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-brand-dark">
                  From {p.minApr.toFixed(2)}%
                </span>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-extrabold text-slate-900">{p.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{p.tagline}</p>
                <ul className="my-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-emerald-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/app/products/${p.code}`}
                  className="block rounded-full bg-slate-900 py-3.5 text-center text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
