"use client";

import React, { useMemo, useState } from "react";

type Client = {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
};

type Project = {
  id: number;
  name: string;
  clientId: number;
  status: "Scheduled" | "In Progress" | "Done";
  labor: number;
  notes: string;
};

type Supplier = {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  terms: string;
};

type Item = {
  id: number;
  name: string;
  category: string;
  sku: string;
  qty: number;
  unit: string;
  cost: number;
  supplier: string;
  minQty: number;
};

type Purchase = {
  id: number;
  date: string;
  item: string;
  qty: number;
  unitCost: number;
  supplier: string;
};

type Movement = {
  id: number;
  date: string;
  type: "OUT" | "IN";
  project: string;
  item: string;
  qty: number;
  note: string;
};

type Sale = {
  id: number;
  date: string;
  project: string;
  item: string;
  qty: number;
  cost: number;
  markup: number;
};

const initialClients: Client[] = [
  { id: 1, name: "Michael Brown", phone: "(818) 555-0101", email: "michael@example.com", address: "Sherman Oaks, CA" },
  { id: 2, name: "Apex Media", phone: "(323) 555-0178", email: "office@apexmedia.com", address: "Studio City, CA" },
  { id: 3, name: "David Rosen", phone: "(310) 555-0144", email: "david@example.com", address: "Beverly Hills, CA" },
];

const initialProjects: Project[] = [
  { id: 1, name: "Sherman Oaks House", clientId: 1, status: "In Progress", labor: 650, notes: "4 cameras + motion sensors" },
  { id: 2, name: "Studio City Office", clientId: 2, status: "Scheduled", labor: 950, notes: "Office CCTV wiring" },
  { id: 3, name: "Beverly Hills Villa", clientId: 3, status: "Done", labor: 1200, notes: "Alarm + outdoor cameras" },
];

const initialSuppliers: Supplier[] = [
  { id: 1, name: "ENS", phone: "(626) 555-0100", email: "sales@ens.example", address: "City of Industry, CA", terms: "Net 30" },
  { id: 2, name: "ADI", phone: "(800) 555-0199", email: "orders@adi.example", address: "Los Angeles, CA", terms: "COD" },
];

const initialItems: Item[] = [
  { id: 1, name: "Hikvision Camera 4MP", category: "CCTV", sku: "CAM-001", qty: 12, unit: "pcs", cost: 82, supplier: "ENS", minQty: 4 },
  { id: 2, name: "AJAX MotionProtect", category: "Alarm", sku: "ALM-001", qty: 9, unit: "pcs", cost: 64, supplier: "ENS", minQty: 3 },
  { id: 3, name: "Cat6 Cable Box", category: "Cable", sku: "CBL-001", qty: 7, unit: "boxes", cost: 118, supplier: "ENS", minQty: 2 },
  { id: 4, name: "12V Power Supply", category: "Power", sku: "PWR-001", qty: 15, unit: "pcs", cost: 18, supplier: "ADI", minQty: 5 },
];

const initialPurchases: Purchase[] = [
  { id: 1, date: "2026-03-26", item: "Hikvision Camera 4MP", qty: 6, unitCost: 82, supplier: "ENS" },
  { id: 2, date: "2026-03-27", item: "Cat6 Cable Box", qty: 3, unitCost: 118, supplier: "ENS" },
];

const initialMovements: Movement[] = [
  { id: 1, date: "2026-03-28", type: "OUT", project: "Sherman Oaks House", item: "Hikvision Camera 4MP", qty: 4, note: "Installed front and backyard" },
  { id: 2, date: "2026-03-28", type: "OUT", project: "Studio City Office", item: "Cat6 Cable Box", qty: 1, note: "Network camera wiring" },
  { id: 3, date: "2026-03-29", type: "IN", project: "Stock Refill", item: "AJAX MotionProtect", qty: 5, note: "Supplier delivery" },
];

