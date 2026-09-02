import { ProposalData } from '../types';
import { formatMoney, formatDateBR, calculateItemTotal, calculateGrandTotal } from './formatters';

/**
 * Builds a pristine, self-contained HTML string of the CIAVOLT Proposal
 * (either standard 4-page or compact 2-page format) with zero dependency on the
 * host editor UI, ensuring exact A4 PDF output.
 */
export function buildProposalHtml(data: ProposalData): string {
  const isCompact = data.layoutMode === 'compact';
  const grandTotal = calculateGrandTotal(data.items);
  const formattedGrandTotal = formatMoney(grandTotal);
  const formattedIssueDate = formatDateBR(data.issueDate);
  const footerText = escapeHtml(data.customFooterText || 'CIAVOLT ENERGIA SOLAR');
  const coverFooterText = escapeHtml(data.customCoverFooter || 'CONFIANÇA QUE MOVE NEGÓCIOS • CIAVOLT ENERGIA SOLAR');

  const logoMarkup = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="Logo" class="brand-logo-custom" />`
    : `
      <div class="brand-logo-svg">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="logo-text">
          <div class="logo-title">CIA<span>VOLT</span></div>
          <div class="logo-sub">ENERGIA SOLAR</div>
        </div>
      </div>
    `;

  const itemsRows = data.items.length === 0
    ? `<tr><td colspan="4" style="text-align:center; padding:10px; color:#64748b; font-size:10px;">Nenhum item adicionado</td></tr>`
    : data.items.map((item) => {
        const subtotal = calculateItemTotal(item.qty, item.price);
        return `
          <tr>
            <td class="td-desc">
              <b>${escapeHtml(item.name || 'Equipamento')}</b>
              ${item.description ? `<small>${escapeHtml(item.description)}</small>` : ''}
            </td>
            <td class="td-center">${item.qty || 0}</td>
            <td class="td-right">${formatMoney(item.price)}</td>
            <td class="td-right td-subtotal">${formatMoney(subtotal)}</td>
          </tr>
        `;
      }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Proposta Comercial ${escapeHtml(data.proposalNumber || 'CIAVOLT')} - ${escapeHtml(data.clientName || 'Cliente')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #102b43;
      --blue: #1476b8;
      --cyan: #39a9d6;
      --orange: #f28c28;
      --bg: #f1f5f9;
      --ink: #1e293b;
      --muted: #64748b;
      --line: #cbd5e1;
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      color: var(--ink);
      background-color: var(--bg);
    }

    .toolbar-screen {
      position: sticky;
      top: 0;
      z-index: 999;
      background: #102b43;
      color: #fff;
      padding: 10px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .toolbar-screen h1 {
      font-size: 14px;
      margin: 0;
      font-weight: 700;
    }
    .toolbar-screen .btn-print {
      background: #f28c28;
      color: #fff;
      border: none;
      font-weight: 700;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .toolbar-screen .btn-print:hover {
      background: #e67a14;
    }

    .pages-container {
      padding: 20px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .page {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      background: #fff;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
      page-break-after: always;
      break-after: page;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    /* Inner pages background wave effect */
    .page:not(.cover)::after {
      content: "";
      position: absolute;
      right: -110mm;
      bottom: -120mm;
      width: 250mm;
      height: 190mm;
      border: 1px solid rgba(57, 169, 214, 0.18);
      border-radius: 50%;
      box-shadow: 0 0 0 18mm rgba(57, 169, 214, 0.04), 0 0 0 42mm rgba(20, 118, 184, 0.03);
      pointer-events: none;
      z-index: 0;
    }

    /* Logo styles */
    .brand-logo-custom {
      max-height: 14mm;
      max-width: 50mm;
      object-fit: contain;
    }
    .brand-logo-svg {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-logo-svg .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--orange), #ff6b00);
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(242, 140, 40, 0.35);
    }
    .brand-logo-svg .logo-icon svg {
      width: 18px;
      height: 18px;
    }
    .brand-logo-svg .logo-title {
      font-size: 16px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
      letter-spacing: -0.01em;
    }
    .brand-logo-svg .logo-title span {
      color: #7fd4f4;
    }
    .brand-logo-svg .logo-sub {
      font-size: 7px;
      font-weight: 700;
      color: #7fd4f4;
      letter-spacing: 0.18em;
      margin-top: 1px;
    }

    /* Page 1: Cover */
    .page.cover {
      background: #081c2c;
      color: #ffffff;
    }
    .cover-shape {
      position: absolute;
      top: -30mm;
      right: -30mm;
      width: 170mm;
      height: 170mm;
      background: radial-gradient(circle, rgba(57, 169, 214, 0.22) 0%, rgba(20, 118, 184, 0.08) 50%, rgba(8, 28, 44, 0) 70%);
      pointer-events: none;
    }
    .cover-brand {
      padding: 18mm 16mm 0;
      position: relative;
      z-index: 2;
    }
    .cover-content {
      padding: 24mm 16mm 0;
      position: relative;
      z-index: 2;
      max-width: 170mm;
    }
    .cover-kicker {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.24em;
      color: #9fe2fa;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
    }
    .cover-headline {
      font-size: 42px;
      font-weight: 900;
      line-height: 1.02;
      color: #ffffff;
      margin: 5mm 0;
      letter-spacing: -0.02em;
    }
    .cover-headline span {
      color: var(--orange);
    }
    .cover-meta {
      border-left: 4px solid var(--orange);
      padding-left: 6mm;
      margin-top: 6mm;
    }
    .cover-meta p {
      margin: 2mm 0;
      font-size: 12.5px;
      color: #ffffff;
    }
    .cover-meta b {
      color: #9fe2fa;
      font-weight: 600;
    }
    .cover-road-lines {
      position: absolute;
      width: 150mm;
      height: 84mm;
      bottom: 28mm;
      right: -35mm;
      border: 3mm solid rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      transform: rotate(-17deg);
      box-shadow: 0 0 0 11mm rgba(255, 255, 255, 0.05), 0 0 0 26mm rgba(255, 255, 255, 0.03);
      pointer-events: none;
    }
    .cover-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 18mm;
      display: flex;
      align-items: center;
      padding: 0 16mm;
      background: #081c2c;
      color: #71cbe9;
      font-size: 10px;
      letter-spacing: 0.24em;
      font-weight: 700;
      text-transform: uppercase;
      z-index: 10;
      border-top: 1px solid rgba(20, 118, 184, 0.3);
    }

    /* Common Page Elements */
    .page-header {
      height: 18mm;
      background: var(--navy);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14mm;
      border-bottom: 2px solid var(--blue);
      position: relative;
      z-index: 1;
    }
    .page-body {
      padding: 12mm 14mm;
      position: relative;
      z-index: 1;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .page-body.compact-body {
      padding: 7mm 12mm;
      justify-content: space-between;
    }
    .section-no {
      font-size: 11px;
      font-weight: 900;
      color: var(--orange);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      display: block;
    }
    .section-title {
      font-size: 22px;
      font-weight: 900;
      color: var(--navy);
      margin: 1mm 0 1.5mm;
      letter-spacing: -0.01em;
    }
    .section-lead {
      font-size: 12px;
      color: var(--muted);
      margin: 0 0 4mm;
      line-height: 1.45;
    }
    .page-footer {
      height: 13mm;
      background: var(--navy);
      color: #7fd4f4;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14mm;
      font-size: 9.5px;
      letter-spacing: 0.12em;
      font-weight: 700;
      position: relative;
      z-index: 1;
      border-top: 1px solid rgba(57, 169, 214, 0.25);
    }

    /* Presentation */
    .intro-card {
      background: linear-gradient(135deg, #eaf7fc, #ffffff);
      border-left: 5px solid var(--cyan);
      padding: 6mm 8mm;
      border-radius: 0 10px 10px 0;
      margin-bottom: 5mm;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .intro-card h3 {
      font-size: 16px;
      font-weight: 800;
      color: var(--navy);
      margin: 0 0 2mm;
    }
    .intro-card h3 span {
      color: var(--blue);
    }
    .intro-card p {
      font-size: 12.5px;
      color: var(--ink);
      line-height: 1.6;
      margin: 0;
    }
    .subhead-title {
      font-size: 11.5px;
      font-weight: 900;
      color: var(--blue);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin: 0 0 2.5mm;
    }
    .client-data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3mm;
      margin-bottom: 5mm;
    }
    .data-box {
      border: 1px solid #dce5ea;
      border-radius: 6px;
      padding: 3mm 4mm;
      background: #fbfdfe;
    }
    .data-box.wide {
      grid-column: 1 / -1;
    }
    .data-box .lbl {
      font-size: 8.5px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      display: block;
    }
    .data-box .val {
      font-size: 12px;
      font-weight: 700;
      color: var(--navy);
      margin-top: 0.8mm;
      display: block;
      word-break: break-word;
    }
    .pillars-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 3.5mm;
      margin-top: auto;
      padding-top: 3mm;
    }
    .pillar {
      border-top: 3px solid var(--orange);
      padding-top: 2.5mm;
    }
    .pillar b {
      font-size: 11px;
      font-weight: 800;
      color: var(--navy);
      letter-spacing: 0.05em;
      display: block;
    }
    .pillar span {
      font-size: 10px;
      color: var(--muted);
      line-height: 1.45;
      margin-top: 1mm;
      display: block;
    }

    /* Items & Conditions */
    .table-container {
      border: 1px solid #dce5ea;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 3.5mm;
    }
    .table-container.compact-table {
      margin-bottom: 2mm;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    thead tr {
      background: var(--blue);
      color: #ffffff;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
    }
    th, td {
      padding: 2.5mm 3mm;
      font-size: 10.5px;
    }
    .compact-table th, .compact-table td {
      padding: 1.6mm 2.5mm;
      font-size: 9.5px;
    }
    tbody tr {
      border-bottom: 1px solid #e2e8f0;
      background: #ffffff;
    }
    tbody tr:nth-child(even) {
      background: #fbfdfe;
    }
    .td-desc b {
      font-size: 10.5px;
      color: var(--navy);
      display: block;
      line-height: 1.2;
    }
    .compact-table .td-desc b {
      font-size: 9.5px;
    }
    .td-desc small {
      font-size: 9px;
      color: var(--muted);
      margin-top: 0.4mm;
      display: block;
      line-height: 1.25;
      white-space: pre-wrap;
    }
    .compact-table .td-desc small {
      font-size: 8px;
    }
    .td-center {
      text-align: center;
      font-weight: 600;
    }
    .td-right {
      text-align: right;
      font-family: monospace;
    }
    .td-subtotal {
      font-weight: 800;
      color: var(--blue);
    }
    .total-banner {
      background: var(--navy);
      color: #ffffff;
      border-radius: 6px;
      padding: 3mm 4.5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3.5mm;
    }
    .total-banner.compact-total {
      padding: 2mm 3.5mm;
      margin-bottom: 2mm;
    }
    .total-banner .total-lbl {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #7fd4f4;
      text-transform: uppercase;
      display: block;
    }
    .total-banner .total-sub {
      font-size: 8.5px;
      color: #cbd5e1;
    }
    .total-banner strong {
      font-size: 19px;
      font-weight: 900;
      color: #7fd4f4;
      font-family: monospace;
    }
    .conditions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5mm;
      margin-top: auto;
    }
    .conditions-grid.compact-grid {
      gap: 2mm;
      margin-top: 0;
      margin-bottom: 2mm;
    }
    .cond-box {
      border-left: 3px solid var(--orange);
      padding: 0.5mm 0 0.5mm 2.5mm;
      background: #fbfdfe;
      border-top: 1px solid rgba(203, 213, 225, 0.4);
      border-right: 1px solid rgba(203, 213, 225, 0.4);
      border-bottom: 1px solid rgba(203, 213, 225, 0.4);
      border-radius: 0 4px 4px 0;
    }
    .cond-box b {
      font-size: 8.5px;
      font-weight: 800;
      color: var(--navy);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
    }
    .cond-box p {
      font-size: 8.5px;
      color: var(--ink);
      margin: 0.3mm 0 0;
      line-height: 1.3;
      white-space: pre-wrap;
    }

    /* Acceptance */
    .accept-hero {
      background: linear-gradient(135deg, var(--navy), var(--blue));
      padding: 6mm 8mm;
      color: #ffffff;
      border-radius: 10px;
      margin-bottom: 5mm;
      box-shadow: 0 4px 14px rgba(16, 43, 67, 0.15);
    }
    .accept-hero .sub {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.16em;
      color: #9fe2fa;
      text-transform: uppercase;
      display: block;
    }
    .accept-hero strong {
      display: block;
      font-size: 28px;
      font-weight: 900;
      margin: 2mm 0;
      font-family: monospace;
    }
    .accept-hero small {
      font-size: 11px;
      color: #dff3fb;
      display: block;
    }
    .accept-statement {
      font-size: 12px;
      color: var(--ink);
      line-height: 1.5;
      background: #fbfdfe;
      padding: 3.5mm 4.5mm;
      border: 1px solid #dce5ea;
      border-radius: 6px;
      margin-bottom: 8mm;
    }
    .compact-accept-stmt {
      font-size: 8px;
      color: #475569;
      text-align: center;
      margin: 0 0 2mm;
      line-height: 1.3;
    }
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14mm;
      margin-top: 6mm;
      text-align: center;
    }
    .signatures-grid.compact-sig {
      gap: 10mm;
      margin-top: 0;
      border-top: 1px solid #dce5ea;
      padding-top: 1.5mm;
    }
    .sig-line {
      border-top: 1.5px solid var(--navy);
      padding-top: 1.5mm;
      margin-bottom: 0.5mm;
    }
    .sig-name {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--navy);
      display: block;
    }
    .compact-sig .sig-name {
      font-size: 9px;
    }
    .sig-role {
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      font-weight: 600;
    }
    .compact-sig .sig-role {
      font-size: 7.5px;
    }
    .closing-text {
      margin-top: auto;
      padding-top: 6mm;
      text-align: center;
    }
    .closing-text h3 {
      font-size: 18px;
      font-weight: 800;
      color: var(--blue);
      margin: 0 0 1mm;
    }
    .closing-text p {
      font-size: 12px;
      color: var(--muted);
      margin: 0;
    }

    /* Compact 3-col Client Header */
    .compact-client-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2mm;
      margin-bottom: 2mm;
    }
    .compact-client-grid .data-box {
      padding: 1.5mm 2.5mm;
    }
    .compact-client-grid .lbl {
      font-size: 7.5px;
    }
    .compact-client-grid .val {
      font-size: 9.5px;
      margin-top: 0.3mm;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      body {
        background: #ffffff !important;
      }
      .toolbar-screen {
        display: none !important;
      }
      .pages-container {
        padding: 0 !important;
        gap: 0 !important;
      }
      .page {
        margin: 0 !important;
        box-shadow: none !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .page:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar-screen">
    <div>
      <h1>Proposta Comercial &bull; Visualização</h1>
      <span style="font-size:11px; opacity:0.85;">Formato A4 Oficial &bull; ${isCompact ? '2 Páginas (Enxuta)' : '4 Páginas'}</span>
    </div>
    <button class="btn-print" onclick="window.print()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
      Imprimir / Salvar PDF
    </button>
  </div>

  <div class="pages-container">
    <!-- PÁGINA 1: CAPA -->
    <article class="page cover">
      <div class="cover-shape"></div>
      <div class="cover-brand">
        ${logoMarkup}
      </div>
      <div class="cover-content">
        <span class="cover-kicker">SOLUÇÕES EM ENERGIA & SERVIÇOS TÉCNICOS</span>
        <h2 class="cover-headline">PROPOSTA<br><span>COMERCIAL</span></h2>
        <div class="cover-meta">
          <p><b>Cliente: </b><span>${escapeHtml(data.clientName || 'Nome do cliente')}</span></p>
          <p><b>Proposta: </b><span>${escapeHtml(data.proposalNumber || 'CR-2026-001')}</span></p>
          <p><b>Data de Emissão: </b><span>${formattedIssueDate}</span></p>
          <p><b>Validade: </b><span>${data.validity || 7} dias</span></p>
          ${data.seller ? `<p><b>Consultor: </b><span>${escapeHtml(data.seller)}</span></p>` : ''}
        </div>
      </div>
      <div class="cover-road-lines"></div>
      <footer class="cover-footer">
        ${coverFooterText}
      </footer>
    </article>

    ${isCompact ? `
    <!-- PÁGINA 2: PROPOSTA ENXUTA (ORÇAMENTO, APRESENTAÇÃO, CONDIÇÕES E ACEITE) -->
    <article class="page">
      <header class="page-header">
        ${logoMarkup}
        <div style="text-align:right;">
          <span style="font-weight:700; color:#7fd4f4; display:block; font-size:11px;">PROPOSTA COMERCIAL ENXUTA</span>
          <span style="font-size:9.5px; color:#cbd5e1; font-family:monospace;">Nº ${escapeHtml(data.proposalNumber || 'CR-2026-001')} &bull; ${formattedIssueDate}</span>
        </div>
      </header>
      <div class="page-body compact-body">
        <!-- 1. Dados do Cliente -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(57,169,214,0.3); padding-bottom:1mm; margin-bottom:1.5mm;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="section-no">01</span>
              <h2 style="font-size:12px; font-weight:900; color:var(--navy); margin:0; text-transform:uppercase;">APRESENTAÇÃO & DADOS DO CLIENTE</h2>
            </div>
            <span style="font-size:9.5px; color:#64748b; font-weight:600;">Validade: <b>${data.validity || 7} dias</b></span>
          </div>

          <div class="compact-client-grid">
            <div class="data-box">
              <span class="lbl">Cliente / Razão Social</span>
              <span class="val">${escapeHtml(data.clientName || '—')}</span>
            </div>
            <div class="data-box">
              <span class="lbl">CPF / CNPJ & Contato</span>
              <span class="val">${escapeHtml(data.clientDocument || '—')} &bull; ${escapeHtml(data.clientPhone || '—')}</span>
            </div>
            <div class="data-box">
              <span class="lbl">Endereço da Instalação</span>
              <span class="val">${escapeHtml(data.clientAddress || '—')}</span>
            </div>
          </div>
        </div>

        <!-- 2. Orçamento de Equipamentos & Serviços -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1mm;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="section-no">02</span>
              <h2 style="font-size:12px; font-weight:900; color:var(--navy); margin:0; text-transform:uppercase;">ORÇAMENTO DE EQUIPAMENTOS & SERVIÇOS</h2>
            </div>
            <span style="font-size:9px; color:#64748b; font-weight:600;">${data.items.length} ${data.items.length === 1 ? 'item' : 'itens'}</span>
          </div>

          <div class="table-container compact-table">
            <table>
              <thead>
                <tr>
                  <th style="width:56%;">Item / Descrição Técnica</th>
                  <th style="width:10%; text-align:center;">Qtd.</th>
                  <th style="width:17%; text-align:right;">Unitário</th>
                  <th style="width:17%; text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
          </div>

          <div class="total-banner compact-total">
            <div>
              <span class="total-lbl">Investimento Total da Proposta</span>
              <span class="total-sub">Equipamentos, materiais e mão de obra especializada inclusos</span>
            </div>
            <strong style="font-size:17px;">${formattedGrandTotal}</strong>
          </div>
        </div>

        <!-- 3. Condições Comerciais -->
        <div>
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:1mm;">
            <span class="section-no">03</span>
            <h2 style="font-size:11.5px; font-weight:900; color:var(--blue); margin:0; text-transform:uppercase;">CONDIÇÕES COMERCIAIS</h2>
          </div>
          <div class="conditions-grid compact-grid">
            <div class="cond-box">
              <b>Forma de Pagamento</b>
              <p>${escapeHtml(data.paymentTerms || '—')}</p>
            </div>
            <div class="cond-box">
              <b>Prazo de Atendimento / Entrega</b>
              <p>${escapeHtml(data.deliveryTime || '—')}</p>
            </div>
            <div class="cond-box">
              <b>Garantia</b>
              <p>${escapeHtml(data.warranty || '—')}</p>
            </div>
            <div class="cond-box">
              <b>Observações</b>
              <p>${escapeHtml(data.notes || '—')}</p>
            </div>
          </div>
        </div>

        <!-- 4. Aceite & Assinaturas -->
        <div>
          <p class="compact-accept-stmt">
            Declaro estar de pleno acordo com as especificações, prazos, valores e condições comerciais apresentados nesta proposta comercial.
          </p>
          <div class="signatures-grid compact-sig">
            <div>
              <div class="sig-line"></div>
              <span class="sig-name">${escapeHtml(data.clientName || 'Cliente')}</span>
              <span class="sig-role">Assinatura do Cliente / De Acordo</span>
            </div>
            <div>
              <div class="sig-line"></div>
              <span class="sig-name">${escapeHtml(data.seller || footerText)}</span>
              <span class="sig-role">Responsável Comercial &bull; ${footerText}</span>
            </div>
          </div>
        </div>
      </div>
      <footer class="page-footer">
        <span>${footerText}</span>
        <span>${escapeHtml(data.proposalNumber || 'CR-2026-001')}</span>
      </footer>
    </article>
    ` : `
    <!-- PÁGINA 2: APRESENTAÇÃO -->
    <article class="page">
      <header class="page-header">
        ${logoMarkup}
        <span style="font-weight:700; color:#7fd4f4;">PROPOSTA COMERCIAL</span>
      </header>
      <div class="page-body">
        <span class="section-no">01</span>
        <h2 class="section-title">APRESENTAÇÃO</h2>
        <p class="section-lead">Uma proposta preparada para atender sua operação com máxima eficiência energética, segurança técnica e total transparência.</p>
        
        <div class="intro-card">
          <h3>Olá, <span>${escapeHtml(data.clientName || 'Cliente')}</span>.</h3>
          <p>Apresentamos as condições técnicas e comerciais para o fornecimento dos equipamentos e soluções descritos nesta proposta. Nosso compromisso é entregar uma solução completa e de alto desempenho, assegurando suporte próximo e especializado em todas as etapas do projeto.</p>
        </div>

        <h3 class="subhead-title">DADOS DO CLIENTE</h3>
        <div class="client-data-grid">
          <div class="data-box">
            <span class="lbl">Nome / Razão Social</span>
            <span class="val">${escapeHtml(data.clientName || '—')}</span>
          </div>
          <div class="data-box">
            <span class="lbl">CPF / CNPJ</span>
            <span class="val">${escapeHtml(data.clientDocument || '—')}</span>
          </div>
          <div class="data-box">
            <span class="lbl">Telefone / WhatsApp</span>
            <span class="val">${escapeHtml(data.clientPhone || '—')}</span>
          </div>
          <div class="data-box">
            <span class="lbl">E-mail</span>
            <span class="val">${escapeHtml(data.clientEmail || '—')}</span>
          </div>
          <div class="data-box wide">
            <span class="lbl">Endereço da Instalação</span>
            <span class="val">${escapeHtml(data.clientAddress || '—')}</span>
          </div>
        </div>

        <div class="pillars-grid">
          <div class="pillar">
            <b>AGILIDADE</b>
            <span>Resposta rápida, dimensionamento preciso e processo objetivo.</span>
          </div>
          <div class="pillar">
            <b>SEGURANÇA</b>
            <span>Equipamentos Tier 1 certificados e garantias de fábrica sólidas.</span>
          </div>
          <div class="pillar">
            <b>PARCERIA</b>
            <span>Atendimento de excelência do projeto à homologação e pós-venda.</span>
          </div>
        </div>
      </div>
      <footer class="page-footer">
        <span>${footerText}</span>
        <span>${escapeHtml(data.proposalNumber || 'CR-2026-001')}</span>
      </footer>
    </article>

    <!-- PÁGINA 3: EQUIPAMENTOS -->
    <article class="page">
      <header class="page-header">
        ${logoMarkup}
        <span style="font-weight:700; color:#7fd4f4;">PROPOSTA COMERCIAL</span>
      </header>
      <div class="page-body">
        <span class="section-no">02</span>
        <h2 class="section-title">EQUIPAMENTOS & SERVIÇOS</h2>
        <p class="section-lead">Itens e especificações técnicas selecionados para esta proposta comercial.</p>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width:54%;">Equipamento / Descrição</th>
                <th style="width:12%; text-align:center;">Qtd.</th>
                <th style="width:17%; text-align:right;">Valor Unit.</th>
                <th style="width:17%; text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
        </div>

        <div class="total-banner">
          <div>
            <span class="total-lbl">Investimento Total</span>
            <span class="total-sub">Equipamentos, materiais e serviços inclusos</span>
          </div>
          <strong>${formattedGrandTotal}</strong>
        </div>

        <h3 class="subhead-title">CONDIÇÕES COMERCIAIS</h3>
        <div class="conditions-grid">
          <div class="cond-box">
            <b>Forma de Pagamento</b>
            <p>${escapeHtml(data.paymentTerms || '—')}</p>
          </div>
          <div class="cond-box">
            <b>Prazo de Entrega</b>
            <p>${escapeHtml(data.deliveryTime || '—')}</p>
          </div>
          <div class="cond-box">
            <b>Garantia</b>
            <p>${escapeHtml(data.warranty || '—')}</p>
          </div>
          <div class="cond-box">
            <b>Observações</b>
            <p>${escapeHtml(data.notes || '—')}</p>
          </div>
        </div>
      </div>
      <footer class="page-footer">
        <span>${footerText}</span>
        <span>${escapeHtml(data.proposalNumber || 'CR-2026-001')}</span>
      </footer>
    </article>

    <!-- PÁGINA 4: ACEITE -->
    <article class="page">
      <header class="page-header">
        ${logoMarkup}
        <span style="font-weight:700; color:#7fd4f4;">PROPOSTA COMERCIAL</span>
      </header>
      <div class="page-body">
        <span class="section-no">03</span>
        <h2 class="section-title">ACEITE DA PROPOSTA</h2>
        <p class="section-lead">Esta proposta é válida por <b>${data.validity || 7} dias</b> a partir de <b>${formattedIssueDate}</b>.</p>

        <div class="accept-hero">
          <span class="sub">Valor Total da Proposta</span>
          <strong>${formattedGrandTotal}</strong>
          <small><b>Condição: </b>${escapeHtml(data.paymentTerms)}</small>
        </div>

        <p class="accept-statement">
          Declaro estar de pleno acordo com os equipamentos, especificações, prazos, valores e condições comerciais apresentados nesta proposta comercial.
        </p>

        <div class="signatures-grid">
          <div>
            <div class="sig-line"></div>
            <span class="sig-name">${escapeHtml(data.clientName || 'Cliente')}</span>
            <span class="sig-role">Assinatura do Cliente</span>
          </div>
          <div>
            <div class="sig-line"></div>
            <span class="sig-name">${escapeHtml(data.seller || footerText)}</span>
            <span class="sig-role">${footerText}</span>
          </div>
        </div>

        <div class="closing-text">
          <h3>Obrigado pela confiança.</h3>
          <p>Estamos prontos para levar sustentabilidade e economia para a sua operação.</p>
        </div>
      </div>
      <footer class="page-footer">
        <span>${footerText}</span>
        <span>${escapeHtml(data.proposalNumber || 'CR-2026-001')}</span>
      </footer>
    </article>
    `}
  </div>
</body>
</html>`;
}

function escapeHtml(str: string = ''): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Prints the proposal cleanly using an isolated hidden iframe.
 * Avoids any iframe/screen layout bleed from the host web app.
 */
export function printCleanProposal(data: ProposalData): void {
  const htmlContent = buildProposalHtml(data);

  const iframeId = 'ciavolt-print-iframe';
  let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-9999';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    openProposalNewTab(data);
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    try {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch (err) {
      console.warn('Iframe print blocked, opening in new tab fallback', err);
      openProposalNewTab(data);
    }
  }, 400);
}

/**
 * Opens a pristine document window containing strictly the proposal.
 */
export function openProposalNewTab(data: ProposalData): void {
  const htmlContent = buildProposalHtml(data);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const newWin = window.open(url, '_blank');
  if (!newWin) {
    alert('Por favor permita pop-ups no navegador para abrir a proposta comercial para impressão.');
  }
}
