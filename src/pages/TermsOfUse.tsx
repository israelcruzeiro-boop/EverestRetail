import { useEffect } from 'react';

export default function TermsOfUse() {
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
            Termos de Uso
          </h1>
          <div className="w-16 h-1 bg-red-600 mt-4"></div>
          <p className="text-[12px] text-slate-400 mt-4 font-bold">Última atualização: Março de 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-10 shadow-sm">

          {/* Preâmbulo */}
          <p className={paragraph}>
            O presente instrumento contratual regula as condições gerais de uso da plataforma <strong>Everest Retail</strong>, doravante denominada simplesmente "Plataforma", disponibilizada na modalidade SaaS (Software as a Service) pela <strong>EMPRESAS NO TOPO LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº <strong>41.569.441/0001-96</strong>, com sede na Conjunto 5 - Setor Habitacional Arniqueira, Brasília - DF, CEP: 71995-297, doravante denominada "CONTRATADA" ou "Everest Retail".
          </p>
          <p className={paragraph}>
            O presente documento, em conjunto com a Política de Privacidade, constitui o acordo integral entre as partes e estabelece os termos e condições aplicáveis ao acesso e utilização da Plataforma pelo CONTRATANTE.
          </p>

          {/* 1. Identificação das Partes */}
          <h2 className={sectionTitle}>Cláusula 1ª — Identificação das Partes</h2>
          <p className={paragraph}>
            <strong>1.1.</strong> Para fins deste contrato, consideram-se partes:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}><strong>CONTRATADA:</strong> EMPRESAS NO TOPO LTDA, inscrita no CNPJ sob o nº 41.569.441/0001-96, com nome comercial Everest Retail, com sede na Conjunto 5 - Setor Habitacional Arniqueira, Brasília - DF, CEP: 71995-297;</li>
            <li className={listItem}><strong>CONTRATANTE:</strong> toda e qualquer pessoa física ou jurídica que acesse, cadastre-se ou utilize a Plataforma Everest Retail e seus serviços, mediante aceite eletrônico dos presentes Termos de Uso.</li>
          </ul>
          <p className={paragraph}>
            <strong>1.2.</strong> Os termos "Usuário", "Cliente" e "Contratante" são utilizados de forma intercambiável neste documento para referir-se à parte que utiliza os serviços da Plataforma.
          </p>

          {/* 2. Aceite Eletrônico */}
          <h2 className={sectionTitle}>Cláusula 2ª — Aceite Eletrônico e Validade Jurídica</h2>
          <p className={paragraph}>
            <strong>2.1.</strong> O aceite dos presentes Termos de Uso ocorre de forma eletrônica, por meio do clique no botão "Aceito", "Concordo", "Criar Conta" ou equivalente, no momento do cadastro ou primeiro acesso à Plataforma, ou ainda pela simples utilização dos serviços.
          </p>
          <p className={paragraph}>
            <strong>2.2.</strong> O aceite eletrônico possui plena validade jurídica nos termos do art. 107 do Código Civil Brasileiro, da Medida Provisória nº 2.200-2/2001 e do Marco Civil da Internet (Lei nº 12.965/2014), sendo considerado instrumento válido, eficaz e vinculante entre as partes.
          </p>
          <p className={paragraph}>
            <strong>2.3.</strong> Ao utilizar a Plataforma, o CONTRATANTE declara ter lido integralmente estes Termos de Uso e a Política de Privacidade, compreendendo e concordando com todas as disposições aqui estabelecidas.
          </p>
          <p className={paragraph}>
            <strong>2.4.</strong> Caso o CONTRATANTE não concorde com qualquer disposição destes Termos, deverá cessar imediatamente o uso da Plataforma.
          </p>

          {/* 3. Objeto do Contrato */}
          <h2 className={sectionTitle}>Cláusula 3ª — Objeto do Contrato</h2>
          <p className={paragraph}>
            <strong>3.1.</strong> O presente instrumento tem por objeto a prestação de serviços de tecnologia pela CONTRATADA ao CONTRATANTE, por meio da Plataforma Everest Retail, na modalidade SaaS (Software as a Service), contemplando soluções integradas de gestão, análise de dados, inteligência artificial e automação para o setor de varejo.
          </p>
          <p className={paragraph}>
            <strong>3.2.</strong> A CONTRATADA concede ao CONTRATANTE uma licença de uso não exclusiva, intransferível e revogável da Plataforma, limitada ao plano contratado e às funcionalidades correspondentes, pelo período de vigência da contratação.
          </p>

          {/* 4. Descrição dos Serviços */}
          <h2 className={sectionTitle}>Cláusula 4ª — Descrição dos Serviços</h2>
          <p className={paragraph}>
            <strong>4.1.</strong> A Plataforma Everest Retail disponibiliza, conforme o plano contratado, os seguintes módulos e funcionalidades:
          </p>

          <h3 className={subTitle}>4.1.1 Gestão de Dados de Varejo</h3>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Centralização e organização de dados operacionais, comerciais e estratégicos do varejo;</li>
            <li className={listItem}>Análise e cruzamento de informações de vendas, estoque, operação e performance;</li>
            <li className={listItem}>Geração de relatórios personalizados e exportação de dados em formatos padrão de mercado.</li>
          </ul>

          <h3 className={subTitle}>4.1.2 Pesquisas de Satisfação (NPS, CSAT, CES)</h3>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Criação, envio e gestão de pesquisas de Net Promoter Score (NPS), Customer Satisfaction (CSAT) e Customer Effort Score (CES);</li>
            <li className={listItem}>Coleta automatizada de respostas via múltiplos canais (e-mail, SMS, WhatsApp, QR Code);</li>
            <li className={listItem}>Classificação e segmentação automática de respondentes (Promotores, Neutros e Detratores).</li>
          </ul>

          <h3 className={subTitle}>4.1.3 Dashboards e Painéis Analíticos</h3>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Painéis interativos em tempo real com indicadores de desempenho (KPIs) do varejo;</li>
            <li className={listItem}>Visualizações customizáveis de dados de vendas, reputação, engajamento e operação;</li>
            <li className={listItem}>Análises comparativas, históricas e preditivas para tomada de decisão.</li>
          </ul>

          <h3 className={subTitle}>4.1.4 Inteligência Artificial e Automação</h3>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Modelos de IA para recomendações personalizadas e detecção de padrões de comportamento;</li>
            <li className={listItem}>Automação de fluxos operacionais, comunicação e recuperação de clientes;</li>
            <li className={listItem}>Análise preditiva de tendências de mercado e comportamento do consumidor;</li>
            <li className={listItem}>Processamento de linguagem natural (NLP) para análise de sentimento de avaliações e feedbacks.</li>
          </ul>

          <h3 className={subTitle}>4.1.5 Integrações com Plataformas Externas</h3>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Integração com Google Business Profile (Google Meu Negócio) para gestão de reputação;</li>
            <li className={listItem}>Conexão com sistemas ERP, CRM e plataformas de e-commerce;</li>
            <li className={listItem}>APIs para integração com ferramentas de terceiros conforme documentação técnica disponibilizada.</li>
          </ul>

          <p className={paragraph}>
            <strong>4.2.</strong> A CONTRATADA reserva-se o direito de, a qualquer momento, adicionar, modificar, aprimorar ou descontinuar funcionalidades da Plataforma, mediante notificação prévia ao CONTRATANTE quando tais alterações impactarem significativamente os serviços contratados.
          </p>

          {/* 5. Planos e Funcionalidades */}
          <h2 className={sectionTitle}>Cláusula 5ª — Planos e Funcionalidades</h2>
          <p className={paragraph}>
            <strong>5.1.</strong> A Plataforma Everest Retail é disponibilizada mediante diferentes planos de assinatura, cada qual com um conjunto específico de funcionalidades, limites de uso, quantidade de usuários e capacidade de processamento.
          </p>
          <p className={paragraph}>
            <strong>5.2.</strong> As especificações de cada plano, seus preços e funcionalidades incluídas encontram-se detalhados na página de planos da Plataforma ou em proposta comercial específica enviada ao CONTRATANTE.
          </p>
          <p className={paragraph}>
            <strong>5.3.</strong> O upgrade ou downgrade de plano pode ser solicitado pelo CONTRATANTE a qualquer momento, sendo as diferenças de valor calculadas pro rata temporis e aplicadas no ciclo de faturamento subsequente.
          </p>
          <p className={paragraph}>
            <strong>5.4.</strong> A CONTRATADA poderá disponibilizar períodos de teste gratuito (trial) de determinados planos ou funcionalidades, sem que isso constitua obrigação de manutenção da gratuidade ao término do período.
          </p>

          {/* 6. Preço e Forma de Pagamento */}
          <h2 className={sectionTitle}>Cláusula 6ª — Preço e Forma de Pagamento</h2>
          <p className={paragraph}>
            <strong>6.1.</strong> O CONTRATANTE pagará à CONTRATADA o valor correspondente ao plano contratado, conforme tabela de preços vigente no momento da contratação ou conforme proposta comercial específica.
          </p>
          <p className={paragraph}>
            <strong>6.2.</strong> Os pagamentos serão realizados de forma recorrente (mensal ou anual, conforme o ciclo escolhido), por meio de boleto bancário, cartão de crédito, PIX ou outro meio de pagamento disponibilizado pela Plataforma.
          </p>
          <p className={paragraph}>
            <strong>6.3.</strong> Os preços poderão ser reajustados anualmente, com base no índice IGPM/FGV ou, na sua ausência, pelo IPCA/IBGE, mediante comunicação prévia de 30 (trinta) dias ao CONTRATANTE.
          </p>
          <p className={paragraph}>
            <strong>6.4.</strong> A emissão de nota fiscal será realizada conforme a legislação fiscal aplicável, sendo encaminhada ao e-mail cadastrado pelo CONTRATANTE.
          </p>
          <p className={paragraph}>
            <strong>6.5.</strong> O não pagamento na data de vencimento acarretará a incidência de multa de 2% (dois por cento) sobre o valor em atraso, acrescida de juros moratórios de 1% (um por cento) ao mês, calculados pro rata die, sem prejuízo da suspensão dos serviços conforme previsto na Cláusula 8ª.
          </p>

          {/* 7. Vigência e Cancelamento */}
          <h2 className={sectionTitle}>Cláusula 7ª — Vigência e Cancelamento</h2>
          <p className={paragraph}>
            <strong>7.1.</strong> O presente contrato entra em vigor na data do aceite eletrônico pelo CONTRATANTE e permanecerá vigente por prazo indeterminado, renovando-se automaticamente a cada ciclo de faturamento, salvo manifestação contrária de qualquer das partes.
          </p>
          <p className={paragraph}>
            <strong>7.2.</strong> O cancelamento poderá ser solicitado pelo CONTRATANTE a qualquer momento, mediante notificação escrita (e-mail ou painel da Plataforma), observando-se:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}><strong>Planos mensais:</strong> o cancelamento terá efeito ao final do ciclo mensal vigente, sem gerar direito a reembolso proporcional do período já transcorrido;</li>
            <li className={listItem}><strong>Planos anuais:</strong> o cancelamento terá efeito ao final do ciclo anual vigente. Não haverá reembolso dos valores já pagos, salvo disposição contratual específica.</li>
          </ul>
          <p className={paragraph}>
            <strong>7.3.</strong> A CONTRATADA poderá rescindir o presente contrato de forma imediata e sem aviso prévio em caso de violação grave destes Termos pelo CONTRATANTE, incluindo, sem limitação, uso indevido da Plataforma, práticas fraudulentas ou violação de direitos de terceiros.
          </p>
          <p className={paragraph}>
            <strong>7.4.</strong> Após o cancelamento, os dados do CONTRATANTE serão mantidos por 90 (noventa) dias para fins de exportação, sendo eliminados de forma irreversível após esse período, salvo obrigação legal de retenção.
          </p>

          {/* 8. Suspensão por Inadimplência */}
          <h2 className={sectionTitle}>Cláusula 8ª — Suspensão por Inadimplência</h2>
          <p className={paragraph}>
            <strong>8.1.</strong> O atraso no pagamento por período superior a 10 (dez) dias corridos autoriza a CONTRATADA a suspender o acesso do CONTRATANTE à Plataforma, sem prejuízo da cobrança dos valores devidos e encargos previstos na Cláusula 6.5.
          </p>
          <p className={paragraph}>
            <strong>8.2.</strong> A suspensão será precedida de notificação por e-mail ao endereço cadastrado, com antecedência mínima de 5 (cinco) dias úteis.
          </p>
          <p className={paragraph}>
            <strong>8.3.</strong> A reativação do acesso dar-se-á mediante a regularização integral dos débitos pendentes, incluindo multa e juros.
          </p>
          <p className={paragraph}>
            <strong>8.4.</strong> A inadimplência por período superior a 60 (sessenta) dias corridos autoriza a CONTRATADA a rescindir o contrato de forma unilateral e definitiva, com exclusão dos dados do CONTRATANTE após comunicação prévia de 30 (trinta) dias.
          </p>

          {/* 9. Obrigações da Contratada */}
          <h2 className={sectionTitle}>Cláusula 9ª — Obrigações da Contratada</h2>
          <p className={paragraph}>A CONTRATADA se obriga a:</p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}><strong>a)</strong> Disponibilizar a Plataforma em condições adequadas de funcionamento, promovendo esforços comercialmente razoáveis para manter a disponibilidade de 99,5% (noventa e nove vírgula cinco por cento) ao mês, excluindo-se janelas de manutenção programada;</li>
            <li className={listItem}><strong>b)</strong> Realizar manutenções preventivas e corretivas necessárias, comunicando ao CONTRATANTE eventuais interrupções programadas com antecedência mínima de 24 (vinte e quatro) horas;</li>
            <li className={listItem}><strong>c)</strong> Garantir a segurança e a confidencialidade dos dados armazenados na Plataforma, adotando medidas técnicas e organizacionais adequadas em conformidade com a LGPD;</li>
            <li className={listItem}><strong>d)</strong> Prestar suporte técnico nos canais e horários definidos conforme o plano contratado;</li>
            <li className={listItem}><strong>e)</strong> Não utilizar os dados do CONTRATANTE para finalidades distintas das estabelecidas nestes Termos e na Política de Privacidade;</li>
            <li className={listItem}><strong>f)</strong> Informar tempestivamente o CONTRATANTE sobre eventuais incidentes de segurança que possam afetar seus dados.</li>
          </ul>

          {/* 10. Obrigações do Contratante */}
          <h2 className={sectionTitle}>Cláusula 10ª — Obrigações do Contratante</h2>
          <p className={paragraph}>O CONTRATANTE se obriga a:</p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}><strong>a)</strong> Fornecer informações verdadeiras, completas e atualizadas no momento do cadastro e durante toda a vigência do contrato;</li>
            <li className={listItem}><strong>b)</strong> Manter suas credenciais de acesso (login e senha) em sigilo, sendo responsável por todas as atividades realizadas em sua conta;</li>
            <li className={listItem}><strong>c)</strong> Efetuar os pagamentos pontualmente, nas datas e valores acordados;</li>
            <li className={listItem}><strong>d)</strong> Utilizar a Plataforma exclusivamente para as finalidades compatíveis com o objeto deste contrato e em conformidade com a legislação vigente;</li>
            <li className={listItem}><strong>e)</strong> Não realizar engenharia reversa, descompilação, desmontagem ou qualquer tentativa de obter o código-fonte da Plataforma;</li>
            <li className={listItem}><strong>f)</strong> Não utilizar a Plataforma para atividades ilícitas, difamatórias, abusivas ou que violem direitos de terceiros;</li>
            <li className={listItem}><strong>g)</strong> Comunicar imediatamente a CONTRATADA sobre qualquer uso não autorizado de sua conta ou qualquer violação de segurança de que tenha conhecimento.</li>
          </ul>

          {/* 11. Uso Correto da Plataforma */}
          <h2 className={sectionTitle}>Cláusula 11ª — Uso Correto da Plataforma</h2>
          <p className={paragraph}>
            <strong>11.1.</strong> O CONTRATANTE compromete-se a utilizar a Plataforma de forma ética, legal e em conformidade com as boas práticas de mercado. São expressamente vedadas as seguintes condutas:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Inserir, transmitir ou armazenar conteúdo ilícito, difamatório, obsceno, injurioso ou que viole direitos de propriedade intelectual de terceiros;</li>
            <li className={listItem}>Utilizar robôs, scrapers, crawlers ou quaisquer meios automatizados para acessar, extrair ou manipular dados da Plataforma de forma não autorizada;</li>
            <li className={listItem}>Interferir no funcionamento normal da Plataforma, incluindo ataques de negação de serviço (DoS/DDoS) ou a introdução de malware, vírus ou código malicioso;</li>
            <li className={listItem}>Compartilhar credenciais de acesso com terceiros não autorizados;</li>
            <li className={listItem}>Sublicenciar, revender ou redistribuir o acesso à Plataforma sem autorização expressa e por escrito da CONTRATADA;</li>
            <li className={listItem}>Utilizar a Plataforma para envio de comunicações em massa (spam) ou para finalidades não previstas nestes Termos.</li>
          </ul>
          <p className={paragraph}>
            <strong>11.2.</strong> A violação das vedações acima poderá ensejar a suspensão imediata do acesso ou a rescisão do contrato, sem prejuízo da apuração de responsabilidade civil e criminal do CONTRATANTE.
          </p>

          {/* 12. Propriedade Intelectual */}
          <h2 className={sectionTitle}>Cláusula 12ª — Propriedade Intelectual</h2>
          <p className={paragraph}>
            <strong>12.1.</strong> Todos os direitos de propriedade intelectual relativos à Plataforma Everest Retail — incluindo, sem limitação, código-fonte, interfaces, algoritmos, modelos de inteligência artificial, bases de dados, documentação técnica, marcas, logotipos, nomes comerciais e todo o conteúdo original — são e permanecerão de propriedade exclusiva da CONTRATADA.
          </p>
          <p className={paragraph}>
            <strong>12.2.</strong> O presente contrato não transfere ao CONTRATANTE qualquer direito de propriedade intelectual sobre a Plataforma, concedendo apenas uma licença limitada de uso conforme os termos aqui estabelecidos.
          </p>
          <p className={paragraph}>
            <strong>12.3.</strong> Os dados inseridos pelo CONTRATANTE na Plataforma permanecem de sua propriedade. A CONTRATADA não adquire qualquer direito de propriedade sobre os dados do CONTRATANTE, exceto a licença necessária para a prestação dos serviços contratados.
          </p>
          <p className={paragraph}>
            <strong>12.4.</strong> A CONTRATADA poderá utilizar dados anonimizados e agregados para fins estatísticos, de benchmarking, aprimoramento dos modelos de inteligência artificial e desenvolvimento de novas funcionalidades, sem identificação individual do CONTRATANTE.
          </p>

          {/* 13. Confidencialidade */}
          <h2 className={sectionTitle}>Cláusula 13ª — Confidencialidade</h2>
          <p className={paragraph}>
            <strong>13.1.</strong> As partes comprometem-se a manter em sigilo e confidencialidade todas as informações de natureza técnica, comercial, financeira, estratégica ou operacional a que tenham acesso em razão da execução deste contrato.
          </p>
          <p className={paragraph}>
            <strong>13.2.</strong> A obrigação de confidencialidade abrange, mas não se limita a: dados comerciais, relatórios analíticos, indicadores de desempenho, informações de clientes e consumidores, estratégias de negócio, algoritmos proprietários e quaisquer informações classificadas como confidenciais por qualquer das partes.
          </p>
          <p className={paragraph}>
            <strong>13.3.</strong> A obrigação de confidencialidade não se aplica a informações que: (i) sejam ou se tornem públicas sem culpa da parte receptora; (ii) estejam legalmente em posse da parte receptora antes da divulgação; (iii) sejam exigidas por ordem judicial ou determinação legal.
          </p>
          <p className={paragraph}>
            <strong>13.4.</strong> A obrigação de confidencialidade permanecerá vigente por 5 (cinco) anos após o término do contrato.
          </p>

          {/* 14. LGPD e Proteção de Dados */}
          <h2 className={sectionTitle}>Cláusula 14ª — LGPD e Proteção de Dados Pessoais</h2>
          <p className={paragraph}>
            <strong>14.1.</strong> As partes se comprometem a cumprir integralmente as disposições da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD) e demais normas aplicáveis à proteção de dados pessoais.
          </p>
          <p className={paragraph}>
            <strong>14.2.</strong> Para os fins desta relação contratual, a CONTRATADA atua na qualidade de <strong>Operadora de dados</strong> quando trata dados pessoais fornecidos pelo CONTRATANTE (Controlador), seguindo suas instruções legítimas e documentadas, exclusivamente para a prestação dos serviços contratados.
          </p>
          <p className={paragraph}>
            <strong>14.3.</strong> A CONTRATADA adotará medidas técnicas e organizacionais adequadas para garantir a segurança dos dados pessoais, incluindo criptografia, controle de acesso, anonimização e pseudonimização, conforme detalhado na Política de Privacidade.
          </p>
          <p className={paragraph}>
            <strong>14.4.</strong> O CONTRATANTE é responsável por garantir que a coleta de dados pessoais de seus consumidores e usuários finais esteja amparada por base legal válida nos termos da LGPD, incluindo, quando necessário, a obtenção de consentimento específico e informado.
          </p>
          <p className={paragraph}>
            <strong>14.5.</strong> Em caso de incidente de segurança envolvendo dados pessoais, a CONTRATADA comunicará o CONTRATANTE em até 48 (quarenta e oito) horas úteis, fornecendo as informações necessárias para que este cumpra suas obrigações perante a ANPD e os titulares afetados.
          </p>
          <p className={paragraph}>
            <strong>14.6.</strong> O tratamento integral dos dados pessoais pela Plataforma está descrito na <strong>Política de Privacidade</strong>, disponível em <a href="/privacidade" className="text-blue-600 hover:underline">www.everestretail.com.br/privacidade</a>, parte integrante destes Termos de Uso.
          </p>

          {/* 15. Compliance e Legislação */}
          <h2 className={sectionTitle}>Cláusula 15ª — Compliance e Legislação Aplicável</h2>
          <p className={paragraph}>
            <strong>15.1.</strong> As partes declaram e garantem que conduzem suas atividades em conformidade com a legislação aplicável, incluindo, mas não se limitando a:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}>Lei Geral de Proteção de Dados (Lei nº 13.709/2018);</li>
            <li className={listItem}>Marco Civil da Internet (Lei nº 12.965/2014);</li>
            <li className={listItem}>Código de Defesa do Consumidor (Lei nº 8.078/1990);</li>
            <li className={listItem}>Lei Anticorrupção (Lei nº 12.846/2013);</li>
            <li className={listItem}>Código Civil Brasileiro (Lei nº 10.406/2002);</li>
            <li className={listItem}>Demais normas tributárias, trabalhistas e regulatórias aplicáveis.</li>
          </ul>
          <p className={paragraph}>
            <strong>15.2.</strong> As partes comprometem-se a não praticar, tolerar ou viabilizar atos de corrupção, suborno, lavagem de dinheiro ou qualquer prática vedada pela legislação anticorrupção vigente.
          </p>

          {/* 16. Limitação de Responsabilidade */}
          <h2 className={sectionTitle}>Cláusula 16ª — Limitação de Responsabilidade</h2>
          <p className={paragraph}>
            <strong>16.1.</strong> A responsabilidade total e cumulativa da CONTRATADA perante o CONTRATANTE, por qualquer causa ou fundamento, será limitada ao valor total pago pelo CONTRATANTE nos 12 (doze) meses imediatamente anteriores ao evento que deu origem à reclamação.
          </p>
          <p className={paragraph}>
            <strong>16.2.</strong> Em nenhuma hipótese a CONTRATADA será responsável por danos indiretos, incidentais, consequenciais, punitivos, lucros cessantes, perda de receita, perda de dados (exceto por negligência comprovada) ou interrupção de negócios.
          </p>
          <p className={paragraph}>
            <strong>16.3.</strong> A CONTRATADA não se responsabiliza por: (i) falhas decorrentes de serviços de terceiros (provedores de internet, gateways de pagamento, APIs externas); (ii) uso indevido da Plataforma pelo CONTRATANTE; (iii) conteúdo inserido pelo CONTRATANTE na Plataforma; (iv) eventos de força maior ou caso fortuito.
          </p>

          {/* 17. Notificações */}
          <h2 className={sectionTitle}>Cláusula 17ª — Notificações</h2>
          <p className={paragraph}>
            <strong>17.1.</strong> Todas as comunicações e notificações entre as partes deverão ser realizadas por escrito, preferencialmente por meio eletrônico (e-mail), sendo consideradas recebidas:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className={listItem}><strong>Para o CONTRATANTE:</strong> no e-mail cadastrado na Plataforma;</li>
            <li className={listItem}><strong>Para a CONTRATADA:</strong> no endereço eletrônico <a href="mailto:suporte@everestretail.com.br" className="text-blue-600 hover:underline">suporte@everestretail.com.br</a>.</li>
          </ul>
          <p className={paragraph}>
            <strong>17.2.</strong> Notificações enviadas por e-mail serão consideradas recebidas na data de envio, salvo comprovação de falha técnica no envio.
          </p>
          <p className={paragraph}>
            <strong>17.3.</strong> É responsabilidade do CONTRATANTE manter seu endereço de e-mail cadastrado atualizado. A CONTRATADA não se responsabiliza por comunicações não recebidas em decorrência de dados cadastrais desatualizados.
          </p>

          {/* 18. Foro e Legislação */}
          <h2 className={sectionTitle}>Cláusula 18ª — Foro e Legislação Aplicável</h2>
          <p className={paragraph}>
            <strong>18.1.</strong> O presente contrato é regido pelas leis da República Federativa do Brasil.
          </p>
          <p className={paragraph}>
            <strong>18.2.</strong> As partes elegem o foro da Comarca de <strong>Brasília, Distrito Federal</strong>, com exclusão de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer questões ou litígios decorrentes deste contrato.
          </p>
          <p className={paragraph}>
            <strong>18.3.</strong> Antes de submeter qualquer disputa ao Poder Judiciário, as partes envidarão esforços para resolvê-la de forma amigável, por meio de negociação direta, no prazo de 30 (trinta) dias a contar da notificação da parte interessada.
          </p>

          {/* 19. Disposições Finais */}
          <h2 className={sectionTitle}>Cláusula 19ª — Disposições Finais</h2>
          <p className={paragraph}>
            <strong>19.1.</strong> Os presentes Termos de Uso, em conjunto com a Política de Privacidade e eventuais propostas comerciais específicas, representam o acordo integral entre as partes, substituindo quaisquer entendimentos ou negociações anteriores, verbais ou escritos.
          </p>
          <p className={paragraph}>
            <strong>19.2.</strong> A eventual invalidade ou inexequibilidade de qualquer disposição destes Termos não afetará a validade das disposições remanescentes, que permanecerão em pleno vigor e efeito.
          </p>
          <p className={paragraph}>
            <strong>19.3.</strong> A tolerância de qualquer das partes quanto ao descumprimento de qualquer obrigação pela outra não constituirá novação, renúncia ou precedente, nem prejudicará o direito de exigir o cumprimento da obrigação a qualquer tempo.
          </p>
          <p className={paragraph}>
            <strong>19.4.</strong> A CONTRATADA reserva-se o direito de modificar estes Termos de Uso a qualquer momento, mediante publicação da versão atualizada na Plataforma e comunicação ao CONTRATANTE por e-mail. A continuação do uso da Plataforma após a publicação das alterações será considerada como aceite das novas condições.
          </p>
          <p className={paragraph}>
            <strong>19.5.</strong> Nenhuma disposição destes Termos cria ou será interpretada como estabelecendo qualquer relação de sociedade, parceria, emprego, mandato ou agência entre as partes.
          </p>

          {/* Bloco de Contato */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mt-8 mb-6">
            <p className="text-[13px] font-bold text-[#0B1220] mb-3 uppercase tracking-tight">Dados do Contratado</p>
            <div className="space-y-2">
              <p className="text-[13px] text-slate-700"><strong>Razão Social:</strong> EMPRESAS NO TOPO LTDA</p>
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
              Este documento constitui instrumento vinculante entre as partes e integra os documentos contratuais da plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
