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
      result: '– 30 kg',
      description: '“Bruna tentava de tudo — exercícios e dieta — sem resultado. Com o Monjaro Japonês, venceu o lipedema e eliminou 30 kg.”',
    },
  },
  {
    id: 4,
    text: 'Qual seu objetivo principal? 🏆',
    type: QuestionType.Multiple,
    options: [
      { label: 'Emagrecer com saúde e consistência ❤️', value: 'saude' },
      { label: 'Controlar fome e compulsão 🍽️', value: 'fome_compulsao' },
      { label: 'Desinflamar e reduzir retenção ✨', value: 'desinflamar' },
      { label: 'Manter o resultado com equilíbrio ⚖️', value: 'manter' },
    ],
    socialProof: {
      name: 'Laís Moreira',
      result: '– 22 kg',
      description: '“Se eu consegui, vc tbm consegue 😉”',
    },
  },
  {
    id: 5,
    text: 'O Monjaro de farmácia sacia, mas não regula. O Monjaro Japonês te dá o controle e a saciedade de forma natural. Você aceita conhecer esse caminho? 🍵',
    type: QuestionType.Single,
    options: [
      { label: 'Sim, quero ter o controle da minha saciedade! ✅', value: 'sim_controle' },
      { label: 'Quero entender melhor como funciona 🤔', value: 'entender_melhor' },
      { label: 'Ainda estou em dúvida 🤷‍♀️', value: 'duvida' },
    ],
    socialProof: {
      name: 'Márcia Rivera',
      result: '– 17 kg (58 anos)',
      description: '“Hipotireoidismo e menopausa: perdi 17 kg, desinchei e recuperei energia.”',
    },
  },
];