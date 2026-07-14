import type { BuilderFieldsState } from "@/features/catalog/components/OptionGroupBuilderFields";

// Aqui mora o "cérebro" do assistente. Tudo é dado declarativo:
// as perguntas e as respostas apontam para grupos do Product Engine.
// O engine em si não sabe o que é pizza — quem sabe é o blueprint.

// Um grupo que o assistente vai criar no engine a partir das respostas.
export type GroupSpec = {
  // chave estável dentro do blueprint (ex: "sabores"). Vira parte da key do grupo.
  key: string;
  name: string;
  emoji?: string;
  // pergunta mostrada na tela de "adicionar opções" desse grupo
  optionsPrompt: string;
  // explicação curta pra deixar claro o que listar aqui (evita confusão)
  optionsHelp?: string;
  // sugestões de nomes pra facilitar (chips clicáveis)
  suggestions?: string[];
  // config técnica traduzida pro engine (parcial; o resto vem do default)
  fields: Partial<BuilderFieldsState>;
};

// Config de composição que uma escolha pode ativar (ex: pizza meio a meio).
// O produto vira composto por outros produtos da mesma categoria — não vira grupo.
export type WizardComposition = {
  label: string;
  min_parts: number;
  max_parts: number;
  pricing_rule: "highest" | "average" | "main";
};

// Uma escolha dentro de uma pergunta.
export type Choice = {
  key: string;
  label: string;
  emoji?: string;
  description?: string;
  // grupos criados quando o usuário escolhe isto
  produces?: GroupSpec[];
  // ativa composição (produto formado por outros) em vez de grupo de opções
  composition?: WizardComposition;
  // perguntas que passam a aparecer quando isto é escolhido
  unlocks?: string[];
};

// Uma pergunta do assistente (sempre em formato de cartões).
export type Question = {
  id: string;
  title: string;
  subtitle?: string;
  emoji?: string;
  choices: Choice[];
};

// Um segmento (pizza, hambúrguer, ...). É o que aparece na Tela 2.
export type Blueprint = {
  id: string;
  emoji: string;
  label: string;
  tagline: string;
  // mensagem alto-astral ao entrar no segmento
  intro?: string;
  // perguntas mostradas de cara
  rootQuestions: string[];
  // todas as perguntas do segmento, por id
  questions: Record<string, Question>;
};

// ---- Estado de trabalho do assistente ----

// Grupo já materializado no estado (com fields completos), pronto pra virar API.
export type WizardGroup = {
  key: string;
  name: string;
  emoji?: string;
  optionsPrompt: string;
  optionsHelp?: string;
  suggestions: string[];
  fields: BuilderFieldsState;
};

export type WizardOptionInput = {
  key: string;
  name: string;
  price: number;
};

export type WizardImage = {
  key: string;
  file: File;
  previewUrl: string;
};

export type WizardBasics = {
  name: string;
  description: string;
  categoryId: string;
};
