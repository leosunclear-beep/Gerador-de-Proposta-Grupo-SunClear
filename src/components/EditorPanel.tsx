import React from 'react';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Building2,
  User,
  Zap,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  Upload
} from 'lucide-react';
import { ProposalData, ProposalItem } from '../types';
import { formatMoney, calculateItemTotal, calculateGrandTotal } from '../utils/formatters';

interface EditorPanelProps {
  data: ProposalData;
  onChange: (updater: (prev: ProposalData) => ProposalData) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearLogo: () => void;
}

const PRESET_SOLAR_ITEMS: Array<Omit<ProposalItem, 'id'>> = [
  {
    name: 'Módulo Fotovoltaico 550W Monocristalino',
    description: 'Painel solar Half-Cell de alta eficiência, proteção IP68 e certificação INMETRO.',
    qty: 12,
    price: 650.00
  },
  {
    name: 'Inversor Solar On-Grid 6kW Monofásico',
    description: 'Inversor com Wi-Fi embutido, display informativo e garantia do fabricante de 10 anos.',
    qty: 1,
    price: 4900.00
  },
  {
    name: 'Microinversor Solar 2000W Quadruplo',
    description: 'Microinversor com 4 MPPTs individuais, monitoramento módulo a módulo.',
    qty: 2,
    price: 2400.00
  },
  {
    name: 'Estrutura de Fixação para Telhado Cerâmico',
    description: 'Perfis e ganchos em alumínio anodizado 6063 com fixações em aço inoxidável.',
    qty: 1,
    price: 1100.00
  },
  {
    name: 'Quadro de Proteção CC/CA (String Box)',
    description: 'Com DPS classe II 1000Vcc, chave seccionadora rotativa e disjuntor CA curva C.',
    qty: 1,
    price: 950.00
  },
  {
    name: 'Kit Cabos Solares 6mm² e Conectores MC4',
    description: '50m de cabo solar vermelho + 50m preto com proteção UV e 8 pares de conectores MC4.',
    qty: 1,
    price: 620.00
  },
  {
    name: 'Serviço de Homologação, Engenharia e ART',
    description: 'Projeto elétrico aprovado na distribuidora, parecer de acesso e recolhimento de ART no CREA.',
    qty: 1,
    price: 2000.00
  },
  {
    name: 'Serviço de Instalação e Comissionamento',
    description: 'Mão de obra especializada com certificação NR10 e NR35 para montagem e testes.',
    qty: 1,
    price: 3200.00
  }
];

