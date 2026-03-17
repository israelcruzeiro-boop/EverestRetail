import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sectionTitle = "text-[18px] md:text-[20px] font-black text-[#0B1220] uppercase tracking-tight mt-10 mb-3";
  const subTitle = "text-[15px] md:text-[16px] font-bold text-[#0B1220] mt-6 mb-2";
  const paragraph = "text-[13px] md:text-[14px] text-slate-700 leading-relaxed mb-3";
  const listItem = "text-[13px] md:text-[14px] text-slate-700 leading-relaxed ml-4 mb-1.5";

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-20 text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 md:pt-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Documento Legal</p>
          <h1 className="text-[28px] md:text-[36px] font-black text-[#0B1220] leading-[1.1] tracking-tight uppercase">
            Política de Privacidade
          </h1>
          <div className="w-16 h-1 bg-red-600 mt-4"></div>
          <p className="text-[12px] text-slate-400 mt-4 font-bold">Última atualização: Março de 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-10 shadow-sm">

          {/* 1. Introdução */}
          <h2 className={sectionTitle}>1. Introdução</h2>
          <p className={paragraph}>
            A presente Política de Privacidade tem como objetivo informar aos usuários, clientes e demais titulares de dados pessoais sobre as práticas adotadas pela <strong>EMPRESAS NO TOPO LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº <strong>41.569.441/0001-96</strong>, com nome comercial <strong>Everest Retail</strong>, com sede na Conjunto 5 - Setor Habitacional Arniqueira, Brasília - DF, CEP: 71995-297, no que diz respeito à coleta, uso, armazenamento, tratamento e proteção dos dados pessoais fornecidos por meio da plataforma Everest Retail e seus serviços correlatos.
          </p>
          <p className={paragraph}>
            Esta Política foi elaborada em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD)</strong>, o <strong>Marco Civil da Internet (Lei nº 12.965/2014)</strong>, o <strong>Regulamento da UE nº 2016/679 (GDPR)</strong> — quando aplicável — e demais normas regulamentares pertinentes, garantindo a transparência, a segurança e a privacidade dos dados dos titulares.
          </p>
          <p className={paragraph}>
            Ao utilizar a plataforma Everest Retail, o titular declara ter lido, compreendido e concordado com os termos desta Política de Privacidade.
          </p>

          {/* 2. Informações Gerais e Compromisso */}
          <h2 className={sectionTitle}>2. Informações Gerais e Compromisso</h2>
          <p className={paragraph}>
            A Everest Retail é uma plataforma SaaS (Software as a Service) voltada para o setor de varejo, que oferece soluções integradas de gestão, reputação digital, inteligência de dados e automação baseada em inteligência artificial.
          </p>
          <p className={paragraph}>
            Comprometemo-nos a proteger a privacidade e a segurança das informações pessoais coletadas, tratando-as exclusivamente para finalidades legítimas, específicas e informadas ao titular. A Everest Retail adota medidas técnicas e organizacionais adequadas para garantir a proteção dos dados contra acessos não autorizados, situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão.
          </p>

          {/* 3. Dados Coletados */}
          <h2 className={sectionTitle}>3. Dados Pessoais Coletados</h2>

          <h3 className={subTitle}>3.1 Dados de Clientes (Empresas Contratantes)</h3>
          <p className={paragraph}>No ato da contratação e durante a vigência do serviço, poderemos coletar:</p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Razão social, CNPJ e inscrição estadual/municipal;</li>
            <li className={listItem}>Nome completo do(s) representante(s) legal(is);</li>
            <li className={listItem}>Endereço comercial completo;</li>
            <li className={listItem}>Endereço de e-mail corporativo e telefone;</li>
            <li className={listItem}>Dados bancários e informações de faturamento;</li>
            <li className={listItem}>Dados de acesso à plataforma (login e credenciais criptografadas);</li>
            <li className={listItem}>Dados de integrações com plataformas de terceiros (Google Business Profile, sistemas ERP, entre outros).</li>
          </ul>

          <h3 className={subTitle}>3.2 Dados de Usuários Finais (Consumidores)</h3>
          <p className={paragraph}>Os dados de usuários finais podem ser coletados direta ou indiretamente por meio de integrações e formulários:</p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Nome completo;</li>
            <li className={listItem}>Endereço de e-mail e telefone de contato;</li>
            <li className={listItem}>CPF (quando necessário para validação de identidade);</li>
            <li className={listItem}>Dados de navegação, geolocalização e dispositivo;</li>
            <li className={listItem}>Respostas a pesquisas de satisfação (NPS, CSAT, CES);</li>
            <li className={listItem}>Avaliações, comentários e feedbacks públicos;</li>
            <li className={listItem}>Histórico de interações e engajamento com conteúdos na plataforma.</li>
          </ul>

          {/* 4. Integração com Google Business Profile */}
          <h2 className={sectionTitle}>4. Integração com Google Meu Negócio (Google Business Profile)</h2>
          <p className={paragraph}>
            A Everest Retail pode integrar-se ao Google Business Profile para auxiliar os clientes na gestão de sua reputação digital. No contexto dessa integração, poderemos acessar e tratar:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Avaliações (reviews) e respostas publicadas no perfil do Google;</li>
            <li className={listItem}>Dados de desempenho do perfil empresarial (visualizações, cliques, solicitações de rota);</li>
            <li className={listItem}>Informações do perfil comercial cadastrado no Google;</li>
            <li className={listItem}>Dados de interação e engajamento dos consumidores com o perfil.</li>
          </ul>
          <p className={paragraph}>
            Esses dados são tratados com a exclusiva finalidade de prover insights analíticos, dashboards de reputação e relatórios estratégicos para os clientes contratantes. A Everest Retail <strong>não compartilha, vende ou comercializa</strong> esses dados com terceiros não autorizados.
          </p>

          {/* 5. Dados de NPS, Avaliações e Comportamento */}
          <h2 className={sectionTitle}>5. Dados de NPS, Avaliações e Comportamento</h2>
          <p className={paragraph}>
            A plataforma Everest Retail coleta e processa dados relativos a pesquisas de Net Promoter Score (NPS), índices de satisfação (CSAT), esforço do cliente (CES), avaliações em plataformas públicas e dados comportamentais do usuário final. Esses dados são utilizados para:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Geração de relatórios e dashboards analíticos de desempenho;</li>
            <li className={listItem}>Alimentação de modelos de inteligência artificial para recomendações personalizadas;</li>
            <li className={listItem}>Identificação de padrões de comportamento e tendências de mercado;</li>
            <li className={listItem}>Classificação e segmentação de consumidores por perfil de engajamento;</li>
            <li className={listItem}>Acionamento de fluxos automatizados de comunicação e recuperação de clientes.</li>
          </ul>
          <p className={paragraph}>
            Os dados comportamentais são tratados de forma agregada e anonimizada sempre que possível, preservando a identidade individual dos titulares em conformidade com o princípio da minimização previsto na LGPD.
          </p>

          {/* 6. Dados de Navegação e Cookies */}
          <h2 className={sectionTitle}>6. Dados de Navegação e Cookies</h2>
          <p className={paragraph}>
            Ao acessar a plataforma Everest Retail, coletamos automaticamente determinados dados técnicos de navegação:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Endereço IP (Internet Protocol);</li>
            <li className={listItem}>Tipo e versão do navegador utilizado;</li>
            <li className={listItem}>Sistema operacional e tipo de dispositivo;</li>
            <li className={listItem}>Páginas acessadas, tempo de permanência e fluxo de navegação;</li>
            <li className={listItem}>Dados de geolocalização aproximada (baseada em IP);</li>
            <li className={listItem}>URL de origem (referrer) e termos de busca utilizados.</li>
          </ul>
          <p className={paragraph}>
            Esses dados são coletados por meio de cookies, pixels de rastreamento, tags analíticas e tecnologias similares, com o propósito de melhorar a experiência do usuário, personalizar conteúdos e garantir o funcionamento adequado da plataforma.
          </p>

          {/* 7. Finalidade do Tratamento */}
          <h2 className={sectionTitle}>7. Finalidade do Tratamento de Dados</h2>
          <p className={paragraph}>Os dados pessoais coletados pela Everest Retail são tratados para as seguintes finalidades:</p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}><strong>Prestação de serviços:</strong> execução do contrato de prestação de serviços SaaS e funcionalidades contratadas;</li>
            <li className={listItem}><strong>Gestão de conta:</strong> criação, autenticação e manutenção de contas de usuários e administradores;</li>
            <li className={listItem}><strong>Comunicação:</strong> envio de notificações transacionais, alertas de sistema, comunicados de atualização e newsletters (quando consentido);</li>
            <li className={listItem}><strong>Análise e melhoria:</strong> aprimoramento contínuo da plataforma, desenvolvimento de novas funcionalidades e análise de desempenho;</li>
            <li className={listItem}><strong>Inteligência artificial:</strong> treinamento e operação de modelos de IA para geração de insights, recomendações e automações;</li>
            <li className={listItem}><strong>Obrigações legais:</strong> cumprimento de obrigações fiscais, contábeis e regulatórias aplicáveis;</li>
            <li className={listItem}><strong>Segurança:</strong> detecção e prevenção de fraudes, acessos não autorizados e atividades suspeitas;</li>
            <li className={listItem}><strong>Marketing:</strong> campanhas de marketing direto e remarketing, exclusivamente mediante consentimento prévio do titular.</li>
          </ul>

          {/* 8. Base Legal */}
          <h2 className={sectionTitle}>8. Base Legal para o Tratamento (LGPD)</h2>
          <p className={paragraph}>O tratamento de dados pessoais pela Everest Retail fundamenta-se nas seguintes bases legais previstas no art. 7º da LGPD:</p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}><strong>Consentimento do titular (art. 7º, I):</strong> para coleta de dados em formulários, pesquisas e ações de marketing;</li>
            <li className={listItem}><strong>Execução de contrato (art. 7º, V):</strong> para a prestação dos serviços contratados pela plataforma;</li>
            <li className={listItem}><strong>Legítimo interesse (art. 7º, IX):</strong> para análises internas, melhorias de produto e personalização de experiência, sempre respeitando os direitos e liberdades do titular;</li>
            <li className={listItem}><strong>Cumprimento de obrigação legal (art. 7º, II):</strong> para atender exigências legais, fiscais e regulatórias;</li>
            <li className={listItem}><strong>Proteção ao crédito (art. 7º, X):</strong> quando aplicável em operações financeiras e de faturamento.</li>
          </ul>

          {/* 9. Segurança dos Dados */}
          <h2 className={sectionTitle}>9. Segurança dos Dados</h2>
          <p className={paragraph}>
            A Everest Retail adota medidas técnicas e administrativas robustas para proteger os dados pessoais, incluindo:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Criptografia de dados em trânsito (TLS/SSL) e em repouso (AES-256);</li>
            <li className={listItem}>Autenticação multifator (MFA) para acesso a áreas administrativas;</li>
            <li className={listItem}>Controle de acesso granular baseado em perfis e permissões (RBAC);</li>
            <li className={listItem}>Monitoramento contínuo de atividades suspeitas e logs de auditoria;</li>
            <li className={listItem}>Backups automatizados com redundância geográfica;</li>
            <li className={listItem}>Testes periódicos de segurança e avaliações de vulnerabilidade;</li>
            <li className={listItem}>Políticas internas de segurança da informação e treinamento periódico de colaboradores;</li>
            <li className={listItem}>Infraestrutura hospedada em provedores de nuvem com certificações de segurança reconhecidas internacionalmente (ISO 27001, SOC 2).</li>
          </ul>
          <p className={paragraph}>
            Embora a Everest Retail empregue os melhores esforços e práticas de mercado para proteger os dados, nenhum sistema de segurança é absolutamente infalível. Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, a Everest Retail comunicará os afetados e a Autoridade Nacional de Proteção de Dados (ANPD) conforme exigido pela legislação vigente.
          </p>

          {/* 10. Compartilhamento de Dados */}
          <h2 className={sectionTitle}>10. Compartilhamento de Dados</h2>
          <p className={paragraph}>
            A Everest Retail poderá compartilhar dados pessoais com terceiros nas seguintes hipóteses:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}><strong>Prestadores de serviço e parceiros tecnológicos:</strong> empresas contratadas para suporte à operação, como provedores de hospedagem em nuvem, serviços de e-mail transacional, gateways de pagamento e ferramentas de analytics — sempre mediante obrigações contratuais de confidencialidade e conformidade com a LGPD;</li>
            <li className={listItem}><strong>Integrações autorizadas pelo cliente:</strong> plataformas de terceiros com as quais o cliente optou por integrar seus dados (ex.: Google Business Profile, sistemas ERP, CRMs);</li>
            <li className={listItem}><strong>Obrigações legais e regulatórias:</strong> quando exigido por lei, decisão judicial, requisição de autoridade competente ou para a proteção de direitos da Everest Retail;</li>
            <li className={listItem}><strong>Operações societárias:</strong> no contexto de fusões, aquisições, reorganizações ou alienação de ativos, respeitados os direitos dos titulares.</li>
          </ul>
          <p className={paragraph}>
            A Everest Retail <strong>não comercializa, aluga ou cede dados pessoais</strong> a terceiros para finalidades de marketing ou publicidade sem o consentimento expresso do titular.
          </p>

          {/* 11. Direitos dos Titulares */}
          <h2 className={sectionTitle}>11. Direitos dos Titulares</h2>
          <p className={paragraph}>
            Nos termos do art. 18 da LGPD, o titular dos dados pessoais tem o direito de, a qualquer momento, solicitar:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}><strong>Confirmação</strong> da existência de tratamento de dados pessoais;</li>
            <li className={listItem}><strong>Acesso</strong> aos dados pessoais tratados;</li>
            <li className={listItem}><strong>Correção</strong> de dados incompletos, inexatos ou desatualizados;</li>
            <li className={listItem}><strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários, excessivos ou tratados em desconformidade;</li>
            <li className={listItem}><strong>Portabilidade</strong> dos dados a outro fornecedor de serviço ou produto;</li>
            <li className={listItem}><strong>Eliminação</strong> dos dados pessoais tratados com base no consentimento;</li>
            <li className={listItem}><strong>Informação</strong> sobre entidades públicas e privadas com as quais os dados foram compartilhados;</li>
            <li className={listItem}><strong>Informação</strong> sobre a possibilidade de não fornecer consentimento e as consequências da negativa;</li>
            <li className={listItem}><strong>Revogação</strong> do consentimento a qualquer tempo.</li>
          </ul>
          <p className={paragraph}>
            Para exercer qualquer dos direitos acima, o titular poderá entrar em contato por meio do e-mail <strong>suporte@everestretail.com.br</strong>, identificando-se devidamente. As solicitações serão respondidas no prazo de até 15 (quinze) dias úteis, conforme previsto na legislação. A Everest Retail poderá solicitar informações complementares para validar a identidade do solicitante.
          </p>

          {/* 12. Retenção de Dados */}
          <h2 className={sectionTitle}>12. Retenção de Dados</h2>
          <p className={paragraph}>
            Os dados pessoais serão mantidos pela Everest Retail pelo período necessário ao cumprimento das finalidades para as quais foram coletados, incluindo:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Durante a vigência do contrato de prestação de serviços;</li>
            <li className={listItem}>Pelo prazo necessário ao cumprimento de obrigações legais, regulatórias e fiscais;</li>
            <li className={listItem}>Para o exercício regular de direitos em processos judiciais, administrativos ou arbitrais;</li>
            <li className={listItem}>Enquanto houver legítimo interesse da Everest Retail, observados os direitos do titular.</li>
          </ul>
          <p className={paragraph}>
            Após o encerramento do período de retenção, os dados serão anonimizados de forma irreversível ou eliminados de forma segura, salvo disposição legal em contrário.
          </p>

          {/* 13. Cookies */}
          <h2 className={sectionTitle}>13. Política de Cookies</h2>
          <p className={paragraph}>A Everest Retail utiliza cookies e tecnologias similares classificados conforme abaixo:</p>

          <h3 className={subTitle}>13.1 Cookies Estritamente Necessários</h3>
          <p className={paragraph}>
            Essenciais para o funcionamento da plataforma, incluindo autenticação, segurança e preferências de sessão. Não podem ser desativados.
          </p>

          <h3 className={subTitle}>13.2 Cookies de Desempenho e Análise</h3>
          <p className={paragraph}>
            Utilizados para coleta de dados analíticos (ex.: Google Analytics), permitindo identificar padrões de uso e aprimorar a experiência. Podem ser gerenciados pelo titular.
          </p>

          <h3 className={subTitle}>13.3 Cookies de Funcionalidade</h3>
          <p className={paragraph}>
            Permitem lembrar preferências do usuário (idioma, região, configurações de exibição) para personalizar a interface.
          </p>

          <h3 className={subTitle}>13.4 Cookies de Marketing e Publicidade</h3>
          <p className={paragraph}>
            Utilizados para exibição de anúncios personalizados e remarketing. Só são ativados mediante consentimento expresso do titular.
          </p>
          <p className={paragraph}>
            O titular pode gerenciar suas preferências de cookies a qualquer momento por meio das configurações do navegador ou do painel de consentimento disponível na plataforma.
          </p>

          {/* 14. Alterações */}
          <h2 className={sectionTitle}>14. Alterações desta Política</h2>
          <p className={paragraph}>
            A Everest Retail reserva-se o direito de alterar, modificar ou atualizar esta Política de Privacidade a qualquer momento, visando sua adequação a novas legislações, regulamentações, diretivas ou práticas de mercado. Eventuais alterações substanciais serão comunicadas aos usuários por meio de notificação na plataforma ou por e-mail.
          </p>
          <p className={paragraph}>
            A continuidade do uso da plataforma após a publicação de alterações será interpretada como aceite tácito da nova versão desta Política.
          </p>

          {/* 15. Contato */}
          <h2 className={sectionTitle}>15. Contato e Encarregado de Dados (DPO)</h2>
          <p className={paragraph}>
            Para dúvidas, solicitações ou exercício de direitos relativos a esta Política de Privacidade e à proteção de dados pessoais, o titular poderá entrar em contato por meio dos seguintes canais:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mt-3 mb-6">
            <div className="space-y-2">
              <p className="text-[13px] text-slate-700"><strong>Controlador:</strong> EMPRESAS NO TOPO LTDA</p>
              <p className="text-[13px] text-slate-700"><strong>CNPJ:</strong> 41.569.441/0001-96</p>
              <p className="text-[13px] text-slate-700"><strong>Nome Comercial:</strong> Everest Retail</p>
              <p className="text-[13px] text-slate-700"><strong>Endereço:</strong> Conjunto 5 - Setor Habitacional Arniqueira, Brasília - DF, CEP: 71995-297</p>
              <p className="text-[13px] text-slate-700"><strong>E-mail:</strong>{' '}
                <a href="mailto:suporte@everestretail.com.br" className="text-blue-600 hover:underline">suporte@everestretail.com.br</a>
              </p>
              <p className="text-[13px] text-slate-700"><strong>Website:</strong>{' '}
                <a href="https://www.everestretail.com.br" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.everestretail.com.br</a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-6 mt-8">
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              © {new Date().getFullYear()} Everest Retail — EMPRESAS NO TOPO LTDA. Todos os direitos reservados.<br />
              Este documento constitui instrumento vinculante entre as partes e integra os Termos de Uso da plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