const initialSales: Sale[] = [
  { id: 1, date: "2026-03-28", project: "Sherman Oaks House", item: "Hikvision Camera 4MP", qty: 4, cost: 82, markup: 35 },
  { id: 2, date: "2026-03-28", project: "Studio City Office", item: "Cat6 Cable Box", qty: 1, cost: 118, markup: 30 },
];

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function SmartGuardInventoryMVP(): React.JSX.Element {
  const [clients] = useState<Client[]>(initialClients);
  const [projects] = useState<Project[]>(initialProjects);
  const [suppliers] = useState<Supplier[]>(initialSuppliers);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [sales, setSales] = useState<Sale[]>(initialSales);

  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("inventory");
  const [defaultMarkup, setDefaultMarkup] = useState<number>(20);

  const [newPurchase, setNewPurchase] = useState<{ date: string; item: string; qty: string; unitCost: string; supplier: string }>({
    date: "2026-03-29",
    item: "",
    qty: "",
    unitCost: "",
    supplier: "",
  });

  const [newMovement, setNewMovement] = useState<{ date: string; type: "OUT" | "IN"; project: string; item: string; qty: string; note: string }>({
    date: "2026-03-29",
    type: "OUT",
    project: "",
    item: "",
    qty: "",
    note: "",
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const haystack = `${item.name} ${item.sku} ${item.supplier} ${item.category}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesCategory = category === "all" || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  const categories = useMemo(() => ["all", ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const inventoryValue = useMemo(() => items.reduce((sum, item) => sum + item.qty * item.cost, 0), [items]);
  const lowStockCount = useMemo(() => items.filter((item) => item.qty <= item.minQty).length, [items]);
  const laborRevenue = useMemo(() => projects.reduce((sum, project) => sum + project.labor, 0), [projects]);
  const salesRevenue = useMemo(() => sales.reduce((sum, sale) => sum + sale.qty * sale.cost * (1 + sale.markup / 100), 0), [sales]);

  const handlePurchase = (): void => {
    if (!newPurchase.item || !newPurchase.qty) return;

    const qty = Number(newPurchase.qty || 0);
    const unitCost = Number(newPurchase.unitCost || 0);

    const purchase: Purchase = {
      id: Date.now(),
      date: newPurchase.date,
      item: newPurchase.item,
      qty,
      unitCost,
      supplier: newPurchase.supplier,
    };

    setPurchases((prev) => [purchase, ...prev]);
    setItems((prev) =>
      prev.map((item) =>
        item.name === newPurchase.item
          ? {
              ...item,
              qty: item.qty + qty,
              cost: unitCost || item.cost,
              supplier: newPurchase.supplier || item.supplier,
            }
          : item,
      ),
    );
    setMovements((prev) => [
      {
        id: Date.now() + 1,
        date: newPurchase.date,
        type: "IN",
        project: "Stock Refill",
        item: newPurchase.item,
        qty,
        note: `Purchase from ${newPurchase.supplier || "supplier"}`,
      },
      ...prev,
    ]);

    setNewPurchase({ date: "2026-03-29", item: "", qty: "", unitCost: "", supplier: "" });
  };

  const handleMovement = (): void => {
    if (!newMovement.item || !newMovement.qty) return;

    const qty = Number(newMovement.qty || 0);
    const movement: Movement = {
      id: Date.now(),
      date: newMovement.date,
      type: newMovement.type,
      project: newMovement.project,
      item: newMovement.item,
      qty,
      note: newMovement.note,
    };

    setMovements((prev) => [movement, ...prev]);
    setItems((prev) =>
      prev.map((item) => {
        if (item.name !== movement.item) return item;
        const nextQty = movement.type === "OUT" ? item.qty - qty : item.qty + qty;
        return { ...item, qty: Math.max(nextQty, 0) };
      }),
    );

    const matchedItem = items.find((item) => item.name === movement.item);
    if (matchedItem && movement.type === "OUT") {
      setSales((prev) => [
        {
          id: Date.now() + 2,
          date: movement.date,
          project: movement.project,
          item: movement.item,
          qty: movement.qty,
          cost: matchedItem.cost,
          markup: defaultMarkup,
        },
        ...prev,
      ]);
    }

    setNewMovement({ date: "2026-03-29", type: "OUT", project: "", item: "", qty: "", note: "" });
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">SmartGuard Operations</h1>
            <p className="text-sm text-slate-600">Простая стабильная версия MVP: склад, закупки, движение, клиенты, проекты и финансы.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["inventory", "Склад"],
              ["purchases", "Закупки"],
              ["movements", "Движение"],
              ["clients", "Клиенты"],
              ["projects", "Проекты"],
              ["finance", "Финансы"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value)}
                className={`rounded-full border px-4 py-2 text-sm ${activeTab === value ? "bg-black text-white" : "bg-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Позиций на складе</div><div className="mt-2 text-2xl font-semibold">{items.length}</div></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Стоимость склада</div><div className="mt-2 text-2xl font-semibold">{currency(inventoryValue)}</div></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Мало на складе</div><div className="mt-2 text-2xl font-semibold">{lowStockCount}</div></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Labor revenue</div><div className="mt-2 text-2xl font-semibold">{currency(laborRevenue)}</div></div>
        </section>

        {activeTab === "inventory" && (
          <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <input
                value={search}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
                placeholder="Поиск по названию, SKU, поставщику"
                className="w-full rounded-xl border px-3 py-2 md:max-w-sm"
              />
              <select
                value={category}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setCategory(event.target.value)}
                className="rounded-xl border px-3 py-2"
              >
                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value === "all" ? "Все" : value}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Товар</th>
                    <th className="py-2 pr-4">Категория</th>
                    <th className="py-2 pr-4">SKU</th>
                    <th className="py-2 pr-4">Остаток</th>
                    <th className="py-2 pr-4">Себестоимость</th>
                    <th className="py-2 pr-4">Поставщик</th>
                    <th className="py-2 pr-4">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 font-medium">{item.name}</td>
                      <td className="py-2 pr-4">{item.category}</td>
                      <td className="py-2 pr-4">{item.sku}</td>
                      <td className="py-2 pr-4">{item.qty} {item.unit}</td>
                      <td className="py-2 pr-4">{currency(item.cost)}</td>
                      <td className="py-2 pr-4">{item.supplier}</td>
                      <td className="py-2 pr-4">{item.qty <= item.minQty ? "Low stock" : "In stock"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "purchases" && (
          <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Новая закупка</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <input type="date" value={newPurchase.date} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewPurchase({ ...newPurchase, date: event.target.value })} className="rounded-xl border px-3 py-2" />
                <input value={newPurchase.supplier} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewPurchase({ ...newPurchase, supplier: event.target.value })} placeholder="Поставщик" className="rounded-xl border px-3 py-2" />
                <select value={newPurchase.item} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setNewPurchase({ ...newPurchase, item: event.target.value })} className="rounded-xl border px-3 py-2">
                  <option value="">Выбери товар</option>
                  {items.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
                <input type="number" value={newPurchase.qty} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewPurchase({ ...newPurchase, qty: event.target.value })} placeholder="Количество" className="rounded-xl border px-3 py-2" />
                <input type="number" value={newPurchase.unitCost} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewPurchase({ ...newPurchase, unitCost: event.target.value })} placeholder="Цена за ед." className="rounded-xl border px-3 py-2" />
              </div>
              <button type="button" onClick={handlePurchase} className="mt-4 rounded-xl bg-black px-4 py-2 text-white">Провести закупку</button>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">История закупок</h2>
              <div className="space-y-3 text-sm">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="rounded-xl border p-3">
                    <div className="font-medium">{purchase.item}</div>
                    <div>{purchase.date}</div>
                    <div>{purchase.qty} pcs × {currency(purchase.unitCost)}</div>
                    <div>{purchase.supplier}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "movements" && (
          <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Движение товара</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <input type="date" value={newMovement.date} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewMovement({ ...newMovement, date: event.target.value })} className="rounded-xl border px-3 py-2" />
                <select value={newMovement.type} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setNewMovement({ ...newMovement, type: event.target.value as "OUT" | "IN" })} className="rounded-xl border px-3 py-2">
                  <option value="OUT">OUT</option>
                  <option value="IN">IN</option>
                </select>
                <input value={newMovement.project} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewMovement({ ...newMovement, project: event.target.value })} placeholder="Проект / объект" className="rounded-xl border px-3 py-2" />
                <select value={newMovement.item} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setNewMovement({ ...newMovement, item: event.target.value })} className="rounded-xl border px-3 py-2">
                  <option value="">Выбери товар</option>
                  {items.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
                <input type="number" value={newMovement.qty} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewMovement({ ...newMovement, qty: event.target.value })} placeholder="Количество" className="rounded-xl border px-3 py-2" />
                <input value={newMovement.note} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewMovement({ ...newMovement, note: event.target.value })} placeholder="Комментарий" className="rounded-xl border px-3 py-2" />
              </div>
              <button type="button" onClick={handleMovement} className="mt-4 rounded-xl bg-black px-4 py-2 text-white">Провести движение</button>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Последние движения</h2>
              <div className="space-y-3 text-sm">
                {movements.map((movement) => (
                  <div key={movement.id} className="rounded-xl border p-3">
                    <div className="font-medium">{movement.item}</div>
                    <div>{movement.date} · {movement.type}</div>
                    <div>{movement.project}</div>
                    <div>Qty: {movement.qty}</div>
                    <div>{movement.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "clients" && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Клиенты</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {clients.map((client) => (
                <div key={client.id} className="rounded-xl border p-4">
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-slate-600">{client.phone}</div>
                  <div className="text-sm text-slate-600">{client.email}</div>
                  <div className="text-sm text-slate-600">{client.address}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "projects" && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Проекты</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const client = clients.find((item) => item.id === project.clientId);
                return (
                  <div key={project.id} className="rounded-xl border p-4">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-slate-600">{client?.name || "Client"}</div>
                    <div className="text-sm text-slate-600">{project.status}</div>
                    <div className="text-sm text-slate-600">Labor: {currency(project.labor)}</div>
                    <div className="mt-2 text-sm">{project.notes}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "finance" && (
          <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Поставщики</h2>
              <div className="space-y-3 text-sm">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="rounded-xl border p-3">
                    <div className="font-medium">{supplier.name}</div>
                    <div>{supplier.phone}</div>
                    <div>{supplier.email}</div>
                    <div>{supplier.address}</div>
                    <div>Terms: {supplier.terms}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Финансы</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Inventory value</span><b>{currency(inventoryValue)}</b></div>
                <div className="flex justify-between"><span>Materials revenue</span><b>{currency(salesRevenue)}</b></div>
                <div className="flex justify-between"><span>Labor revenue</span><b>{currency(laborRevenue)}</b></div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">Default markup %</label>
                <input type="number" value={defaultMarkup} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDefaultMarkup(Number(event.target.value || 0))} className="rounded-xl border px-3 py-2" />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Продажи</h2>
              <div className="space-y-3 text-sm">
                {sales.map((sale) => {
                  const revenue = sale.qty * sale.cost * (1 + sale.markup / 100);
                  return (
                    <div key={sale.id} className="rounded-xl border p-3">
                      <div className="font-medium">{sale.item}</div>
                      <div>{sale.project}</div>
                      <div>{sale.qty} pcs</div>
                      <div>Revenue: {currency(revenue)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
