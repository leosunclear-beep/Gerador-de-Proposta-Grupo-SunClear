import React, { useState } from 'react';
import {
  Printer,
  Save,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  ChevronDown,
  Loader2,
  FileDown,
  Wrench,
  Zap,
  FileText
} from 'lucide-react';
import { CiavoltLogo } from './CiavoltLogo';

interface HeaderProps {
  onSave: () => void;
  onReset: () => void;
  onLoadSample: () => void;
  onLoadSunClearSample: () => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
  onOpenNewTab: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  activeView: 'all' | 'page-1' | 'page-2' | 'page-3' | 'page-4';
  setActiveView: (view: 'all' | 'page-1' | 'page-2' | 'page-3' | 'page-4') => void;
  isSavedToast: boolean;
  layoutMode?: 'standard' | 'compact';
  onLayoutModeChange?: (mode: 'standard' | 'compact') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSave,
  onReset,
  onLoadSample,
  onLoadSunClearSample,
  onPrint,
  onDownloadPdf,
  isGeneratingPdf,
  onOpenNewTab,
  onExportJson,
  onImportJson,
  zoom,
  setZoom,
  activeView,
  setActiveView,
  isSavedToast,
  layoutMode = 'standard',
  onLayoutModeChange
}) => {
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const isCompact = layoutMode === 'compact';

  return (
    <header className="app-header h-18 px-3 sm:px-6 bg-[#102b43] text-white flex items-center justify-between sticky top-0 z-30 shadow-md border-b border-[#164866]">
      {/* Brand & App Title */}
      <div className="flex items-center gap-2.5">
        <CiavoltLogo variant="header" />
        <div className="hidden md:block h-6 w-px bg-white/20 ml-1" />
        <div className="hidden md:flex flex-col">
          <span className="text-[10px] tracking-[0.22em] text-[#7fd4f4] font-semibold uppercase">
            Sistema de Vendas & Engenharia
          </span>
          <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
            Gerador de Propostas Comerciais
          </h1>
        </div>
      </div>

      {/* Center View Switcher & Zoom (Desktop) */}
      <div className="hidden lg:flex items-center gap-2 bg-[#0c2033] p-1 rounded-lg border border-white/10">
        <div className="flex text-xs font-medium">
          <button
            onClick={() => setActiveView('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeView === 'all'
                ? 'bg-[#1476b8] text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {isCompact ? 'Todas (2)' : 'Todas (4)'}
          </button>
          <button
            onClick={() => setActiveView('page-1')}
            className={`px-2.5 py-1.5 rounded-md transition-colors ${
              activeView === 'page-1'
                ? 'bg-[#1476b8] text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            1. Capa
          </button>
          {isCompact ? (
            <button
              onClick={() => setActiveView('page-2')}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                activeView === 'page-2'
                  ? 'bg-[#1476b8] text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              2. Orçamento & Condições
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveView('page-2')}
                className={`px-2.5 py-1.5 rounded-md transition-colors ${
                  activeView === 'page-2'
                    ? 'bg-[#1476b8] text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                2. Apresentação
              </button>
              <button
                onClick={() => setActiveView('page-3')}
                className={`px-2.5 py-1.5 rounded-md transition-colors ${
                  activeView === 'page-3'
                    ? 'bg-[#1476b8] text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                3. Equipamentos
              </button>
              <button
                onClick={() => setActiveView('page-4')}
                className={`px-2.5 py-1.5 rounded-md transition-colors ${
                  activeView === 'page-4'
                    ? 'bg-[#1476b8] text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                4. Aceite
              </button>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-white/20 mx-1" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 text-slate-300 text-xs">
          <button
            title="Reduzir Zoom"
            onClick={() => setZoom(prev => Math.max(0.4, Number((prev - 0.1).toFixed(1))))}
            className="p-1 hover:text-white hover:bg-white/10 rounded transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center font-mono font-medium text-[11px]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            title="Aumentar Zoom"
            onClick={() => setZoom(prev => Math.min(1.5, Number((prev + 0.1).toFixed(1))))}
            className="p-1 hover:text-white hover:bg-white/10 rounded transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            title="Ajustar 100%"
            onClick={() => setZoom(1.0)}
            className="p-1 hover:text-white hover:bg-white/10 rounded transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Backup / Export Import Tools & Layout Switch */}
        <div className="hidden sm:flex items-center gap-1.5 mr-1">
          {/* Format Toggle Button: Enxuta x Completa */}
          {onLayoutModeChange && (
            <button
              onClick={() => onLayoutModeChange(isCompact ? 'standard' : 'compact')}
              title={isCompact ? 'Alternar para Proposta Completa (4 páginas)' : 'Alternar para Proposta Enxuta (2 páginas: Capa + Orçamento)'}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition font-bold ${
                isCompact
                  ? 'bg-[#f28c28] text-white border-[#f28c28] shadow-xs'
                  : 'bg-white/5 text-slate-200 border-white/20 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isCompact ? 'text-white' : 'text-[#f28c28]'}`} />
              <span>{isCompact ? 'Proposta Enxuta (2 págs)' : 'Proposta Enxuta'}</span>
            </button>
          )}

          <button
            onClick={onLoadSample}
            title="Carregar exemplo de proposta solar para novas instalações"
            className="flex items-center gap-1.5 text-xs text-[#7fd4f4] hover:text-white px-2.5 py-1.5 rounded-lg border border-[#39a9d6]/30 hover:bg-[#39a9d6]/10 transition font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f28c28]" />
            <span className="hidden 2xl:inline">Modelo Solar</span>
          </button>

          <button
            onClick={onLoadSunClearSample}
            title="Carregar modelo de proposta comercial de Pós-Venda SunClear (Assistência Técnica, Manutenção, Trocas e Limpeza)"
            className="flex items-center gap-1.5 text-xs text-[#ffb067] hover:text-white px-2.5 py-1.5 rounded-lg border border-[#f28c28]/40 hover:bg-[#f28c28]/15 transition font-semibold"
          >
            <Wrench className="w-3.5 h-3.5 text-[#f28c28]" />
            <span className="hidden 2xl:inline">Modelo Pós-Venda SunClear</span>
            <span className="2xl:hidden">Pós-Venda</span>
          </button>
          
          <button
            onClick={onExportJson}
            title="Exportar dados da proposta em arquivo JSON"
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
          </button>

          <label
            title="Importar proposta JSON"
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={onImportJson}
              className="hidden"
            />
          </label>
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          title="Limpar formulário e recomeçar"
          className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Limpar</span>
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition shadow-xs ${
            isSavedToast
              ? 'bg-emerald-500 text-white'
              : 'bg-[#dff3fb] text-[#102b43] hover:bg-white'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isSavedToast ? 'Salvo!' : 'Salvar'}</span>
        </button>

        {/* Print / PDF Actions */}
        <div className="relative">
          <div className="flex items-stretch rounded-lg shadow-md shadow-[#f28c28]/25">
            <button
              onClick={onDownloadPdf}
              disabled={isGeneratingPdf}
              title="Baixar arquivo PDF de alta resolução da proposta"
              className="flex items-center gap-2 text-xs font-bold px-3.5 py-2 bg-gradient-to-r from-[#f28c28] to-[#e67a14] hover:from-[#e67a14] hover:to-[#d06907] disabled:opacity-75 text-white rounded-l-lg transition active:scale-95"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Baixar PDF</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowPrintMenu(!showPrintMenu)}
              title="Mais opções de Impressão e PDF"
              className="px-2 bg-[#d06907] hover:bg-[#b85a03] text-white rounded-r-lg border-l border-white/20 transition flex items-center justify-center"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dropdown Menu */}
          {showPrintMenu && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white text-[#1e293b] rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in"
              onMouseLeave={() => setShowPrintMenu(false)}
            >
              <button
                onClick={() => {
                  setShowPrintMenu(false);
                  onDownloadPdf();
                }}
                className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-[#f0f4f8] flex items-start gap-2.5 transition"
              >
                <FileDown className="w-4 h-4 text-[#f28c28] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#102b43] block">Baixar Arquivo PDF (Recomendado)</span>
                  <span className="text-[11px] text-slate-500 block">
                    Gera e faz download direto do PDF oficial de 4 páginas
                  </span>
                </div>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button
                onClick={() => {
                  setShowPrintMenu(false);
                  onPrint();
                }}
                className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-[#f0f4f8] flex items-start gap-2.5 transition"
              >
                <Printer className="w-4 h-4 text-[#1476b8] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#102b43] block">Imprimir / Salvar pelo Navegador</span>
                  <span className="text-[11px] text-slate-500 block">
                    Abre o diálogo de impressão do sistema
                  </span>
                </div>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button
                onClick={() => {
                  setShowPrintMenu(false);
                  onOpenNewTab();
                }}
                className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-[#f0f4f8] flex items-start gap-2.5 transition"
              >
                <ExternalLink className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#102b43] block">Abrir Proposta em Nova Aba</span>
                  <span className="text-[11px] text-slate-500 block">
                    Visualização em tela cheia isolada
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