export const EditorPanel: React.FC<EditorPanelProps> = ({
  data,
  onChange,
  onLogoUpload,
  onClearLogo
}) => {
  const handleFieldChange = (field: keyof ProposalData, value: string | number) => {
    onChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (
    id: string,
    field: keyof ProposalItem,
    value: string | number
  ) => {
    onChange(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddItem = (preset?: Omit<ProposalItem, 'id'>) => {
    const newItem: ProposalItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: preset ? preset.name : 'Novo Equipamento / Serviço',
      description: preset ? preset.description : '',
      qty: preset ? preset.qty : 1,
      price: preset ? preset.price : 0
    };

    onChange(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRemoveItem = (id: string) => {
    onChange(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const grandTotal = calculateGrandTotal(data.items);

  return (
    <aside className="editor-sidebar w-full lg:w-[410px] xl:w-[440px] bg-[#f8fafc] border-r border-[#e2e8f0] h-[calc(100vh-72px)] overflow-y-auto custom-scrollbar p-4 lg:p-5 flex flex-col gap-4">
      {/* Quick Summary Pill Banner */}
      <div className="bg-gradient-to-r from-[#102b43] to-[#164866] text-white p-3.5 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] tracking-wider text-[#7fd4f4] uppercase font-semibold block">
            Investimento Total
          </span>
          <span className="text-xl font-extrabold text-white">
            {formatMoney(grandTotal)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-300 block">Itens da Proposta</span>
          <span className="text-sm font-bold text-[#f28c28]">
            {data.items.length} {data.items.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>

      {/* Formato da Proposta (Completa x Enxuta) */}
      <section className="bg-white border-2 border-[#1476b8]/40 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#f28c28]" />
            <h2 className="text-sm font-bold text-[#102b43]">Formato da Proposta</h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1476b8]/10 text-[#1476b8]">
            {data.layoutMode === 'compact' ? '2 Páginas' : '4 Páginas'}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 mb-3 leading-snug">
          Alterne entre a proposta completa tradicional ou a proposta enxuta de 2 páginas.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleFieldChange('layoutMode', 'standard')}
            className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-1 ${
              data.layoutMode !== 'compact'
                ? 'border-[#1476b8] bg-[#dff3fb]/40 ring-2 ring-[#1476b8]/20 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#102b43]">Completa</span>
              <span className="text-[10px] font-bold text-[#1476b8]">4 págs</span>
            </div>
            <span className="text-[10px] text-slate-500 leading-tight">
              Capa, Apresentação detalhada, Equipamentos e Aceite.
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFieldChange('layoutMode', 'compact')}
            className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-1 ${
              data.layoutMode === 'compact'
                ? 'border-[#f28c28] bg-[#fff4eb] ring-2 ring-[#f28c28]/30 shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#102b43] flex items-center gap-1">
                Enxuta <span className="text-[10px] bg-[#f28c28] text-white px-1.5 py-0.2 rounded font-bold">Rápida</span>
              </span>
              <span className="text-[10px] font-bold text-[#f28c28]">2 págs</span>
            </div>
            <span className="text-[10px] text-slate-500 leading-tight">
              Capa + Orçamento, Cliente, Condições e Aceite em 1 só folha.
            </span>
          </button>
        </div>
      </section>

      {/* 1. Identidade Visual & Rodapé */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <ImageIcon className="w-4 h-4 text-[#1476b8]" />
          <h2 className="text-sm font-bold text-[#102b43]">Identidade Visual & Rodapé</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Logomarca Personalizada (Opcional)
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-[#cbd5e1] hover:border-[#1476b8] rounded-lg cursor-pointer bg-slate-50 hover:bg-[#dff3fb]/30 transition text-xs text-[#334155] font-medium">
                <Upload className="w-3.5 h-3.5 text-[#1476b8]" />
                <span>{data.logoUrl ? 'Alterar imagem...' : 'Selecionar arquivo PNG/JPG...'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onLogoUpload}
                  className="hidden"
                />
              </label>
              {data.logoUrl && (
                <button
                  onClick={onClearLogo}
                  title="Voltar ao logotipo padrão"
                  className="px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                >
                  Remover
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {data.logoUrl
                ? 'Logotipo personalizado aplicado à capa e cabeçalhos.'
                : 'Utilizando o logotipo oficial padrão com emblema vetorial.'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Texto do Rodapé das Páginas Internas
            </label>
            <input
              type="text"
              value={data.customFooterText ?? ''}
              onChange={e => handleFieldChange('customFooterText', e.target.value)}
              placeholder="Ex: CIAVOLT ENERGIA SOLAR ou SUNCLEAR ENERGIA SOLAR"
              className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8] font-medium"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Personalize o nome da empresa ou departamento exibido no rodapé de todas as páginas.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Slogan / Rodapé da Capa
            </label>
            <input
              type="text"
              value={data.customCoverFooter ?? ''}
              onChange={e => handleFieldChange('customCoverFooter', e.target.value)}
              placeholder="Ex: CONFIANÇA QUE MOVE NEGÓCIOS • CIAVOLT ENERGIA SOLAR"
              className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8] font-medium"
            />
          </div>
        </div>
      </section>

      {/* 2. Proposta e Emissão */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <FileText className="w-4 h-4 text-[#1476b8]" />
          <h2 className="text-sm font-bold text-[#102b43]">Dados da Proposta</h2>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Número da Proposta
              </label>
              <input
                type="text"
                value={data.proposalNumber}
                onChange={e => handleFieldChange('proposalNumber', e.target.value)}
                placeholder="Ex: CR-2026-001"
                className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8] focus:border-transparent font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Validade (dias)
              </label>
              <input
                type="number"
                min="1"
                value={data.validity}
                onChange={e => handleFieldChange('validity', Math.max(1, Number(e.target.value) || 1))}
                className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8] focus:border-transparent font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Data de Emissão
              </label>
              <input
                type="date"
                value={data.issueDate}
                onChange={e => handleFieldChange('issueDate', e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8] focus:border-transparent font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Responsável Comercial
              </label>
              <input
                type="text"
                value={data.seller}
                onChange={e => handleFieldChange('seller', e.target.value)}
                placeholder="Nome do consultor"
                className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8] focus:border-transparent font-medium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dados do Cliente */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <User className="w-4 h-4 text-[#1476b8]" />
          <h2 className="text-sm font-bold text-[#102b43]">Dados do Cliente</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Nome / Razão Social
            </label>
            <input
              type="text"
              value={data.clientName}
              onChange={e => handleFieldChange('clientName', e.target.value)}
              placeholder="Nome do cliente ou empresa"
              className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8] focus:border-transparent font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                CPF / CNPJ
              </label>
              <input
                type="text"
                value={data.clientDocument}
                onChange={e => handleFieldChange('clientDocument', e.target.value)}
                placeholder="00.000.000/0000-00"
                className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={data.clientPhone}
                onChange={e => handleFieldChange('clientPhone', e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={data.clientEmail}
              onChange={e => handleFieldChange('clientEmail', e.target.value)}
              placeholder="cliente@empresa.com.br"
              className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Endereço da Instalação
            </label>
            <input
              type="text"
              value={data.clientAddress}
              onChange={e => handleFieldChange('clientAddress', e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF"
              className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8] focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* 4. Equipamentos e Serviços */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#f28c28]" />
            <h2 className="text-sm font-bold text-[#102b43]">Equipamentos & Serviços</h2>
          </div>
          <button
            onClick={() => handleAddItem()}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-[#1476b8] hover:bg-[#102b43] text-white rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Quick Add Presets Solar */}
        <div className="mb-3">
          <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wide">
            Adicionar Itens Rápidos de Energia Solar:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SOLAR_ITEMS.slice(0, 4).map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleAddItem(preset)}
                className="text-[10px] font-medium bg-[#f0f4f8] hover:bg-[#dff3fb] text-[#1476b8] px-2 py-1 rounded-md border border-[#cddae1] transition truncate max-w-[190px]"
                title={preset.name}
              >
                + {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {data.items.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400">Nenhum item na proposta.</p>
              <button
                onClick={() => handleAddItem()}
                className="mt-2 text-xs font-semibold text-[#1476b8] hover:underline"
              >
                + Adicionar o primeiro equipamento
              </button>
            </div>
          ) : (
            data.items.map((item, index) => {
              const itemSubtotal = calculateItemTotal(item.qty, item.price);
              return (
                <div
                  key={item.id}
                  className="border border-[#dce5ea] rounded-xl p-3 bg-[#fbfdfe] hover:border-[#1476b8]/50 transition shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="w-5 h-5 flex items-center justify-center bg-[#102b43] text-white rounded text-[10px] font-bold shrink-0">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                        placeholder="Nome do equipamento ou serviço"
                        className="w-full text-xs font-bold text-[#102b43] px-2 py-1 border border-[#cbd5e1] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#1476b8]"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remover item"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-2">
                    <textarea
                      value={item.description}
                      onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Especificações técnicas, marca, modelo, potência..."
                      rows={2}
                      className="w-full text-[11px] text-[#475569] p-2 border border-[#cbd5e1] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#1476b8] resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.qty}
                        onChange={e => handleItemChange(item.id, 'qty', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full text-xs font-semibold px-2 py-1 border border-[#cbd5e1] rounded-md text-right focus:outline-hidden"
                      />
                    </div>

                    <div className="col-span-4">
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">
                        Valor Unit. (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={e => handleItemChange(item.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full text-xs font-semibold px-2 py-1 border border-[#cbd5e1] rounded-md text-right focus:outline-hidden"
                      />
                    </div>

                    <div className="col-span-4 text-right">
                      <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">
                        Subtotal
                      </span>
                      <span className="text-xs font-extrabold text-[#1476b8]">
                        {formatMoney(itemSubtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 5. Condições Comerciais */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <Building2 className="w-4 h-4 text-[#1476b8]" />
          <h2 className="text-sm font-bold text-[#102b43]">Condições Comerciais</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Forma e Condições de Pagamento
            </label>
            <textarea
              value={data.paymentTerms}
              onChange={e => handleFieldChange('paymentTerms', e.target.value)}
              rows={2}
              className="w-full text-xs p-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Prazo de Entrega e Instalação
            </label>
            <input
              type="text"
              value={data.deliveryTime}
              onChange={e => handleFieldChange('deliveryTime', e.target.value)}
              className="w-full text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Garantias
            </label>
            <textarea
              value={data.warranty}
              onChange={e => handleFieldChange('warranty', e.target.value)}
              rows={2}
              className="w-full text-xs p-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1">
              Observações Adicionais
            </label>
            <textarea
              value={data.notes}
              onChange={e => handleFieldChange('notes', e.target.value)}
              rows={3}
              placeholder="Frete, escopo de homologação, responsabilidades do cliente..."
              className="w-full text-xs p-2 border border-[#cbd5e1] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1476b8]"
            />
          </div>
        </div>
      </section>
    </aside>
  );
};
