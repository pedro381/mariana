/**
 * Banco de itens — IPIP-NEO-120 (Johnson, 2014), versão em português do Brasil.
 *
 * Origem dos dados: projeto `ipip-neo-120` (MIT, Copyright (c) 2017 Geir Gåsodden),
 * arquivo `data/pt-br/questions.json`. Os identificadores (`id`), o domínio,
 * a faceta e a direção (`keyed`) foram preservados exatamente como na fonte.
 *
 * Os textos em português passaram por revisão editorial nesta implementação:
 * itens com tradução incorreta na fonte foram corrigidos com base no texto
 * original em inglês (itens 47, 60 e 109), e alguns enunciados foram ajustados
 * para linguagem mais natural e não clínica. Ver README.md, seção
 * "Referências e fundamentação".
 *
 * Os itens do IPIP são de domínio público (International Personality Item Pool —
 * Oregon Research Institute). https://ipip.ori.org/
 *
 * Estrutura de cada item:
 *   id     — identificador estável (UUID da fonte). Nunca usar o texto como chave.
 *   num    — posição canônica no inventário (1..120).
 *   domain — O, C, E, A, N.
 *   facet  — 1..6 dentro do domínio.
 *   keyed  — 'plus' (item direto) ou 'minus' (item invertido).
 */

