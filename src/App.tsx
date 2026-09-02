/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProposalData, INITIAL_PROPOSAL_DATA, SUNCLEAR_POST_SALES_PROPOSAL_DATA } from './types';
import { Header } from './components/Header';
import { EditorPanel } from './components/EditorPanel';
import { ProposalPreview } from './components/ProposalPreview';
import { Eye, Edit3, Loader2, CheckCircle2 } from 'lucide-react';
import { printCleanProposal, openProposalNewTab } from './utils/printProposal';
import { downloadProposalPdf } from './utils/pdfExport';

const STORAGE_KEY = 'ciavolt_proposal_data_v2';
const LOGO_STORAGE_KEY = 'ciavolt_custom_logo_v2';

export default function App() {
  const [data, setData] = useState<ProposalData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
        return {
          ...INITIAL_PROPOSAL_DATA,
          ...parsed,
          logoUrl: savedLogo || parsed.logoUrl || ''
        };
      }
    } catch (e) {
      console.warn('Erro ao carregar dados salvos do localStorage', e);
    }
    return INITIAL_PROPOSAL_DATA;
  });

  const [activeView, setActiveView] = useState<'all' | 'page-1' | 'page-2' | 'page-3' | 'page-4'>('all');
  const [zoom, setZoom] = useState<number>(0.85);
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');

  // Auto-adjust default zoom for screen size on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setZoom(0.48);
      } else if (window.innerWidth < 1280) {
        setZoom(0.68);
      } else if (window.innerWidth < 1536) {
        setZoom(0.8);
      } else {
        setZoom(0.9);
      }
    };

    handleResize();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (data.logoUrl) {
        localStorage.setItem(LOGO_STORAGE_KEY, data.logoUrl);
      }
      setIsSavedToast(true);
      showToast('Dados salvos com sucesso!');
      setTimeout(() => setIsSavedToast(false), 2000);
    } catch (err) {
      console.error('Falha ao salvar', err);
      alert('Não foi possível salvar os dados no navegador.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja redefinir os dados da proposta para os padrões?')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LOGO_STORAGE_KEY);
      setData(INITIAL_PROPOSAL_DATA);
      showToast('Formulário restaurado para o padrão.');
    }
  };

  const handleLoadSample = () => {
    setData(INITIAL_PROPOSAL_DATA);
    setIsSavedToast(true);
    showToast('Modelo solar carregado com sucesso!');
    setTimeout(() => setIsSavedToast(false), 1500);
  };

  const handleLoadSunClearSample = () => {
    setData(SUNCLEAR_POST_SALES_PROPOSAL_DATA);
    setIsSavedToast(true);
    showToast('Modelo Pós-Venda SunClear carregado com sucesso!');
    setTimeout(() => setIsSavedToast(false), 1500);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const isCompact = data.layoutMode === 'compact';
      setPdfProgress(`Iniciando renderização ${isCompact ? 'das 2 páginas' : 'das 4 páginas'}...`);
      await downloadProposalPdf(data, (progressMsg) => {
        setPdfProgress(progressMsg);
      });
      showToast('PDF gerado e baixado com sucesso!');
    } catch (error) {
      console.error('Erro na geração do PDF:', error);
      alert('Houve uma falha ao gerar o PDF direto. Abrindo janela de impressão alternativa...');
      printCleanProposal(data);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const handlePrint = () => {
    printCleanProposal(data);
  };

  const handleOpenNewTab = () => {
    openProposalNewTab(data);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Por favor selecione uma imagem com tamanho inferior a 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setData(prev => ({
        ...prev,
        logoUrl: result
      }));
      try {
        localStorage.setItem(LOGO_STORAGE_KEY, result);
      } catch {
        // quota exceeded fallback
      }
      showToast('Logo atualizado!');
    };
    reader.readAsDataURL(file);
  };

  const handleClearLogo = () => {
    setData(prev => ({
      ...prev,
      logoUrl: ''
    }));
    localStorage.removeItem(LOGO_STORAGE_KEY);
    showToast('Logo customizado removido.');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `proposta-${data.proposalNumber || 'ciavolt'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.items)) {
          setData(prev => ({
            ...prev,
            ...parsed
          }));
          showToast('Proposta importada com sucesso!');
        } else {
          alert('Formato de arquivo JSON inválido para proposta.');
        }
      } catch {
        alert('Erro ao ler o arquivo JSON selecionado.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef3f6]">
      {/* Header */}
      <Header
        onSave={handleSave}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        onLoadSunClearSample={handleLoadSunClearSample}
        onPrint={handlePrint}
        onDownloadPdf={handleDownloadPdf}
        isGeneratingPdf={isGeneratingPdf}
        onOpenNewTab={handleOpenNewTab}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        zoom={zoom}
        setZoom={setZoom}
        activeView={activeView}
        setActiveView={setActiveView}
        isSavedToast={isSavedToast}
        layoutMode={data.layoutMode || 'standard'}
        onLayoutModeChange={(mode) => setData(prev => ({ ...prev, layoutMode: mode }))}
      />

      {/* Mobile Tab Switcher */}
      <div className="no-print lg:hidden flex flex-wrap items-center justify-between bg-[#102b43] text-white border-b border-white/10 px-3 py-2 gap-2 sticky top-[72px] z-20 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mobileTab === 'editor' ? 'bg-[#1476b8] text-white shadow-xs' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mobileTab === 'preview' ? 'bg-[#1476b8] text-white shadow-xs' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visualizar</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setData(prev => ({ ...prev, layoutMode: prev.layoutMode === 'compact' ? 'standard' : 'compact' }))}
            className={`text-[11px] font-bold px-2 py-1 rounded border transition ${
              data.layoutMode === 'compact'
                ? 'bg-[#f28c28] text-white border-[#f28c28]'
                : 'bg-white/5 text-slate-200 border-white/20'
            }`}
          >
            {data.layoutMode === 'compact' ? 'Enxuta (2p)' : '4 Páginas'}
          </button>
          <button
            onClick={handleLoadSample}
            title="Carregar Modelo Solar Padrão"
            className="text-[11px] font-medium text-[#7fd4f4] px-2 py-1 rounded border border-[#39a9d6]/30 hover:bg-[#39a9d6]/10 hidden sm:inline-block"
          >
            Solar
          </button>
          <button
            onClick={handleLoadSunClearSample}
            title="Carregar Modelo Pós-Venda SunClear"
            className="text-[11px] font-semibold text-[#f28c28] px-2 py-1 rounded border border-[#f28c28]/40 hover:bg-[#f28c28]/20 hidden sm:inline-block"
          >
            Pós-Venda
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="workspace-container flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Editor Sidebar */}
        <div className={`editor-sidebar no-print ${mobileTab === 'editor' ? 'block' : 'hidden'} lg:block`}>
          <EditorPanel
            data={data}
            onChange={setData}
            onLogoUpload={handleLogoUpload}
            onClearLogo={handleClearLogo}
          />
        </div>

        {/* Live Proposal Preview */}
        <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 overflow-hidden`}>
          <ProposalPreview
            data={data}
            activeView={activeView}
            setActiveView={setActiveView}
            zoom={zoom}
            setZoom={setZoom}
          />
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-[#102b43] text-white px-4 py-3 rounded-xl shadow-xl border border-[#39a9d6]/30 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* PDF Generation Progress Modal */}
      {isGeneratingPdf && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl flex flex-col items-center border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-[#f28c28]/10 flex items-center justify-center mb-3">
              <Loader2 className="w-6 h-6 text-[#f28c28] animate-spin" />
            </div>
            <h3 className="text-base font-bold text-[#102b43] mb-1">
              Gerando Proposta em PDF
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {pdfProgress || 'Renderizando as 4 páginas em alta resolução...'}
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1476b8] to-[#f28c28] h-full w-3/4 animate-pulse rounded-full" />
            </div>
            <span className="text-[11px] text-slate-400 mt-3 font-medium">
              Por favor, aguarde alguns instantes...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
