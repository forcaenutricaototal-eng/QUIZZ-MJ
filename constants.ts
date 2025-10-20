import { QuizQuestion, QuestionType } from './types';

export const QUIZ_DATA: QuizQuestion[] = [
  {
    id: 1,
    text: 'Quais são seus maiores desafios para emagrecer hoje? 🤔',
    type: QuestionType.Multiple,
    options: [
      { label: 'Efeito sanfona (emagreço e volto a engordar) ⚖️', value: 'sanfona' },
      { label: 'Ansiedade, fome emocional e compulsão 🤯', value: 'ansiedade_compulsao' },
      { label: 'Metabolismo lento (tireoide, menopausa) 🐢', value: 'metabolismo' },
      { label: 'Inchaço, retenção de líquidos e inflamação 💧', value: 'inchaco_inflamacao' },
      { label: 'Falta de consistência para seguir um plano ⏳', value: 'consistencia' },
      { label: 'Tenho lipedema', value: 'lipedema' },
    ],
    transitionMessage: 'Entendido. Esses são desafios comuns, mas acredite, existe um caminho natural para superá-los. Vamos continuar.',
     socialProof: {
      name: 'Ana Fátima',
      result: '– 64 kg',
      description: '“Mesmo com hipotireoidismo, Ana Fátima eliminou 64 kg com o Método Japonês.”',
    },
  },
  {
    id: 2,
    text: 'Qual é a sua faixa etária? 🎂',
    type: QuestionType.Single,
    options: [
        { label: '20 a 34 anos', value: '20-34' },
        { label: '35 a 44 anos', value: '35-44' },
        { label: '45 a 54 anos', value: '45-54' },
        { label: '55 a 64 anos', value: '55-64' },
        { label: '65 anos ou mais', value: '65+' },
    ],
  },
  {
    id: 3,
    text: 'Você já tentou alguma solução antes? 💊',
    type: QuestionType.Multiple,
    options: [
      { label: 'Medicamentos (ex: Ozempic, Monjaro)', value: 'medicamentos' },
      { label: 'Dietas restritivas (low-carb, jejum) 🥗', value: 'dietas' },
      { label: 'Exercícios intensos 🏋️‍♀️', value: 'exercicios' },
      { label: 'Cirurgias bariátricas 🏥', value: 'bariatrica' },
    ],
    conditionalMessages: {
      medicamentos: 'Entendo — muitas relatam resultados rápidos com remédio, mas sem estabilidade. Vamos ver o que seu corpo realmente precisa.',
    },
     socialProof: {
      name: 'Bruna Brito',
      result: '– 13 kg',
      description: '“Bruna tentava de tudo — exercícios e dieta — sem resultado. Com o Monjaro Japonês, venceu o lipedema e eliminou 13 kg.”',
    },
  },
  {
    id: 4,
    text: 'Qual seu objetivo principal? 🏆',
    type: QuestionType.Multiple,
    options: [
      { label: 'Eliminar gordura abdominal 🎯', value: 'gordura_abdominal' },
      { label: 'Controlar fome e compulsão alimentar 🧠', value: 'fome_compulsao' },
      { label: 'Desinflamar e reduzir retenção de líquidos (inclusive nas pernas) 💧', value: 'desinflamar_retencao' },
      { label: 'Manter os resultados com equilíbrio e leveza ✨', value: 'manter_resultados' },
    ],
    socialProof: {
      name: 'Laís Moreira',
      result: '– 22 kg',
      description: '“Se eu consegui, vc tbm consegue 😉”',
    },
  },
  {
    id: 5,
    text: 'Em que partes do seu corpo você deseja se concentrar?',
    type: QuestionType.Multiple,
    options: [
      { label: 'Pernas', value: 'pernas', image: 'https://placehold.co/200x200/ecfdf5/065f46?text=Pernas&font=montserrat' },
      { label: 'Barriga', value: 'barriga', image: 'https://placehold.co/200x200/ecfdf5/065f46?text=Barriga&font=montserrat' },
      { label: 'Braços', value: 'bracos', image: 'https://placehold.co/200x200/ecfdf5/065f46?text=Bra%C3%A7os&font=montserrat' },
    ],
  },
  {
    id: 6,
    text: 'O Monjaro farmacêutico trata o sintoma. O Monjaro Japonês trata a causa. Resultado real: saciedade natural, menos compulsão e menos inchaço. Está pronta para a mudança que realmente funciona?',
    type: QuestionType.Single,
    options: [
      { label: 'Sim, estou pronta para a mudança! ✅', value: 'sim_pronta' },
      { label: 'Quero saber mais sobre a causa 🤔', value: 'saber_mais' },
      { label: 'Ainda não tenho certeza 🤷‍♀️', value: 'nao_tenho_certeza' },
    ],
  },
];
