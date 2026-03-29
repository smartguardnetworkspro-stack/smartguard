"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, ShoppingCart, ArrowRightLeft, DollarSign, AlertTriangle, Search, FileText, Receipt, Users, Truck } from "lucide-react";
import { motion } from "framer-motion";

type Client = { id: number; name: string; phone: string; email: string; address: string };
type Project = { id: number; name: string; clientId: number; status: string; labor: number; notes: string };
type Supplier = { id: number; name: string; phone: string; email: string; address: string; terms: string };
type Item = { id: number; name: string; category: string; sku: string; qty: number; unit: string; cost: number; supplier: string; minQty: number };
type Purchase = { id: number; date: string; item: string; qty: number; unitCost: number; supplier: string };
type Movement = { id?: number; date: string; type: "OUT" | "IN"; project: string; item: string; qty: number; note: string };
type Sale = { id: number; date: string; project: string; item: string; qty: number; cost: number; markup: number };
type EstimateRow = { id: number; item: string; qty: number };
type Estimate = { id: number; date: string; project: string; clientName: string; rows: EstimateRow[]; labor: number; notes: string; materialTotal: number; total: number };
type Invoice = { id: number; number: string; date: string; estimateId: number; project: string; clientName: string; total: number; status: "Unpaid" | "Paid" };
type StatCardProps = { title: string; value: string | number; icon: React.ComponentType<{ className?: string }>; hint: string };

const initialClients = [
  { id: 1, name: "Michael Brown", phone: "(818) 555-0101", email: "michael@example.com", address: "Sherman Oaks, CA" },
  { id: 2, name: "Apex Media", phone: "(323) 555-0178", email: "office@apexmedia.com", address: "Studio City, CA" },
  { id: 3, name: "David Rosen", phone: "(310) 555-0144", email: "david@example.com", address: "Beverly Hills, CA" },
];

const initialProjects = [
  { id: 1, name: "Sherman Oaks House", clientId: 1, status: "In Progress", labor: 650, notes: "4 cameras + motion sensors" },
  { id: 2, name: "Studio City Office", clientId: 2, status: "Scheduled", labor: 950, notes: "Office CCTV wiring" },
  { id: 3, name: "Beverly Hills Villa", clientId: 3, status: "Done", labor: 1200, notes: "Alarm + outdoor cameras" },
];

const initialSuppliers = [
  { id: 1, name: "ENS", phone: "(626) 555-0100", email: "sales@ens.example", address: "City of Industry, CA", terms: "Net 30" },
  { id: 2, name: "ADI", phone: "(800) 555-0199", email: "orders@adi.example", address: "Los Angeles, CA", terms: "COD" },
];

const initialItems = [
  { id: 1, name: "Hikvision Camera 4MP", category: "CCTV", sku: "CAM-001", qty: 12, unit: "pcs", cost: 82, supplier: "ENS", minQty: 4 },
  { id: 2, name: "AJAX MotionProtect", category: "Alarm", sku: "ALM-001", qty: 9, unit: "pcs", cost: 64, supplier: "ENS", minQty: 3 },
  { id: 3, name: "Cat6 Cable Box", category: "Cable", sku: "CBL-001", qty: 7, unit: "boxes", cost: 118, supplier: "ENS", minQty: 2 },
  { id: 4, name: "12V Power Supply", category: "Power", sku: "PWR-001", qty: 15, unit: "pcs", cost: 18, supplier: "ADI", minQty: 5 },
];

const initialPurchases = [
  { id: 1, date: "2026-03-26", item: "Hikvision Camera 4MP", qty: 6, unitCost: 82, supplier: "ENS" },
  { id: 2, date: "2026-03-27", item: "Cat6 Cable Box", qty: 3, unitCost: 118, supplier: "ENS" },
];

const initialMovements: Movement[] = [
  { id: 1, date: "2026-03-28", type: "OUT", project: "Sherman Oaks House", item: "Hikvision Camera 4MP", qty: 4, note: "Installed front and backyard" },
  { id: 2, date: "2026-03-28", type: "OUT", project: "Studio City Office", item: "Cat6 Cable Box", qty: 1, note: "Network camera wiring" },
  { id: 3, date: "2026-03-29", type: "IN", project: "Stock Refill", item: "AJAX MotionProtect", qty: 5, note: "Supplier delivery" },
];

