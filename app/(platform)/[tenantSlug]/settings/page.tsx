'use client'

import { useState, use } from 'react'
import { IconSettings, IconUser, IconBell, IconLock, IconBuilding } from '@/components/ui/Icons'

export default function SettingsPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState('restaurant')

  const tabs = [
    { id: 'restaurant', label: 'Restaurant', icon: IconBuilding },
    { id: 'profile', label: 'Perfil', icon: IconUser },
    { id: 'notifications', label: 'Notificações', icon: IconBell },
    { id: 'security', label: 'Segurança', icon: IconLock },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do seu restaurante</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 space-y-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 border rounded-lg p-6">
          {activeTab === 'restaurant' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Informações do Restaurant</h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Restaurant</label>
                  <input
                    type="text"
                    defaultValue="Meu Restaurant"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    defaultValue={resolvedParams.tenantSlug}
                    className="w-full px-3 py-2 border rounded-lg bg-muted"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Endereço</label>
                  <input
                    type="text"
                    placeholder="Rua, número, bairro"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Horário de funcionamento</label>
                  <div className="flex gap-4">
                    <input type="time" className="px-3 py-2 border rounded-lg" defaultValue="08:00" />
                    <span className="self-center">até</span>
                    <input type="time" className="px-3 py-2 border rounded-lg" defaultValue="22:00" />
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                Salvar alterações
              </button>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Perfil do Usuário</h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                Salvar alterações
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Notificações</h2>
              <div className="space-y-4">
                {[
                  { label: 'Novos pedidos', desc: 'Receber notification quando chegar novo pedido' },
                  { label: 'Estoque baixo', desc: 'Alertar quando produto estiver com estoque baixo' },
                  { label: 'Pedidos prontos', desc: 'Notificar quando pedido for marcado como pronto' },
                  { label: 'Resumo diário', desc: 'Receber resumo de vendas diário por email' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Segurança</h2>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">Alterar senha</p>
                  <p className="text-sm text-muted-foreground mb-3">Última alteração: há 30 dias</p>
                  <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted">
                    Alterar senha
                  </button>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">Autenticação em duas etapas</p>
                  <p className="text-sm text-muted-foreground mb-3">Adicione uma camada extra de segurança</p>
                  <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted">
                    Ativar 2FA
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}