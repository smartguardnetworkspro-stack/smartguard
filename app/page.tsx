"use client";

import React from "react";

export default function Page(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">SmartGuard Operations</h1>
          <p className="mt-2 text-sm text-slate-600">
            Простая рабочая версия. Если эта страница задеплоится, потом вернем функции по шагам.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Inventory</div>
            <div className="mt-2 text-2xl font-semibold">4 items</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Projects</div>
            <div className="mt-2 text-2xl font-semibold">3 active</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Revenue</div>
            <div className="mt-2 text-2xl font-semibold">$3,396</div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">System status</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• Website is running</li>
            <li>• Next.js build passed</li>
            <li>• Ready for step-by-step feature restore</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
