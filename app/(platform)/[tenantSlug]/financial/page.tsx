'use client'

import { useState, useEffect, use } from 'react'
import { IconFinancial, IconPlus } from '@/components/ui/Icons'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  category: string
}

export default function FinancialPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const resolvedParams = use(params)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    setTransactions([
      { id: '1', description: 'Venda #1234', amount: 89.90, type: 'income', date: '2026-05-14', category: 'Vendas' },
      { id: '2', description: 'Venda #1235', amount: 156.00, type: 'income', date: '2026-05-14', category: 'Vendas' },
      { id: '3', description: 'Compra ingredientes', amount: 320.00, type: 'expense', date: '2026-05-13', category: 'Fornecedores' },
      { id: '4', description: 'Venda #1236', amount: 45.50, type: 'income', date: '2026-05-13', category: 'Vendas' },
      { id: '5', description: 'Aluguel', amount: 1500.00, type: 'expense', date: '2026-05-01', category: 'Fixos' },
    ])
  }, [resolvedParams.tenantSlug])

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground"> Controle de receitas e despesas</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="day">Hoje</option>
            <option value="week">Semana</option>
            <option value="month">Mês</option>
            <option value="year">Ano</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <IconPlus className="w-4 h-4" />
            Nova Transação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Receitas</p>
          <p className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Despesas</p>
          <p className="text-2xl font-bold text-red-600">R$ {totalExpense.toFixed(2)}</p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Saldo</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Data</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Descrição</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Categoria</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t hover:bg-muted/50">
                <td className="px-4 py-3 text-muted-foreground">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3 font-medium">{t.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.category}</td>
                <td className={`px-4 py-3 font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}