const initialSales = [
  { id: 1, date: "2026-03-28", project: "Sherman Oaks House", item: "Hikvision Camera 4MP", qty: 4, cost: 82, markup: 35 },
  { id: 2, date: "2026-03-28", project: "Studio City Office", item: "Cat6 Cable Box", qty: 1, cost: 118, markup: 30 },
];

function currency(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v || 0);
}

function pct5(v: number | string) {
  return Math.round(Number(v || 0) / 5) * 5;
}

function StatCard({ title, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
          <div className="rounded-2xl border p-3">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SmartGuardInventoryMVP() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [defaultMarkup, setDefaultMarkup] = useState(20);
  const [pricing, setPricing] = useState<Record<string, number>>({
    "Hikvision Camera 4MP": 35,
    "AJAX MotionProtect": 45,
    "Cat6 Cable Box": 30,
    "12V Power Supply": 40,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("inventory");

  const [newItem, setNewItem] = useState<{ name: string; category: string; sku: string; qty: string; unit: string; cost: string; supplier: string; minQty: string }>({ name: "", category: "CCTV", sku: "", qty: "", unit: "pcs", cost: "", supplier: "", minQty: "" });
  const [newPurchase, setNewPurchase] = useState<{ date: string; item: string; qty: string; unitCost: string; supplier: string }>({ date: "2026-03-29", item: "", qty: "", unitCost: "", supplier: "" });
  const [newMovement, setNewMovement] = useState<{ date: string; type: "OUT" | "IN"; project: string; item: string; qty: string; note: string }>({ date: "2026-03-29", type: "OUT", project: "", item: "", qty: "", note: "" });
  const [newClient, setNewClient] = useState<{ name: string; phone: string; email: string; address: string }>({ name: "", phone: "", email: "", address: "" });
  const [newProject, setNewProject] = useState<{ name: string; clientId: string; status: string; labor: string; notes: string }>({ name: "", clientId: "", status: "Scheduled", labor: "", notes: "" });
  const [newSupplier, setNewSupplier] = useState<{ name: string; phone: string; email: string; address: string; terms: string }>({ name: "", phone: "", email: "", address: "", terms: "" });
  const [estimateProject, setEstimateProject] = useState("");
  const [estimateRows, setEstimateRows] = useState<EstimateRow[]>([]);
  const [estimateLabor, setEstimateLabor] = useState(0);
  const [estimateNotes, setEstimateNotes] = useState("Materials and installation included. Taxes excluded unless stated.");
  const [selectedEstimateId, setSelectedEstimateId] = useState<number | null>(null);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = [item.name, item.sku, item.supplier, item.category].join(" ").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  const inventoryValue = useMemo(() => items.reduce((sum, item) => sum + item.qty * item.cost, 0), [items]);
  const lowStockCount = useMemo(() => items.filter((item) => item.qty <= item.minQty).length, [items]);
  const totalUnits = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const categories = ["all", ...new Set(items.map((i) => i.category))];

  const salesSummary = useMemo(() => {
    return sales.reduce(
      (acc, row) => {
        const revenue = row.qty * row.cost * (1 + row.markup / 100);
        const cost = row.qty * row.cost;
        acc.revenue += revenue;
        acc.cost += cost;
        acc.profit += revenue - cost;
        return acc;
      },
      { revenue: 0, cost: 0, profit: 0 }
    );
  }, [sales]);

  const laborRevenue = useMemo(() => projects.reduce((sum, p) => sum + Number(p.labor || 0), 0), [projects]);
  const invoiceSummary = useMemo(() => invoices.reduce((acc, inv) => {
    acc.total += inv.total;
    if (inv.status === "Paid") acc.paid += inv.total;
    if (inv.status !== "Paid") acc.unpaid += inv.total;
    return acc;
  }, { total: 0, paid: 0, unpaid: 0 }), [invoices]);

  const getClientById = (id: number | string): Client | undefined => clients.find((c) => c.id === Number(id));
  const getProjectByName = (name: string): Project | undefined => projects.find((p) => p.name === name);

  const addItem = () => {
    if (!newItem.name || !newItem.sku) return;
    setItems((prev) => [{
      id: Date.now(),
      name: newItem.name,
      category: newItem.category,
      sku: newItem.sku,
      qty: Number(newItem.qty || 0),
      unit: newItem.unit,
      cost: Number(newItem.cost || 0),
      supplier: newItem.supplier,
      minQty: Number(newItem.minQty || 0),
    }, ...prev]);
    setNewItem({ name: "", category: "CCTV", sku: "", qty: "", unit: "pcs", cost: "", supplier: "", minQty: "" });
  };

  const addClient = () => {
    if (!newClient.name) return;
    setClients((prev) => [{ id: Date.now(), ...newClient }, ...prev]);
    setNewClient({ name: "", phone: "", email: "", address: "" });
  };

  const addSupplier = () => {
    if (!newSupplier.name) return;
    setSuppliers((prev) => [{ id: Date.now(), ...newSupplier }, ...prev]);
    setNewSupplier({ name: "", phone: "", email: "", address: "", terms: "" });
  };

  const addProject = () => {
    if (!newProject.name || !newProject.clientId) return;
    setProjects((prev) => [{
      id: Date.now(),
      name: newProject.name,
      clientId: Number(newProject.clientId),
      status: newProject.status,
      labor: Number(newProject.labor || 0),
      notes: newProject.notes,
    }, ...prev]);
    setNewProject({ name: "", clientId: "", status: "Scheduled", labor: "", notes: "" });
  };

  const addPurchase = () => {
    if (!newPurchase.item || !newPurchase.qty) return;
    const qty = Number(newPurchase.qty || 0);
    const unitCost = Number(newPurchase.unitCost || 0);

    setPurchases((prev) => [{ id: Date.now(), ...newPurchase, qty, unitCost }, ...prev]);
    setItems((prev) => prev.map((item) => item.name === newPurchase.item ? { ...item, qty: item.qty + qty, cost: unitCost || item.cost, supplier: newPurchase.supplier || item.supplier } : item));
    setMovements((prev) => [{ id: Date.now() + 1, date: newPurchase.date, type: "IN", project: "Stock Refill", item: newPurchase.item, qty, note: `Purchase from ${newPurchase.supplier || "supplier"}` }, ...prev]);
    setNewPurchase({ date: "2026-03-29", item: "", qty: "", unitCost: "", supplier: "" });
  };

  const addSaleFromMovement = (movement: Movement) => {
    const matchedItem = items.find((i) => i.name === movement.item);
    if (!matchedItem || movement.type !== "OUT" || !movement.project) return;
    const markup = pricing[movement.item] ?? defaultMarkup;
    setSales((prev) => [{
      id: Date.now() + Math.random(),
      date: movement.date,
      project: movement.project,
      item: movement.item,
      qty: movement.qty,
      cost: matchedItem.cost,
      markup,
    }, ...prev]);
  };

  const addMovement = () => {
    if (!newMovement.item || !newMovement.qty) return;
    const qty = Number(newMovement.qty || 0);
    const movementSnapshot = { ...newMovement, qty };

    setMovements((prev) => [{ id: Date.now(), ...movementSnapshot }, ...prev]);
    setItems((prev) => prev.map((item) => {
      if (item.name !== newMovement.item) return item;
      const nextQty = newMovement.type === "OUT" ? item.qty - qty : item.qty + qty;
      return { ...item, qty: nextQty < 0 ? 0 : nextQty };
    }));
    addSaleFromMovement(movementSnapshot);
    setNewMovement({ date: "2026-03-29", type: "OUT", project: "", item: "", qty: "", note: "" });
  };

  const estimateMaterialTotals = useMemo(() => {
    return estimateRows.reduce((acc, row) => {
      const item = items.find((i) => i.name === row.item);
      if (!item) return acc;
      const markup = pricing[row.item] ?? defaultMarkup;
      const sell = item.cost * (1 + markup / 100);
      acc.cost += item.cost * row.qty;
      acc.revenue += sell * row.qty;
      return acc;
    }, { cost: 0, revenue: 0 });
  }, [estimateRows, items, pricing, defaultMarkup]);

  const estimateTotal = estimateMaterialTotals.revenue + Number(estimateLabor || 0);
  const estimateProfit = estimateTotal - estimateMaterialTotals.cost;

  const addEstimateRow = (): void => setEstimateRows((prev) => [{ id: Date.now(), item: "", qty: 1 }, ...prev]);
  const updateEstimateRow = (id: number, patch: Partial<EstimateRow>) => setEstimateRows((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
  const removeEstimateRow = (id: number) => setEstimateRows((prev) => prev.filter((r) => r.id !== id));

  const saveEstimate = (): void => {
    if (!estimateProject || estimateRows.length === 0) return;
    const project = getProjectByName(estimateProject);
    const record = {
      id: Date.now(),
      date: "2026-03-29",
      project: estimateProject,
      clientName: project ? getClientById(project.clientId)?.name || "Client" : "Client",
      rows: estimateRows,
      labor: Number(estimateLabor || 0),
      notes: estimateNotes,
      materialTotal: estimateMaterialTotals.revenue,
      total: estimateTotal,
    };
    setEstimates((prev) => [record, ...prev]);
    setSelectedEstimateId(record.id);
  };

  const createInvoiceFromEstimate = (): void => {
    const estimate = estimates.find((e) => e.id === selectedEstimateId);
    if (!estimate) return;
    setInvoices((prev) => [{
      id: Date.now(),
      number: `INV-${Date.now().toString().slice(-6)}`,
      date: "2026-03-29",
      estimateId: estimate.id,
      project: estimate.project,
      clientName: estimate.clientName,
      total: estimate.total,
      status: "Unpaid",
    }, ...prev]);
    setActiveTab("invoices");
  };

  const markInvoicePaid = (id: number) => {
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status: "Paid" } : inv));
  };

  const selectedEstimate = estimates.find((e) => e.id === selectedEstimateId) || null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6 print:max-w-none">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SmartGuard Operations</h1>
            <p className="text-sm text-muted-foreground">Склад, закупки, клиенты, проекты, estimate и invoice для CCTV и alarm бизнеса.</p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Dialog>
              <DialogTrigger asChild><Button className="rounded-2xl">Добавить товар</Button></DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Новый товар</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-2"><Label>Название</Label><Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Категория</Label><Input value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>SKU</Label><Input value={newItem.sku} onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2"><Label>Количество</Label><Input type="number" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Ед. изм.</Label><Input value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2"><Label>Себестоимость</Label><Input type="number" value={newItem.cost} onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Мин. остаток</Label><Input type="number" value={newItem.minQty} onChange={(e) => setNewItem({ ...newItem, minQty: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-2"><Label>Поставщик</Label><Input value={newItem.supplier} onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })} /></div>
                  <Button onClick={addItem} className="rounded-2xl">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="rounded-2xl">Клиент</Button></DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Новый клиент</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-2"><Label>Имя / компания</Label><Input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2"><Label>Телефон</Label><Input value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Email</Label><Input value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-2"><Label>Адрес</Label><Input value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} /></div>
                  <Button onClick={addClient} className="rounded-2xl">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="rounded-2xl">Проект</Button></DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Новый проект</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-2"><Label>Название проекта</Label><Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} /></div>
                  <div className="grid gap-2">
                    <Label>Клиент</Label>
                    <Select value={String(newProject.clientId)} onValueChange={(v: string) => setNewProject({ ...newProject, clientId: v })}>
                      <SelectTrigger><SelectValue placeholder="Выбери клиента" /></SelectTrigger>
                      <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Статус</Label>
                      <Select value={newProject.status} onValueChange={(v: string) => setNewProject({ ...newProject, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2"><Label>Labor</Label><Input type="number" value={newProject.labor} onChange={(e) => setNewProject({ ...newProject, labor: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-2"><Label>Заметки</Label><Textarea value={newProject.notes} onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })} /></div>
                  <Button onClick={addProject} className="rounded-2xl">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="rounded-2xl">Поставщик</Button></DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Новый поставщик</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-2"><Label>Название</Label><Input value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2"><Label>Телефон</Label><Input value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Email</Label><Input value={newSupplier.email} onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-2"><Label>Адрес</Label><Input value={newSupplier.address} onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Terms</Label><Input value={newSupplier.terms} onChange={(e) => setNewSupplier({ ...newSupplier, terms: e.target.value })} /></div>
                  <Button onClick={addSupplier} className="rounded-2xl">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="rounded-2xl">Закупка</Button></DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Новая закупка</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-2"><Label>Дата</Label><Input type="date" value={newPurchase.date} onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })} /></div>
                  <div className="grid gap-2">
                    <Label>Товар</Label>
                    <Select value={newPurchase.item} onValueChange={(v: string) => setNewPurchase({ ...newPurchase, item: v })}>
                      <SelectTrigger><SelectValue placeholder="Выбери товар" /></SelectTrigger>
                      <SelectContent>{items.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2"><Label>Кол-во</Label><Input type="number" value={newPurchase.qty} onChange={(e) => setNewPurchase({ ...newPurchase, qty: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Цена за ед.</Label><Input type="number" value={newPurchase.unitCost} onChange={(e) => setNewPurchase({ ...newPurchase, unitCost: e.target.value })} /></div>
                  </div>
                  <div className="grid gap-2"><Label>Поставщик</Label><Input value={newPurchase.supplier} onChange={(e) => setNewPurchase({ ...newPurchase, supplier: e.target.value })} /></div>
                  <Button onClick={addPurchase} className="rounded-2xl">Провести закупку</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild><Button variant="secondary" className="rounded-2xl">Движение</Button></DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Движение товара</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2"><Label>Дата</Label><Input type="date" value={newMovement.date} onChange={(e) => setNewMovement({ ...newMovement, date: e.target.value })} /></div>
                    <div className="grid gap-2">
                      <Label>Тип</Label>
                      <Select value={newMovement.type} onValueChange={(v: string) => setNewMovement({ ...newMovement, type: v as "OUT" | "IN" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OUT">OUT</SelectItem>
                          <SelectItem value="IN">IN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2"><Label>Проект / объект</Label><Input value={newMovement.project} onChange={(e) => setNewMovement({ ...newMovement, project: e.target.value })} placeholder="Например: Beverly Hills House" /></div>
                  <div className="grid gap-2">
                    <Label>Товар</Label>
                    <Select value={newMovement.item} onValueChange={(v: string) => setNewMovement({ ...newMovement, item: v })}>
                      <SelectTrigger><SelectValue placeholder="Выбери товар" /></SelectTrigger>
                      <SelectContent>{items.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2"><Label>Количество</Label><Input type="number" value={newMovement.qty} onChange={(e) => setNewMovement({ ...newMovement, qty: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Комментарий</Label><Input value={newMovement.note} onChange={(e) => setNewMovement({ ...newMovement, note: e.target.value })} /></div>
                  <Button onClick={addMovement} className="rounded-2xl">Провести движение</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Позиций на складе" value={items.length} icon={Package} hint="Уникальные SKU" />
          <StatCard title="Стоимость склада" value={currency(inventoryValue)} icon={DollarSign} hint="По себестоимости" />
          <StatCard title="Мало на складе" value={lowStockCount} icon={AlertTriangle} hint="Нужна дозакупка" />
          <StatCard title="Клиенты" value={clients.length} icon={Users} hint="Активная база" />
          <StatCard title="Проекты" value={projects.length} icon={FileText} hint="Jobs и объекты" />
          <StatCard title="Выручка материалы" value={currency(salesSummary.revenue)} icon={ShoppingCart} hint="Продажа со склада" />
          <StatCard title="Labor" value={currency(laborRevenue)} icon={Truck} hint="Работа по проектам" />
          <StatCard title="Unpaid invoices" value={currency(invoiceSummary.unpaid)} icon={Receipt} hint="Ожидает оплаты" />
        </div>

        <Card className="rounded-2xl shadow-sm print:hidden">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию, SKU, поставщику" className="pl-9 rounded-2xl" />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Button key={c} variant={category === c ? "default" : "outline"} className="rounded-2xl" onClick={() => setCategory(c)}>
                    {c === "all" ? "Все" : c}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 rounded-2xl print:hidden">
            <TabsTrigger value="inventory">Склад</TabsTrigger>
            <TabsTrigger value="purchases">Закупки</TabsTrigger>
            <TabsTrigger value="movements">Движение</TabsTrigger>
            <TabsTrigger value="clients">Клиенты</TabsTrigger>
            <TabsTrigger value="projects">Проекты</TabsTrigger>
            <TabsTrigger value="finance">Финансы</TabsTrigger>
            <TabsTrigger value="estimate">Estimate</TabsTrigger>
            <TabsTrigger value="invoices">Invoice</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle>Остатки на складе</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Товар</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Остаток</TableHead>
                      <TableHead>Себестоимость</TableHead>
                      <TableHead>Поставщик</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.qty} {item.unit}</TableCell>
                        <TableCell>{currency(item.cost)}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>{item.qty <= item.minQty ? <Badge variant="destructive">Low stock</Badge> : <Badge variant="secondary">In stock</Badge>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader><CardTitle>История закупок</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Товар</TableHead>
                        <TableHead>Кол-во</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Поставщик</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell className="font-medium">{row.item}</TableCell>
                          <TableCell>{row.qty}</TableCell>
                          <TableCell>{currency(row.unitCost)}</TableCell>
                          <TableCell>{currency(row.qty * row.unitCost)}</TableCell>
                          <TableCell>{row.supplier}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader><CardTitle>Поставщики</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {suppliers.map((s) => (
                    <div key={s.id} className="rounded-xl border p-3">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-muted-foreground">{s.phone}</div>
                      <div className="text-sm text-muted-foreground">{s.email}</div>
                      <div className="text-sm text-muted-foreground">{s.address}</div>
                      <div className="mt-1 text-xs">Terms: {s.terms}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="movements">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle>Движение со склада</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Проект / объект</TableHead>
                      <TableHead>Товар</TableHead>
                      <TableHead>Кол-во</TableHead>
                      <TableHead>Примечание</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell><Badge variant={row.type === "OUT" ? "destructive" : "secondary"}>{row.type}</Badge></TableCell>
                        <TableCell>{row.project}</TableCell>
                        <TableCell className="font-medium">{row.item}</TableCell>
                        <TableCell>{row.qty}</TableCell>
                        <TableCell>{row.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle>Клиенты</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя / компания</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Адрес</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.address}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle>Проекты / Jobs</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Проект</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Labor</TableHead>
                      <TableHead>Заметки</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{getClientById(row.clientId)?.name || "-"}</TableCell>
                        <TableCell><Badge variant="secondary">{row.status}</Badge></TableCell>
                        <TableCell>{currency(row.labor)}</TableCell>
                        <TableCell>{row.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Наценки по товарам</CardTitle>
                  <div className="mb-3 flex items-center gap-3">
                    <Label>Default %</Label>
                    <Input type="number" step={5} value={defaultMarkup} onChange={(e) => setDefaultMarkup(pct5(e.target.value))} className="w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1fr_100px_140px] items-center gap-3">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">Себестоимость: {currency(item.cost)}</div>
                        </div>
                        <Input type="number" step={5} value={pricing[item.name] ?? defaultMarkup} onChange={(e) => setPricing((prev) => ({ ...prev, [item.name]: pct5(e.target.value) }))} />
                        <div className="text-sm">Продажа: {currency(item.cost * (1 + (pricing[item.name] ?? defaultMarkup) / 100))}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader><CardTitle>Финансовая сводка</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>Материалы revenue</span><b>{currency(salesSummary.revenue)}</b></div>
                  <div className="flex justify-between"><span>Материалы profit</span><b>{currency(salesSummary.profit)}</b></div>
                  <div className="flex justify-between"><span>Labor revenue</span><b>{currency(laborRevenue)}</b></div>
                  <div className="flex justify-between"><span>Invoice total</span><b>{currency(invoiceSummary.total)}</b></div>
                  <div className="flex justify-between"><span>Paid</span><b>{currency(invoiceSummary.paid)}</b></div>
                  <div className="flex justify-between"><span>Unpaid</span><b>{currency(invoiceSummary.unpaid)}</b></div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4 rounded-2xl shadow-sm">
              <CardHeader><CardTitle>Продажи со склада</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Проект</TableHead>
                      <TableHead>Товар</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((row) => {
                      const revenue = row.qty * row.cost * (1 + row.markup / 100);
                      const profit = revenue - row.qty * row.cost;
                      return (
                        <TableRow key={row.id}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.project}</TableCell>
                          <TableCell className="font-medium">{row.item}</TableCell>
                          <TableCell>{row.qty}</TableCell>
                          <TableCell>{currency(revenue)}</TableCell>
                          <TableCell>{currency(profit)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estimate">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader><CardTitle>Estimate / Коммерческое предложение</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label>Проект</Label>
                      <Select value={estimateProject} onValueChange={(v: string) => {
                        setEstimateProject(v);
                        const p = getProjectByName(v);
                        setEstimateLabor(Number(p?.labor || 0));
                      }}>
                        <SelectTrigger><SelectValue placeholder="Выбери проект" /></SelectTrigger>
                        <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Labor</Label>
                      <Input type="number" value={estimateLabor} onChange={(e) => setEstimateLabor(Number(e.target.value || 0))} />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addEstimateRow} className="rounded-2xl w-full">Добавить позицию</Button>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Товар</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit price</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estimateRows.map((r) => {
                        const it = items.find((i) => i.name === r.item);
                        const markup = r.item ? (pricing[r.item] ?? defaultMarkup) : defaultMarkup;
                        const price = it ? it.cost * (1 + markup / 100) : 0;
                        return (
                          <TableRow key={r.id}>
                            <TableCell>
                              <Select value={r.item} onValueChange={(v: string) => updateEstimateRow(r.id, { item: v })}>
                                <SelectTrigger><SelectValue placeholder="Товар" /></SelectTrigger>
                                <SelectContent>{items.map((i) => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}</SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell><Input type="number" value={r.qty} onChange={(e) => updateEstimateRow(r.id, { qty: Number(e.target.value || 0) })} /></TableCell>
                            <TableCell>{currency(price)}</TableCell>
                            <TableCell>{currency(price * (r.qty || 0))}</TableCell>
                            <TableCell><Button variant="ghost" onClick={() => removeEstimateRow(r.id)}>Удалить</Button></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <div className="grid gap-2">
                    <Label>Notes</Label>
                    <Textarea value={estimateNotes} onChange={(e) => setEstimateNotes(e.target.value)} />
                  </div>

                  <div className="flex flex-wrap justify-end gap-6 text-sm">
                    <div>Материалы себестоимость: <b>{currency(estimateMaterialTotals.cost)}</b></div>
                    <div>Материалы продажа: <b>{currency(estimateMaterialTotals.revenue)}</b></div>
                    <div>Labor: <b>{currency(estimateLabor)}</b></div>
                    <div>Total: <b>{currency(estimateTotal)}</b></div>
                    <div>Profit: <b>{currency(estimateProfit)}</b></div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 print:hidden">
                    <Button variant="outline" className="rounded-2xl" onClick={saveEstimate}>Сохранить estimate</Button>
                    <Button className="rounded-2xl" onClick={() => window.print()}>Печать / PDF</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader><CardTitle>Сохраненные estimates</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {estimates.length === 0 && <div className="text-sm text-muted-foreground">Пока нет сохраненных estimate.</div>}
                  {estimates.map((e) => (
                    <button key={e.id} className={`w-full rounded-xl border p-3 text-left ${selectedEstimateId === e.id ? "border-black" : ""}`} onClick={() => setSelectedEstimateId(e.id)}>
                      <div className="font-medium">{e.project}</div>
                      <div className="text-sm text-muted-foreground">{e.clientName}</div>
                      <div className="mt-1 text-sm">{currency(e.total)}</div>
                    </button>
                  ))}
                  {selectedEstimate && (
                    <Button className="w-full rounded-2xl" onClick={createInvoiceFromEstimate}>Сделать invoice</Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Number</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.number}</TableCell>
                          <TableCell>{inv.date}</TableCell>
                          <TableCell>{inv.clientName}</TableCell>
                          <TableCell>{inv.project}</TableCell>
                          <TableCell>{currency(inv.total)}</TableCell>
                          <TableCell><Badge variant={inv.status === "Paid" ? "secondary" : "destructive"}>{inv.status}</Badge></TableCell>
                          <TableCell>{inv.status !== "Paid" && <Button size="sm" variant="outline" onClick={() => markInvoicePaid(inv.id)}>Paid</Button>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader><CardTitle>Invoice summary</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>Total invoices</span><b>{currency(invoiceSummary.total)}</b></div>
                  <div className="flex justify-between"><span>Paid</span><b>{currency(invoiceSummary.paid)}</b></div>
                  <div className="flex justify-between"><span>Unpaid</span><b>{currency(invoiceSummary.unpaid)}</b></div>
                  <div className="pt-2 print:hidden"><Button className="w-full rounded-2xl" onClick={() => window.print()}>Печать / PDF</Button></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
