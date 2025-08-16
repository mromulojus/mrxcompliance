# Data Classification

The following table outlines the sensitivity classification for data stored in MRx Compliance.

| Table | Sensitivity | Notes |
| --- | --- | --- |
| profiles | High | Contains user personal information and roles |
| empresas | Medium | Organization metadata |
| colaboradores | High | Employee details |
| documentos_colaborador | High | Employee document images |
| historico_colaborador | High | Employment history |
| denuncias | High | Whistleblower reports |
| comentarios_denuncia | High | Comments on reports |
| activity_logs | Medium | General activity auditing |
| empresa_cobranca_config | Medium | Configuration data |
| devedores | High | Debtor personally identifiable information |
| dividas | High | Financial debt records |
| historico_cobrancas | Medium | Collection history |
| acordos | Medium | Settlement agreements |
| pagamentos | High | Payment details |
| documentos_divida | High | Debt document images |
| eventos | Low | System events |
| processos_judiciais | High | Legal case records |
| processos_historico | Medium | Case history |
| processos_documentos | High | Legal documents |
| processos_valores | High | Case financial values |
| etiquetas_templates | Low | Label templates |
| audit.access_logs | High | Audit trail of sensitive table access |

Sensitivities: **High** – restricted access, **Medium** – limited access, **Low** – general access.