export const QUESTIONS = Object.freeze([
  { id: '43c98ce8-a07a-4dc2-80f6-c1b2a2485f06',  num:   1, text: 'Me preocupo com as coisas', domain: 'N', facet: 1, keyed: 'plus' },
  { id: 'd50a597f-632b-4f7b-89e6-6d85b50fd1c9',  num:   2, text: 'Faço amigos com facilidade', domain: 'E', facet: 1, keyed: 'plus' },
  { id: '888dd864-7449-4e96-8d5c-7a439603ea91',  num:   3, text: 'Tenho uma imaginação fértil', domain: 'O', facet: 1, keyed: 'plus' },
  { id: 'ce2fbbf8-7a97-4199-bda5-117e4ecdf3b6',  num:   4, text: 'Confio nos outros', domain: 'A', facet: 1, keyed: 'plus' },
  { id: 'c7f53c3c-2e77-432f-bb71-7470b67d3aa9',  num:   5, text: 'Concluo as tarefas com sucesso', domain: 'C', facet: 1, keyed: 'plus' },
  { id: '48ad12ce-470e-4339-90ac-ea8c43a0103e',  num:   6, text: 'Fico com raiva facilmente', domain: 'N', facet: 2, keyed: 'plus' },
  { id: '458f3957-2359-4077-ade1-34525d633063',  num:   7, text: 'Amo grandes festas', domain: 'E', facet: 2, keyed: 'plus' },
  { id: '58d571e5-d725-4cf8-a438-32c16ee28eb6',  num:   8, text: 'Acredito na importância da arte', domain: 'O', facet: 2, keyed: 'plus' },
  { id: '0cf79e27-e702-45c2-9471-04ac96b58e0e',  num:   9, text: 'Uso os outros para alcançar meus fins', domain: 'A', facet: 2, keyed: 'minus' },
  { id: 'cda1ca17-b599-4561-a6cd-ff9d36062d27',  num:  10, text: 'Gosto de organizar as coisas', domain: 'C', facet: 2, keyed: 'plus' },
  { id: '5e8550d7-b8ef-4905-950a-f81d735d39e2',  num:  11, text: 'Com frequência me sinto para baixo', domain: 'N', facet: 3, keyed: 'plus' },
  { id: '8af754f2-68e9-48f3-8c5d-2e6633d4472c',  num:  12, text: 'Assumo a liderança das coisas', domain: 'E', facet: 3, keyed: 'plus' },
  { id: '0727def6-3d18-4221-bf38-86b58f9f3eed',  num:  13, text: 'Experimento minhas emoções intensamente', domain: 'O', facet: 3, keyed: 'plus' },
  { id: 'ccf3a5c8-fb50-4bd4-8e7a-22af3d657279',  num:  14, text: 'Adoro ajudar aos outros', domain: 'A', facet: 3, keyed: 'plus' },
  { id: '73d84e5d-cbf5-47f0-b8cb-4d2159a52e32',  num:  15, text: 'Mantenho minhas promessas', domain: 'C', facet: 3, keyed: 'plus' },
  { id: 'b2d9ef74-73f5-4ea8-b00c-7aaca15937df',  num:  16, text: 'Tenho dificuldade de me aproximar dos outros', domain: 'N', facet: 4, keyed: 'plus' },
  { id: '48a761ef-438e-409b-ae59-ea2ce8f84414',  num:  17, text: 'Estou sempre ocupado(a)', domain: 'E', facet: 4, keyed: 'plus' },
  { id: 'cae55842-8957-4e3b-83b3-ceff98fb9dcf',  num:  18, text: 'Prefiro variedade à rotina', domain: 'O', facet: 4, keyed: 'plus' },
  { id: 'e2028ad3-b128-4f76-be57-398bfe2aff22',  num:  19, text: 'Amo uma boa briga', domain: 'A', facet: 4, keyed: 'minus' },
  { id: 'b7fc949b-02b6-4cb9-a3e2-dbb3d824b55f',  num:  20, text: 'Trabalho duro', domain: 'C', facet: 4, keyed: 'plus' },
  { id: '481efd08-c810-43b1-a952-f8ac9052f96b',  num:  21, text: 'Costumo exagerar quando me empolgo', domain: 'N', facet: 5, keyed: 'plus' },
  { id: '987efee2-899f-4a65-b9b5-1589ef0460d7',  num:  22, text: 'Busco sempre emoção (adrenalina)', domain: 'E', facet: 5, keyed: 'plus' },
  { id: 'e1e804c7-4a1d-498f-8610-f95147af9d1d',  num:  23, text: 'Gosto de ler textos desafiadores', domain: 'O', facet: 5, keyed: 'plus' },
  { id: '71029381-3908-4c68-91e1-e41fb45542a2',  num:  24, text: 'Acredito ser melhor que os outros', domain: 'A', facet: 5, keyed: 'minus' },
  { id: 'f6076eea-56ae-4b46-97f1-5f94a7676c96',  num:  25, text: 'Estou sempre preparado(a)', domain: 'C', facet: 5, keyed: 'plus' },
  { id: '2f519935-92e8-48ad-9746-4a0f8b38466a',  num:  26, text: 'Entro em pânico facilmente', domain: 'N', facet: 6, keyed: 'plus' },
  { id: '899c3f66-51d0-46ea-963a-6fc36d3b3cb9',  num:  27, text: 'Irradio alegria', domain: 'E', facet: 6, keyed: 'plus' },
  { id: '79186f48-e7fa-4df4-b74b-b0627ee244e1',  num:  28, text: 'Costumo votar em candidatos políticos liberais (progressistas)', domain: 'O', facet: 6, keyed: 'plus' },
  { id: 'fd50e1ca-d9e0-4037-a7a1-a191d4db2d96',  num:  29, text: 'Me solidarizo com quem está em situação de rua', domain: 'A', facet: 6, keyed: 'plus' },
  { id: 'bd9eec0a-b68b-472c-8803-7db29c308cdb',  num:  30, text: 'Mergulho de cabeça nas coisas sem pensar', domain: 'C', facet: 6, keyed: 'minus' },
  { id: '7f92ab2c-265c-4b84-8c74-09f9bb9d41a7',  num:  31, text: 'Temo o pior', domain: 'N', facet: 1, keyed: 'plus' },
  { id: 'af55f014-788c-4b6e-92c4-b2b59dc8a28d',  num:  32, text: 'Me sinto confortável no meio das pessoas', domain: 'E', facet: 1, keyed: 'plus' },
  { id: '08ff6dca-02a5-4aeb-aaa4-2ecf2526f143',  num:  33, text: 'Gosto de dar asas à imaginação', domain: 'O', facet: 1, keyed: 'plus' },
  { id: '6f66cdc0-9044-457b-b40d-501ecae15ee7',  num:  34, text: 'Acredito que os outros têm boas intenções', domain: 'A', facet: 1, keyed: 'plus' },
  { id: 'f110fc66-2e9e-413c-920b-19f05e63d7ac',  num:  35, text: 'Sou excelente no que eu faço', domain: 'C', facet: 1, keyed: 'plus' },
  { id: '7dab2a37-8635-4fc7-86b7-0abf13c183c9',  num:  36, text: 'Me irrito facilmente', domain: 'N', facet: 2, keyed: 'plus' },
  { id: '28ab59a0-e7cd-4fce-94e3-bba2ecc023b6',  num:  37, text: 'Converso com muitas pessoas diferentes em festas', domain: 'E', facet: 2, keyed: 'plus' },
  { id: 'b5919f2f-cded-4745-a9ce-c02703cee807',  num:  38, text: 'Vejo beleza em coisas que outros podem não notar', domain: 'O', facet: 2, keyed: 'plus' },
  { id: '5a5fa975-d024-4ac8-8845-2823f957c21b',  num:  39, text: 'Trapaceio para tirar vantagem', domain: 'A', facet: 2, keyed: 'minus' },
  { id: 'adf33f9f-45bd-43e3-af25-4c491176d97f',  num:  40, text: 'Costumo esquecer de guardar as coisas no lugar', domain: 'C', facet: 2, keyed: 'minus' },
  { id: 'f0a14e16-d726-47e9-a2c1-647fd3d7d52e',  num:  41, text: 'Não gosto de mim mesmo(a)', domain: 'N', facet: 3, keyed: 'plus' },
  { id: '0b38e3d3-c15c-454c-b034-f4eb7ae1580a',  num:  42, text: 'Tento liderar os outros', domain: 'E', facet: 3, keyed: 'plus' },
  { id: '5631b856-ff34-4f76-a0cd-edc7104c3bfa',  num:  43, text: 'Sinto as emoções dos outros', domain: 'O', facet: 3, keyed: 'plus' },
  { id: 'ada867af-4db1-4e3d-a604-2b695c1806e5',  num:  44, text: 'Me preocupo com os outros', domain: 'A', facet: 3, keyed: 'plus' },
  { id: 'c55e3958-00c4-4fc3-9118-47d8f31bfde1',  num:  45, text: 'Digo a verdade', domain: 'C', facet: 3, keyed: 'plus' },
  { id: 'acd8fadc-5399-4a67-b5ff-9d1ada049c01',  num:  46, text: 'Tenho medo de chamar a atenção', domain: 'N', facet: 4, keyed: 'plus' },
  { id: 'd07b6c67-0d02-4948-a997-bb84ac234cd8',  num:  47, text: 'Estou sempre em movimento', domain: 'E', facet: 4, keyed: 'plus' },
  { id: '33b81fd0-7e32-4cd8-a13a-d5f5f754f998',  num:  48, text: 'Prefiro me ater ao que já conheço', domain: 'O', facet: 4, keyed: 'minus' },
  { id: 'd9a9a180-29c9-4ec5-8621-2256d411def7',  num:  49, text: 'Grito com os outros', domain: 'A', facet: 4, keyed: 'minus' },
  { id: 'f12c3d9d-1d12-4aa6-ad2e-009cd0651cbb',  num:  50, text: 'Supero as expectativas', domain: 'C', facet: 4, keyed: 'plus' },
  { id: '9891b7ba-a494-4307-aafe-301d8db506c6',  num:  51, text: 'Raramente me excedo', domain: 'N', facet: 5, keyed: 'minus' },
  { id: 'f1675af6-88bf-4376-a946-0281e762b39c',  num:  52, text: 'Busco aventura', domain: 'E', facet: 5, keyed: 'plus' },
  { id: '95a3f20c-f933-4d19-a2c1-a7dbdf63c562',  num:  53, text: 'Evito discussões filosóficas', domain: 'O', facet: 5, keyed: 'minus' },
  { id: '7df44711-4cd4-4b05-8830-73fcc3ebdab5',  num:  54, text: 'Tenho uma ótima impressão de mim mesmo(a)', domain: 'A', facet: 5, keyed: 'minus' },
  { id: '9d3cb5c7-955c-43a4-b6c7-b07ed01dcbd9',  num:  55, text: 'Transformo meus planos em realidade', domain: 'C', facet: 5, keyed: 'plus' },
  { id: '13c58810-3864-42ba-aa87-d4166f858756',  num:  56, text: 'Me sinto sobrecarregado(a) com os eventos', domain: 'N', facet: 6, keyed: 'plus' },
  { id: '961376e0-16a1-4c14-b059-789e63d11b63',  num:  57, text: 'Me divirto bastante', domain: 'E', facet: 6, keyed: 'plus' },
  { id: 'f08e1b27-3673-4898-9cae-896482d0d9f9',  num:  58, text: 'Acredito que certo e errado são relativos', domain: 'O', facet: 6, keyed: 'plus' },
  { id: 'c2038c12-7a37-47a8-9983-831bd6692aab',  num:  59, text: 'Sinto compaixão por quem está em situação pior que a minha', domain: 'A', facet: 6, keyed: 'plus' },
  { id: '956f3e17-ff17-4af5-a52f-9222b8968106',  num:  60, text: 'Tomo decisões precipitadas', domain: 'C', facet: 6, keyed: 'minus' },
  { id: '4d81238b-5407-47d4-88e5-dc0e38aa14f5',  num:  61, text: 'Tenho medo de muitas coisas', domain: 'N', facet: 1, keyed: 'plus' },
  { id: '9f9166f0-fa94-4c14-a91d-3eecd8395794',  num:  62, text: 'Evito contato com outras pessoas', domain: 'E', facet: 1, keyed: 'minus' },
  { id: '23a1034f-fab7-4887-a66e-5ef4eaafb25e',  num:  63, text: 'Gosto de ficar sonhando acordado(a)', domain: 'O', facet: 1, keyed: 'plus' },
  { id: 'c63e6121-c3ed-40cc-abc2-c1e6ea1e0858',  num:  64, text: 'Confio no que as pessoas dizem', domain: 'A', facet: 1, keyed: 'plus' },
  { id: '02ee1930-36a7-4caa-b10c-c93efb682a44',  num:  65, text: 'Executo as tarefas sem maiores problemas', domain: 'C', facet: 1, keyed: 'plus' },
  { id: 'da8e6ed1-2296-4c58-8fdb-66f2f591989b',  num:  66, text: 'Perco a paciência facilmente', domain: 'N', facet: 2, keyed: 'plus' },
  { id: '03c10b30-b88f-4c63-8acc-71251ca24615',  num:  67, text: 'Prefiro ficar sozinho(a)', domain: 'E', facet: 2, keyed: 'minus' },
  { id: '751a04bc-5adf-485a-8ea4-4308406ae85b',  num:  68, text: 'Não gosto de poesia', domain: 'O', facet: 2, keyed: 'minus' },
  { id: '982e83c2-d34e-48da-9c71-78494ab05c85',  num:  69, text: 'Tiro vantagem dos outros', domain: 'A', facet: 2, keyed: 'minus' },
  { id: 'f4891687-0ff0-47af-a4f6-d1202c8f6676',  num:  70, text: 'Deixo bagunça nos ambientes que uso', domain: 'C', facet: 2, keyed: 'minus' },
  { id: '743d8973-1de1-4485-91b4-8a5cf63e7d44',  num:  71, text: 'Frequentemente fico desanimado(a)', domain: 'N', facet: 3, keyed: 'plus' },
  { id: '2452f034-8273-4f71-9122-a40f5ead31ba',  num:  72, text: 'Assumo o controle das coisas', domain: 'E', facet: 3, keyed: 'plus' },
  { id: '2a300001-6e05-4c79-b8b5-2ccae4c3d463',  num:  73, text: 'Raramente percebo minhas reações emocionais', domain: 'O', facet: 3, keyed: 'minus' },
  { id: 'cd54bd76-ca9c-4030-b325-bb8d896bcb3f',  num:  74, text: 'Sou indiferente ao sentimento dos outros', domain: 'A', facet: 3, keyed: 'minus' },
  { id: '4e6e3a34-176f-4e6e-8730-1341611f972b',  num:  75, text: 'Descumpro regras', domain: 'C', facet: 3, keyed: 'minus' },
  { id: '20062533-a33d-4c1e-9cd9-bff868015b3f',  num:  76, text: 'Só me sinto bem com meus amigos(as)', domain: 'N', facet: 4, keyed: 'plus' },
  { id: 'b2a077d5-1fe0-4b06-ab63-35455e001e54',  num:  77, text: 'Faço muitas coisas no tempo livre', domain: 'E', facet: 4, keyed: 'plus' },
  { id: '0d2e65ab-95d9-482f-beb4-3239a3a4944a',  num:  78, text: 'Não gosto de mudanças', domain: 'O', facet: 4, keyed: 'minus' },
  { id: '0de0f900-cede-4538-9c00-5da4f830b028',  num:  79, text: 'Insulto os outros', domain: 'A', facet: 4, keyed: 'minus' },
  { id: 'a9c97d6b-6721-4150-8d84-64ef3082f164',  num:  80, text: 'Faço apenas o mínimo necessário no trabalho', domain: 'C', facet: 4, keyed: 'minus' },
  { id: '9f2e7f90-0ca5-4ed0-9fe5-e060238a9b5e',  num:  81, text: 'Resisto facilmente às tentações', domain: 'N', facet: 5, keyed: 'minus' },
  { id: '7dd6cf2d-5c14-48c2-8ae5-633a7a596c71',  num:  82, text: 'Gosto de ser inconsequente', domain: 'E', facet: 5, keyed: 'plus' },
  { id: 'fecc35f7-681e-4889-a404-4a973a3dfef0',  num:  83, text: 'Tenho dificuldade em entender ideias abstratas', domain: 'O', facet: 5, keyed: 'minus' },
  { id: '1d686958-6fe7-432f-85e6-186b99e4e232',  num:  84, text: 'Tenho uma opinião muito positiva sobre mim mesmo(a)', domain: 'A', facet: 5, keyed: 'minus' },
  { id: 'c7db0ed8-df7d-49bf-942f-59e46ef743c4',  num:  85, text: 'Desperdiço meu tempo', domain: 'C', facet: 5, keyed: 'minus' },
  { id: 'b7e0e393-9b21-4e0d-adf3-8f28fb5b9d87',  num:  86, text: 'Sinto que sou incapaz de lidar com as coisas', domain: 'N', facet: 6, keyed: 'plus' },
  { id: '79d956e8-1118-402a-a0e2-9380af18243e',  num:  87, text: 'Amo a vida', domain: 'E', facet: 6, keyed: 'plus' },
  { id: '96ba77b2-1a44-4dfd-95f9-ae4d1f714460',  num:  88, text: 'Costumo votar em candidatos políticos conservadores', domain: 'O', facet: 6, keyed: 'minus' },
  { id: '77f54ab4-0fba-4efb-8700-066c7490eb87',  num:  89, text: 'Não me interesso pelos problemas dos outros', domain: 'A', facet: 6, keyed: 'minus' },
  { id: 'a354cf7c-8d11-46ac-acc5-da90d2048637',  num:  90, text: 'Me apresso nas coisas', domain: 'C', facet: 6, keyed: 'minus' },
  { id: '43b03992-3f32-4ed1-a6f8-5d6d3e7ed246',  num:  91, text: 'Me estresso facilmente', domain: 'N', facet: 1, keyed: 'plus' },
  { id: '41702602-08e4-4e2b-9a19-291d9efc581a',  num:  92, text: 'Mantenho distância dos outros', domain: 'E', facet: 1, keyed: 'minus' },
  { id: '935a7413-abac-4f54-9169-d1fbd39da752',  num:  93, text: 'Gosto de me perder em pensamentos', domain: 'O', facet: 1, keyed: 'plus' },
  { id: '432dbde8-8756-4ff0-80d5-f47018235139',  num:  94, text: 'Desconfio das pessoas', domain: 'A', facet: 1, keyed: 'minus' },
  { id: '5727c93f-317b-4af1-a686-77fc9fbc5033',  num:  95, text: 'Sei como fazer as coisas', domain: 'C', facet: 1, keyed: 'plus' },
  { id: 'd32bd062-4eb2-401b-99b2-e7afea39ca9b',  num:  96, text: 'Não me incomodo facilmente', domain: 'N', facet: 2, keyed: 'minus' },
  { id: '9a47184f-6046-4e68-a61b-3d9b357b86ea',  num:  97, text: 'Evito multidões', domain: 'E', facet: 2, keyed: 'minus' },
  { id: '87c5b27e-59a8-4c48-8ba8-f5413d735693',  num:  98, text: 'Não gosto de ir a museus de arte', domain: 'O', facet: 2, keyed: 'minus' },
  { id: '11b20adb-abed-4363-894c-3dd823ae0540',  num:  99, text: 'Atrapalho os planos dos outros', domain: 'A', facet: 2, keyed: 'minus' },
  { id: '50418d86-712c-45d9-adc4-ea0231c93cf5',  num: 100, text: 'Deixo minhas coisas espalhadas', domain: 'C', facet: 2, keyed: 'minus' },
  { id: 'f40e421f-6c24-4be2-bd9f-28d33358d8c6',  num: 101, text: 'Me sinto confortável comigo mesmo(a)', domain: 'N', facet: 3, keyed: 'minus' },
  { id: '8791f37b-686f-47c3-9db7-74c009951321',  num: 102, text: 'Espero que os outros tomem a iniciativa', domain: 'E', facet: 3, keyed: 'minus' },
  { id: '4fd25155-9cc2-4cd6-8852-3e0ca2d5e95d',  num: 103, text: 'Não entendo pessoas que agem emotivamente', domain: 'O', facet: 3, keyed: 'minus' },
  { id: 'b68af20d-24f9-4c27-85cc-fe0858994888',  num: 104, text: 'Não reservo tempo para os outros', domain: 'A', facet: 3, keyed: 'minus' },
  { id: '54423933-0ebb-44a7-bdd9-2a9b100c70f2',  num: 105, text: 'Não cumpro minhas promessas', domain: 'C', facet: 3, keyed: 'minus' },
  { id: '7317848c-3e1b-422f-bb16-02efc504f677',  num: 106, text: 'Não me incomodo com situações sociais difíceis', domain: 'N', facet: 4, keyed: 'minus' },
  { id: '7d93e1ca-46e8-4a30-9623-42a80c9b420c',  num: 107, text: 'Gosto de pegar leve', domain: 'E', facet: 4, keyed: 'minus' },
  { id: 'a7f43928-8982-4ed5-8656-7a80346fe979',  num: 108, text: 'Sou apegado(a) a costumes tradicionais', domain: 'O', facet: 4, keyed: 'minus' },
  { id: '17910a55-a64a-4ed0-8b46-293e2fa2fe03',  num: 109, text: 'Revido quando me sinto prejudicado(a)', domain: 'A', facet: 4, keyed: 'minus' },
  { id: '3890bb43-2695-4b8d-b289-ee10d11cc884',  num: 110, text: 'Dedico pouco tempo e esforço no meu trabalho', domain: 'C', facet: 4, keyed: 'minus' },
  { id: '49a85680-53aa-4208-86b5-dccc7a6f8e37',  num: 111, text: 'Controlo minhas vontades', domain: 'N', facet: 5, keyed: 'minus' },
  { id: '10f90fa9-649c-4631-ac4c-3dd3f751597d',  num: 112, text: 'Ajo de forma descontrolada', domain: 'E', facet: 5, keyed: 'plus' },
  { id: 'b86de003-c3c4-4cc8-9385-5ac8a0142c34',  num: 113, text: 'Não me interesso por discussões teóricas', domain: 'O', facet: 5, keyed: 'minus' },
  { id: '80c1d149-7050-481a-9953-aefb441642e7',  num: 114, text: 'Gosto de exibir minhas qualidades', domain: 'A', facet: 5, keyed: 'minus' },
  { id: '51403620-968c-42fa-a772-65ba5ad8396f',  num: 115, text: 'Tenho dificuldade para começar as tarefas', domain: 'C', facet: 5, keyed: 'minus' },
  { id: '88a3c2fe-3aa4-4f46-9322-da656332268a',  num: 116, text: 'Permaneço calmo(a) sob pressão', domain: 'N', facet: 6, keyed: 'minus' },
  { id: 'e7b31bdc-5f6b-40ec-ba91-f5919b0f170e',  num: 117, text: 'Vejo o lado bom da vida', domain: 'E', facet: 6, keyed: 'plus' },
  { id: '580b08d1-3c94-46e9-9d07-d6d80c698127',  num: 118, text: 'Acredito que precisamos ser rígidos com o crime', domain: 'O', facet: 6, keyed: 'minus' },
  { id: '48bee420-60c0-45cd-be43-3893dbc1969a',  num: 119, text: 'Evito pensar em quem passa necessidade', domain: 'A', facet: 6, keyed: 'minus' },
  { id: 'ea3327ea-3529-4be4-8e2d-2174731ae4d7',  num: 120, text: 'Ajo sem pensar', domain: 'C', facet: 6, keyed: 'minus' },
].map(Object.freeze));

export const TOTAL_QUESTIONS = QUESTIONS.length;

/** Índice id -> item, para leitura O(1) durante o scoring. */
export const QUESTIONS_BY_ID = Object.freeze(
  QUESTIONS.reduce((mapa, item) => {
    mapa[item.id] = item;
    return mapa;
  }, Object.create(null))
);

/** Ordem canônica dos identificadores (1..120). */
export const QUESTION_IDS = Object.freeze(QUESTIONS.map((q) => q.id));
