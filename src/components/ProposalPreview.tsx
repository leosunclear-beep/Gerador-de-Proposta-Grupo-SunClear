import React, { useRef, useState, useEffect } from 'react';
import { ProposalData } from '../types';
import { formatMoney, formatDateBR, calculateItemTotal, calculateGrandTotal } from '../utils/formatters';
import { CiavoltLogo } from './CiavoltLogo';
import { ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';

interface ProposalPreviewProps {
  data: ProposalData;
  activeView: 'all' | 'page-1' | 'page-2' | 'page-3' | 'page-4';
  setActiveView: (view: 'all' | 'page-1' | 'page-2' | 'page-3' | 'page-4') => void;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  data,
  activeView,
  setActiveView,
  zoom,
  setZoom
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoFitScale, setAutoFitScale] = useState<number>(1);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);

  // Measure container width and compute responsive auto-fit scale for mobile/tablet screens
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const padding = width < 640 ? 16 : 48;
      const targetWidth = 794; // 210mm in pixels
      const scale = Math.min(1, Math.max(0.32, (width - padding) / targetWidth));
      setAutoFitScale(scale);

      // On mobile devices (< 768px), default to auto-fit scale
      if (width < 768 && isAutoFit) {
        setZoom(scale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isAutoFit, setZoom]);

  const handleFitToScreen = () => {
    setIsAutoFit(true);
    setZoom(autoFitScale);
  };

  const handleManualZoom = (delta: number) => {
    setIsAutoFit(false);
    setZoom((prev) => Math.min(1.5, Math.max(0.35, parseFloat((prev + delta).toFixed(2)))));
  };

  const isCompact = data.layoutMode === 'compact';
  const grandTotal = calculateGrandTotal(data.items);

  const showPage1 = activeView === 'all' || activeView === 'page-1';
  const showPage2 = activeView === 'all' || activeView === 'page-2';
  const showPage3 = !isCompact && (activeView === 'all' || activeView === 'page-3');
  const showPage4 = !isCompact && (activeView === 'all' || activeView === 'page-4');

  const currentScale = zoom;
  // Compute container height offset for scaled transform so scroll behaves normally
  const pageHeightPx = 1123;
  const pageCount = activeView === 'all' ? (isCompact ? 2 : 4) : 1;
  const scaledTotalHeight = pageCount * pageHeightPx * currentScale + 40;

  const footerText = data.customFooterText || 'CIAVOLT ENERGIA SOLAR';
  const coverFooterText = data.customCoverFooter || 'CONFIANÇA QUE MOVE NEGÓCIOS • CIAVOLT ENERGIA SOLAR';

  return (
    <div
      ref={containerRef}
      className="preview-wrapper flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-[#e2e8f0]/80 p-2 sm:p-4 lg:p-6 flex flex-col items-center relative"
    >
      {/* Mobile-Friendly Control Bar (Visible on all viewports, compact on mobile) */}
      <div className="no-print w-full max-w-4xl bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-2 shadow-xs mb-3 flex flex-wrap items-center justify-between gap-2 z-20 sticky top-0">
        {/* Page Switcher Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full text-xs font-semibold">
          <span className="text-slate-400 text-[11px] hidden sm:inline mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Página:
          </span>
          <button
            onClick={() => setActiveView('all')}
            className={`px-2.5 py-1 rounded-md transition text-xs whitespace-nowrap ${
              activeView === 'all'
                ? 'bg-[#102b43] text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isCompact ? 'Todas (2)' : 'Todas (4)'}
          </button>
          <button
            onClick={() => setActiveView('page-1')}
            className={`px-2.5 py-1 rounded-md transition text-xs whitespace-nowrap ${
              activeView === 'page-1'
                ? 'bg-[#102b43] text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Capa
          </button>
          {isCompact ? (
            <button
              onClick={() => setActiveView('page-2')}
              className={`px-2.5 py-1 rounded-md transition text-xs whitespace-nowrap ${
                activeView === 'page-2'
                  ? 'bg-[#102b43] text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              2. Orçamento & Condições
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveView('page-2')}
                className={`px-2.5 py-1 rounded-md transition text-xs whitespace-nowrap ${
                  activeView === 'page-2'
                    ? 'bg-[#102b43] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                2. Apresentação
              </button>
              <button
                onClick={() => setActiveView('page-3')}
                className={`px-2.5 py-1 rounded-md transition text-xs whitespace-nowrap ${
                  activeView === 'page-3'
                    ? 'bg-[#102b43] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                3. Itens
              </button>
              <button
                onClick={() => setActiveView('page-4')}
                className={`px-2.5 py-1 rounded-md transition text-xs whitespace-nowrap ${
                  activeView === 'page-4'
                    ? 'bg-[#102b43] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                4. Aceite
              </button>
            </>
          )}
        </div>

        {/* Zoom & Fit Controls */}
        <div className="flex items-center gap-1.5 ml-auto text-xs">
          <button
            onClick={() => handleManualZoom(-0.1)}
            title="Reduzir zoom"
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700 active:scale-95 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] text-slate-600 font-bold min-w-[36px] text-center">
            {Math.round(currentScale * 100)}%
          </span>
          <button
            onClick={() => handleManualZoom(0.1)}
            title="Aumentar zoom"
            className="p-1.5 rounded hover:bg-slate-100 text-slate-700 active:scale-95 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitToScreen}
            title="Ajustar à largura da tela do celular/computador"
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[#102b43] font-semibold text-[11px] rounded transition ml-1"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Ajustar</span>
          </button>
        </div>
      </div>

      {/* Outer Scaled Container for Safe Proportions */}
      <div
        className="w-full flex justify-center items-start"
        style={{
          minHeight: `${scaledTotalHeight}px`
        }}
      >
        <div
          className="proposal-container transition-transform duration-100 origin-top flex flex-col items-center"
          style={{
            transform: `scale(${currentScale})`,
            width: '794px', // 210mm A4 width
            transformOrigin: 'top center'
          }}
        >
          {/* ========================================================================= */}
          {/* PÁGINA 1: CAPA                                                            */}
          {/* ========================================================================= */}
          {showPage1 && (
            <article id="page-cover" className="proposal-sheet cover-sheet">
              <div className="cover-shape" />

              {/* Logo on Cover */}
              <div className="absolute top-[18mm] left-[16mm] z-10">
                <CiavoltLogo customLogoUrl={data.logoUrl} variant="cover" />
              </div>

              {/* Main Cover Content */}
              <div className="absolute left-[16mm] top-[75mm] z-10 max-w-[170mm]">
                <span className="text-[11px] font-bold tracking-[0.24em] text-[#9fe2fa] uppercase block mb-1">
                  SOLUÇÕES EM ENERGIA SOLAR & EQUIPAMENTOS
                </span>

                <h2 className="text-[44px] font-black leading-[1.0] text-white tracking-tight my-[5mm]">
                  PROPOSTA<br />
                  <span className="text-[#f28c28]">COMERCIAL</span>
                </h2>

                {/* Cover Metadata Box */}
                <div className="border-l-[4px] border-[#f28c28] pl-[6mm] mt-[6mm] space-y-[2mm]">
                  <p className="text-[13px] text-white m-0">
                    <b className="text-[#9fe2fa] font-semibold">Cliente: </b>
                    <span className="font-bold">{data.clientName || 'Nome do cliente'}</span>
                  </p>
                  <p className="text-[13px] text-white m-0">
                    <b className="text-[#9fe2fa] font-semibold">Proposta: </b>
                    <span>{data.proposalNumber || 'CR-2026-001'}</span>
                  </p>
                  <p className="text-[13px] text-white m-0">
                    <b className="text-[#9fe2fa] font-semibold">Data de Emissão: </b>
                    <span>{formatDateBR(data.issueDate)}</span>
                  </p>
                  <p className="text-[13px] text-white m-0">
                    <b className="text-[#9fe2fa] font-semibold">Validade: </b>
                    <span>{data.validity || 7} dias</span>
                  </p>
                  {data.seller && (
                    <p className="text-[13px] text-white m-0">
                      <b className="text-[#9fe2fa] font-semibold">Consultor: </b>
                      <span>{data.seller}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Ambient Background Energy Rays / Curved Lines */}
              <div className="cover-road-lines" />

              {/* Cover Bottom Footer */}
              <footer className="absolute bottom-0 left-0 right-0 h-[18mm] flex items-center px-[16mm] bg-[#081c2c] text-[#71cbe9] text-[10px] tracking-[0.24em] font-semibold uppercase z-10 border-t border-[#1476b8]/30">
                {coverFooterText}
              </footer>
            </article>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA 2 (MODO ENXUTO): ORÇAMENTO, DADOS DO CLIENTE, CONDIÇÕES E ACEITE   */}
          {/* ========================================================================= */}
          {isCompact && showPage2 && (
            <article id="page-compact" className="proposal-sheet">
              {/* Header */}
              <header className="page-header-banner">
                <CiavoltLogo customLogoUrl={data.logoUrl} variant="header" />
                <div className="text-right">
                  <span className="font-bold text-[#7fd4f4] block text-xs">PROPOSTA COMERCIAL ENXUTA</span>
                  <span className="text-[10px] text-slate-300 font-mono">
                    Nº {data.proposalNumber || 'CR-2026-001'} • {formatDateBR(data.issueDate)}
                  </span>
                </div>
              </header>

              {/* Body Content */}
              <div className="p-[8mm_12mm] relative z-1 flex-1 flex flex-col justify-between">
                {/* 1. Apresentação & Dados do Cliente */}
                <div>
                  <div className="flex items-center justify-between mb-[1.5mm] border-b border-[#39a9d6]/30 pb-[1mm]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-black text-[#f28c28] tracking-[0.16em] uppercase">01</span>
                      <h2 className="text-[12px] font-black text-[#102b43] tracking-wide uppercase m-0">
                        APRESENTAÇÃO & DADOS DO CLIENTE
                      </h2>
                    </div>
                    <span className="text-[9.5px] text-slate-500 font-semibold">
                      Validade: <b>{data.validity || 7} dias</b>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-[2mm] mb-[2.5mm]">
                    <div className="p-[1.5mm_2.5mm] border border-[#dce5ea] rounded-md bg-[#fbfdfe]">
                      <span className="text-[7.5px] uppercase tracking-wider text-[#6f7d86] font-bold block">
                        Cliente / Razão Social
                      </span>
                      <span className="text-[10px] font-bold text-[#102b43] block mt-[0.3mm] truncate">
                        {data.clientName || '—'}
                      </span>
                    </div>

                    <div className="p-[1.5mm_2.5mm] border border-[#dce5ea] rounded-md bg-[#fbfdfe]">
                      <span className="text-[7.5px] uppercase tracking-wider text-[#6f7d86] font-bold block">
                        CPF / CNPJ & Contato
                      </span>
                      <span className="text-[10px] font-bold text-[#102b43] block mt-[0.3mm] truncate">
                        {data.clientDocument || '—'} • {data.clientPhone || '—'}
                      </span>
                    </div>

                    <div className="p-[1.5mm_2.5mm] border border-[#dce5ea] rounded-md bg-[#fbfdfe]">
                      <span className="text-[7.5px] uppercase tracking-wider text-[#6f7d86] font-bold block">
                        Endereço da Instalação
                      </span>
                      <span className="text-[10px] font-bold text-[#102b43] block mt-[0.3mm] truncate">
                        {data.clientAddress || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Orçamento / Tabela de Equipamentos e Serviços */}
                <div>
                  <div className="flex items-center justify-between mb-[1mm]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-black text-[#f28c28] tracking-[0.16em] uppercase">02</span>
                      <h2 className="text-[12px] font-black text-[#102b43] tracking-wide uppercase m-0">
                        ORÇAMENTO DE EQUIPAMENTOS & SERVIÇOS
                      </h2>
                    </div>
                    <span className="text-[9.5px] text-slate-500 font-semibold">
                      {data.items.length} {data.items.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  <div className="border border-[#dce5ea] rounded-lg overflow-hidden mb-[2mm] shadow-xs">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-[#1476b8] text-white text-[8px] uppercase tracking-wider font-bold">
                          <th className="p-[1.8mm_2.5mm] w-[56%]">Item / Descrição Técnica</th>
                          <th className="p-[1.8mm_1.5mm] text-center w-[10%]">Qtd.</th>
                          <th className="p-[1.8mm_2mm] text-right w-[17%]">Unitário</th>
                          <th className="p-[1.8mm_2.5mm] text-right w-[17%]">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dce5ea] bg-white">
                        {data.items.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-2.5 text-center text-[9.5px] text-slate-400">
                              Nenhum item adicionado à proposta.
                            </td>
                          </tr>
                        ) : (
                          data.items.map((item, idx) => {
                            const itemSubtotal = calculateItemTotal(item.qty, item.price);
                            return (
                              <tr key={item.id || idx} className="hover:bg-slate-50/70">
                                <td className="p-[1.5mm_2.5mm] align-top">
                                  <b className="text-[9.5px] text-[#102b43] block leading-tight">
                                    {item.name || 'Equipamento'}
                                  </b>
                                  {item.description && (
                                    <small className="text-[8px] text-[#6f7d86] block mt-[0.2mm] leading-snug">
                                      {item.description}
                                    </small>
                                  )}
                                </td>
                                <td className="p-[1.5mm_1.5mm] text-center text-[9px] font-semibold text-[#273746] align-top">
                                  {item.qty || 0}
                                </td>
                                <td className="p-[1.5mm_2mm] text-right text-[9px] text-[#273746] align-top font-mono">
                                  {formatMoney(item.price)}
                                </td>
                                <td className="p-[1.5mm_2.5mm] text-right text-[9.5px] font-bold text-[#1476b8] align-top font-mono">
                                  {formatMoney(itemSubtotal)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Total Card */}
                  <div className="bg-[#102b43] text-white rounded-lg p-[2.5mm_4mm] flex items-center justify-between shadow-xs mb-[2.5mm]">
                    <div>
                      <span className="text-[8.5px] tracking-[0.16em] font-bold text-[#7fd4f4] uppercase block">
                        Investimento Total da Proposta
                      </span>
                      <span className="text-[8px] text-slate-300">
                        Equipamentos, materiais e mão de obra especializada inclusos
                      </span>
                    </div>
                    <strong className="text-[18px] font-black text-[#7fd4f4] tracking-tight font-mono">
                      {formatMoney(grandTotal)}
                    </strong>
                  </div>
                </div>

                {/* 3. Condições Comerciais */}
                <div>
                  <div className="flex items-center gap-1.5 mb-[1mm]">
                    <span className="text-[9.5px] font-black text-[#f28c28] tracking-[0.16em] uppercase">03</span>
                    <h2 className="text-[11.5px] font-black text-[#1476b8] tracking-wide uppercase m-0">
                      CONDIÇÕES COMERCIAIS
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-[2mm] mb-[2.5mm]">
                    <div className="border-l-[3px] border-[#f28c28] pl-[2mm] py-[0.5mm] bg-[#fbfdfe] rounded-r border-t border-r border-b border-slate-200/60 pr-1.5">
                      <b className="text-[8px] uppercase font-extrabold text-[#102b43] tracking-wide block">
                        Forma de Pagamento
                      </b>
                      <p className="text-[8.5px] text-[#273746] mt-[0.2mm] leading-tight whitespace-pre-wrap m-0">
                        {data.paymentTerms || '—'}
                      </p>
                    </div>

                    <div className="border-l-[3px] border-[#f28c28] pl-[2mm] py-[0.5mm] bg-[#fbfdfe] rounded-r border-t border-r border-b border-slate-200/60 pr-1.5">
                      <b className="text-[8px] uppercase font-extrabold text-[#102b43] tracking-wide block">
                        Prazo de Atendimento / Entrega
                      </b>
                      <p className="text-[8.5px] text-[#273746] mt-[0.2mm] leading-tight whitespace-pre-wrap m-0">
                        {data.deliveryTime || '—'}
                      </p>
                    </div>

                    <div className="border-l-[3px] border-[#f28c28] pl-[2mm] py-[0.5mm] bg-[#fbfdfe] rounded-r border-t border-r border-b border-slate-200/60 pr-1.5">
                      <b className="text-[8px] uppercase font-extrabold text-[#102b43] tracking-wide block">
                        Garantia
                      </b>
                      <p className="text-[8.5px] text-[#273746] mt-[0.2mm] leading-tight whitespace-pre-wrap m-0 line-clamp-2">
                        {data.warranty || '—'}
                      </p>
                    </div>

                    <div className="border-l-[3px] border-[#f28c28] pl-[2mm] py-[0.5mm] bg-[#fbfdfe] rounded-r border-t border-r border-b border-slate-200/60 pr-1.5">
                      <b className="text-[8px] uppercase font-extrabold text-[#102b43] tracking-wide block">
                        Observações
                      </b>
                      <p className="text-[8.5px] text-[#273746] mt-[0.2mm] leading-tight whitespace-pre-wrap m-0 line-clamp-2">
                        {data.notes || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Aceite & Assinaturas */}
                <div className="border-t border-[#dce5ea] pt-[2mm]">
                  <p className="text-[8.5px] text-[#475569] text-center mb-[2.5mm] leading-snug">
                    Declaro estar de pleno acordo com as especificações, prazos, valores e condições comerciais apresentados nesta proposta comercial.
                  </p>

                  <div className="grid grid-cols-2 gap-[10mm] text-center">
                    <div>
                      <div className="border-t-[1.5px] border-[#102b43] pt-[1mm] mb-[0.5mm]" />
                      <b className="block text-[9.5px] text-[#102b43] truncate">
                        {data.clientName || 'Cliente'}
                      </b>
                      <small className="text-[7.5px] uppercase tracking-wider text-[#6f7d86] font-semibold block">
                        Assinatura do Cliente / De Acordo
                      </small>
                    </div>

                    <div>
                      <div className="border-t-[1.5px] border-[#102b43] pt-[1mm] mb-[0.5mm]" />
                      <b className="block text-[9.5px] text-[#102b43] truncate">
                        {data.seller || footerText}
                      </b>
                      <small className="text-[7.5px] uppercase tracking-wider text-[#6f7d86] font-semibold block">
                        Responsável Comercial • {footerText}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="page-footer-banner">
                <span className="font-semibold">{footerText}</span>
                <span className="font-mono">{data.proposalNumber || 'CR-2026-001'}</span>
              </footer>
            </article>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA 2 (MODO COMPLETO): APRESENTAÇÃO                                    */}
          {/* ========================================================================= */}
          {!isCompact && showPage2 && (
            <article id="page-presentation" className="proposal-sheet">
              {/* Header */}
              <header className="page-header-banner">
                <CiavoltLogo customLogoUrl={data.logoUrl} variant="header" />
                <span className="font-bold text-[#7fd4f4]">PROPOSTA COMERCIAL</span>
              </header>

              {/* Body Content */}
              <div className="p-[14mm_14mm] relative z-1 flex-1 flex flex-col">
                <span className="text-[12px] font-black text-[#f28c28] tracking-[0.2em] uppercase block">
                  01
                </span>
                <h2 className="text-[24px] font-black text-[#102b43] tracking-tight mt-[1.5mm] mb-[2mm]">
                  APRESENTAÇÃO
                </h2>
                <p className="text-[13px] text-[#5f6f78] leading-relaxed max-w-[170mm] mb-[5mm]">
                  Uma proposta preparada para atender sua operação com máxima eficiência energética, segurança técnica e total transparência.
                </p>

                {/* Greeting Card */}
                <div className="bg-gradient-to-r from-[#eaf7fc] to-white border-l-[5px] border-[#39a9d6] p-[6mm_8mm] rounded-r-xl shadow-xs mb-[6mm]">
                  <h3 className="text-[16px] font-bold text-[#102b43] mb-[2mm]">
                    Olá, <span className="text-[#1476b8]">{data.clientName || 'Cliente'}</span>.
                  </h3>
                  <p className="text-[12.5px] text-[#273746] leading-[1.6] m-0">
                    Apresentamos as condições técnicas e comerciais para o fornecimento dos equipamentos e serviços descritos nesta proposta. Nosso compromisso é entregar uma solução completa e de alto desempenho, assegurando suporte próximo e especializado em todas as etapas.
                  </p>
                </div>

                {/* Client Data */}
                <h3 className="text-[12px] font-black text-[#1476b8] tracking-wider uppercase mb-[2.5mm]">
                  DADOS DO CLIENTE
                </h3>
                <div className="grid grid-cols-2 gap-[3mm] mb-[6mm]">
                  <div className="p-[3mm_4mm] border border-[#dce5ea] rounded-lg bg-[#fbfdfe]">
                    <span className="text-[8.5px] uppercase tracking-wider text-[#6f7d86] font-bold block">
                      Nome / Razão Social
                    </span>
                    <span className="text-[12px] font-bold text-[#102b43] block mt-[1mm] break-words">
                      {data.clientName || '—'}
                    </span>
                  </div>

                  <div className="p-[3mm_4mm] border border-[#dce5ea] rounded-lg bg-[#fbfdfe]">
                    <span className="text-[8.5px] uppercase tracking-wider text-[#6f7d86] font-bold block">
                      CPF / CNPJ
                    </span>
                    <span className="text-[12px] font-bold text-[#102b43] block mt-[1mm]">
                      {data.clientDocument || '—'}
                    </span>
                  </div>

                  <div className="p-[3mm_4mm] border border-[#dce5ea] rounded-lg bg-[#fbfdfe]">
                    <span className="text-[8.5px] uppercase tracking-wider text-[#6f7d86] font-bold block">
                      Telefone / WhatsApp
                    </span>
                    <span className="text-[12px] font-bold text-[#102b43] block mt-[1mm]">
                      {data.clientPhone || '—'}
                    </span>
                  </div>

                  <div className="p-[3mm_4mm] border border-[#dce5ea] rounded-lg bg-[#fbfdfe]">
                    <span className="text-[8.5px] uppercase tracking-wider text-[#6f7d86] font-bold block">
                      E-mail
                    </span>
                    <span className="text-[12px] font-bold text-[#102b43] block mt-[1mm] break-words">
                      {data.clientEmail || '—'}
                    </span>
                  </div>

                  <div className="col-span-2 p-[3mm_4mm] border border-[#dce5ea] rounded-lg bg-[#fbfdfe]">
                    <span className="text-[8.5px] uppercase tracking-wider text-[#6f7d86] font-bold block">
                      Endereço Completo
                    </span>
                    <span className="text-[12px] font-bold text-[#102b43] block mt-[1mm]">
                      {data.clientAddress || '—'}
                    </span>
                  </div>
                </div>

                {/* Pillars */}
                <div className="grid grid-cols-3 gap-[3.5mm] pt-[3mm] mt-auto">
                  <div className="border-t-[3.5px] border-[#f28c28] pt-[2.5mm]">
                    <b className="text-[11px] font-extrabold text-[#102b43] tracking-wide block">
                      AGILIDADE
                    </b>
                    <span className="text-[10px] text-[#6f7d86] leading-relaxed block mt-[1mm]">
                      Resposta rápida, dimensionamento preciso e processo objetivo.
                    </span>
                  </div>

                  <div className="border-t-[3.5px] border-[#f28c28] pt-[2.5mm]">
                    <b className="text-[11px] font-extrabold text-[#102b43] tracking-wide block">
                      SEGURANÇA
                    </b>
                    <span className="text-[10px] text-[#6f7d86] leading-relaxed block mt-[1mm]">
                      Equipamentos Tier 1 certificados e garantias de fábrica sólidas.
                    </span>
                  </div>

                  <div className="border-t-[3.5px] border-[#f28c28] pt-[2.5mm]">
                    <b className="text-[11px] font-extrabold text-[#102b43] tracking-wide block">
                      PARCERIA
                    </b>
                    <span className="text-[10px] text-[#6f7d86] leading-relaxed block mt-[1mm]">
                      Atendimento de excelência do projeto à homologação e pós-venda.
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="page-footer-banner">
                <span className="font-semibold">{footerText}</span>
                <span className="font-mono">{data.proposalNumber || 'CR-2026-001'}</span>
              </footer>
            </article>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA 3: EQUIPAMENTOS E CONDIÇÕES                                       */}
          {/* ========================================================================= */}
          {showPage3 && (
            <article id="page-items" className="proposal-sheet">
              {/* Header */}
              <header className="page-header-banner">
                <CiavoltLogo customLogoUrl={data.logoUrl} variant="header" />
                <span className="font-bold text-[#7fd4f4]">PROPOSTA COMERCIAL</span>
              </header>

              {/* Body Content */}
              <div className="p-[12mm_14mm] relative z-1 flex-1 flex flex-col">
                <span className="text-[12px] font-black text-[#f28c28] tracking-[0.2em] uppercase block">
                  02
                </span>
                <h2 className="text-[24px] font-black text-[#102b43] tracking-tight mt-[1mm] mb-[1.5mm]">
                  EQUIPAMENTOS & SERVIÇOS
                </h2>
                <p className="text-[12.5px] text-[#5f6f78] mb-[3mm]">
                  Itens e especificações técnicas selecionados para esta proposta comercial.
                </p>

                {/* Items Table */}
                <div className="border border-[#dce5ea] rounded-lg overflow-hidden mb-[3.5mm] shadow-xs">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#1476b8] text-white text-[9px] uppercase tracking-wider font-bold">
                        <th className="p-[3mm_3.5mm] w-[54%]">Equipamento / Descrição</th>
                        <th className="p-[3mm_2.5mm] text-center w-[12%]">Qtd.</th>
                        <th className="p-[3mm_2.5mm] text-right w-[17%]">Valor Unit.</th>
                        <th className="p-[3mm_3.5mm] text-right w-[17%]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dce5ea] bg-white">
                      {data.items.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-xs text-slate-400">
                            Nenhum equipamento adicionado à proposta.
                          </td>
                        </tr>
                      ) : (
                        data.items.map((item, idx) => {
                          const itemSubtotal = calculateItemTotal(item.qty, item.price);
                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50/70">
                              <td className="p-[2.5mm_3.5mm] align-top">
                                <b className="text-[11px] text-[#102b43] block leading-tight">
                                  {item.name || 'Equipamento'}
                                </b>
                                {item.description && (
                                  <small className="text-[9.5px] text-[#6f7d86] block mt-[0.5mm] leading-snug whitespace-pre-wrap">
                                    {item.description}
                                  </small>
                                )}
                              </td>
                              <td className="p-[2.5mm_2.5mm] text-center text-[10.5px] font-semibold text-[#273746] align-top">
                                {item.qty || 0}
                              </td>
                              <td className="p-[2.5mm_2.5mm] text-right text-[10.5px] text-[#273746] align-top font-mono">
                                {formatMoney(item.price)}
                              </td>
                              <td className="p-[2.5mm_3.5mm] text-right text-[11px] font-bold text-[#1476b8] align-top font-mono">
                                {formatMoney(itemSubtotal)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Total Card */}
                <div className="bg-[#102b43] text-white rounded-lg p-[4mm_5mm] flex items-center justify-between shadow-xs mb-[4mm]">
                  <div>
                    <span className="text-[9.5px] tracking-[0.16em] font-bold text-[#7fd4f4] uppercase block">
                      Investimento Total
                    </span>
                    <span className="text-[9.5px] text-slate-300">
                      Equipamentos, materiais e serviços inclusos
                    </span>
                  </div>
                  <strong className="text-[22px] font-black text-[#7fd4f4] tracking-tight font-mono">
                    {formatMoney(grandTotal)}
                  </strong>
                </div>

                {/* Commercial Conditions */}
                <div className="mt-auto">
                  <h3 className="text-[11.5px] font-black text-[#1476b8] tracking-wider uppercase mb-[2.5mm]">
                    CONDIÇÕES COMERCIAIS
                  </h3>
                  <div className="grid grid-cols-2 gap-[2.5mm]">
                    <div className="border-l-[3.5px] border-[#f28c28] pl-[3mm] py-[1mm]">
                      <b className="text-[9px] uppercase font-extrabold text-[#102b43] tracking-wide block">
                        Forma de Pagamento
                      </b>
                      <p className="text-[10px] text-[#273746] mt-[0.5mm] leading-snug whitespace-pre-wrap m-0">
                        {data.paymentTerms || '—'}
                      </p>
                    </div>

                    <div className="border-l-[3.5px] border-[#f28c28] pl-[3mm] py-[1mm]">
                      <b className="text-[9px] uppercase font-extrabold text-[#102b43] tracking-wide block">
                        Prazo de Entrega
                      </b>
                      <p className="text-[10px] text-[#273746] mt-[0.5mm] leading-snug whitespace-pre-wrap m-0">
                        {data.deliveryTime || '—'}
                      </p>
                    </div>

                    <div className="border-l-[3.5px] border-[#f28c28] pl-[3mm] py-[1mm]">
                      <b className="text-[9px] uppercase font-extrabold text-[#102b43] tracking-wide block">
                        Garantia
                      </b>
                      <p className="text-[10px] text-[#273746] mt-[0.5mm] leading-snug whitespace-pre-wrap m-0">
                        {data.warranty || '—'}
                      </p>
                    </div>

                    <div className="border-l-[3.5px] border-[#f28c28] pl-[3mm] py-[1mm]">
                      <b className="text-[9px] uppercase font-extrabold text-[#102b43] tracking-wide block">
                        Observações
                      </b>
                      <p className="text-[10px] text-[#273746] mt-[0.5mm] leading-snug whitespace-pre-wrap m-0">
                        {data.notes || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="page-footer-banner">
                <span className="font-semibold">{footerText}</span>
                <span className="font-mono">{data.proposalNumber || 'CR-2026-001'}</span>
              </footer>
            </article>
          )}

          {/* ========================================================================= */}
          {/* PÁGINA 4: ACEITE DA PROPOSTA                                              */}
          {/* ========================================================================= */}
          {showPage4 && (
            <article id="page-acceptance" className="proposal-sheet">
              {/* Header */}
              <header className="page-header-banner">
                <CiavoltLogo customLogoUrl={data.logoUrl} variant="header" />
                <span className="font-bold text-[#7fd4f4]">PROPOSTA COMERCIAL</span>
              </header>

              {/* Body Content */}
              <div className="p-[14mm_14mm] relative z-1 flex-1 flex flex-col">
                <span className="text-[12px] font-black text-[#f28c28] tracking-[0.2em] uppercase block">
                  03
                </span>
                <h2 className="text-[24px] font-black text-[#102b43] tracking-tight mt-[1mm] mb-[1.5mm]">
                  ACEITE DA PROPOSTA
                </h2>
                <p className="text-[12.5px] text-[#5f6f78] mb-[5mm]">
                  Esta proposta é válida por <b>{data.validity || 7} dias</b> a partir de <b>{formatDateBR(data.issueDate)}</b>.
                </p>

                {/* Accept Summary Card */}
                <div className="bg-gradient-to-br from-[#102b43] via-[#1476b8] to-[#164866] p-[6mm_8mm] text-white rounded-xl shadow-md mb-[5mm]">
                  <span className="text-[10px] font-bold tracking-[0.16em] text-[#9fe2fa] uppercase block">
                    Valor Total da Proposta
                  </span>
                  <strong className="block text-[28px] font-black text-white tracking-tight my-[2mm] font-mono">
                    {formatMoney(grandTotal)}
                  </strong>
                  <small className="text-[11px] text-[#dff3fb] block leading-relaxed opacity-95">
                    <b>Condição: </b>{data.paymentTerms}
                  </small>
                </div>

                {/* Legal Acceptance Text */}
                <p className="text-[12.5px] text-[#273746] leading-relaxed bg-[#fbfdfe] p-[3.5mm_4.5mm] border border-[#dce5ea] rounded-lg mb-[8mm]">
                  Declaro estar de pleno acordo com os equipamentos, especificações, prazos, valores e condições comerciais apresentados nesta proposta comercial.
                </p>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-[14mm] mt-[6mm] text-center">
                  <div>
                    <div className="border-t-[1.5px] border-[#102b43] pt-[2mm] mb-[1mm]" />
                    <b className="block text-[11.5px] text-[#102b43]">
                      {data.clientName || 'Cliente'}
                    </b>
                    <small className="text-[9px] uppercase tracking-wider text-[#6f7d86] font-semibold">
                      Assinatura do Cliente
                    </small>
                  </div>

                  <div>
                    <div className="border-t-[1.5px] border-[#102b43] pt-[2mm] mb-[1mm]" />
                    <b className="block text-[11.5px] text-[#102b43]">
                      {data.seller || footerText}
                    </b>
                    <small className="text-[9px] uppercase tracking-wider text-[#6f7d86] font-semibold">
                      {footerText}
                    </small>
                  </div>
                </div>

                {/* Closing Section */}
                <div className="mt-auto pt-[6mm] text-center">
                  <h3 className="text-[18px] font-extrabold text-[#1476b8] m-0 mb-[1mm]">
                    Obrigado pela confiança.
                  </h3>
                  <p className="text-[12px] text-[#5f6f78] m-0">
                    Estamos prontos para levar sustentabilidade e economia para a sua operação.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <footer className="page-footer-banner">
                <span className="font-semibold">{footerText}</span>
                <span className="font-mono">{data.proposalNumber || 'CR-2026-001'}</span>
              </footer>
            </article>
          )}
        </div>
      </div>
    </div>
  );
};
