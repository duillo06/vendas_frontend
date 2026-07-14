import { useCallback, useMemo, useReducer } from "react";

import { getBlueprint, specToGroup } from "./blueprints";
import type {
  Question,
  WizardBasics,
  WizardComposition,
  WizardGroup,
  WizardImage,
  WizardOptionInput,
} from "./types";

export type WizardScreen =
  | { kind: "basics" }
  | { kind: "segment" }
  | { kind: "question"; questionId: string }
  | { kind: "options"; groupKey: string }
  | { kind: "price" }
  | { kind: "review" };

// fase mostrada no stepper (agrupa várias telas)
export type WizardPhase = "basico" | "tipo" | "detalhes" | "preco" | "revisao";

type State = {
  basics: WizardBasics;
  images: WizardImage[];
  basePrice: number;
  segmentId: string | null;
  answers: Record<string, string>;
  optionsByGroup: Record<string, WizardOptionInput[]>;
  stepIndex: number;
};

type Action =
  | { type: "SET_BASICS"; patch: Partial<WizardBasics> }
  | { type: "ADD_IMAGES"; images: WizardImage[] }
  | { type: "REMOVE_IMAGE"; key: string }
  | { type: "SET_BASE_PRICE"; value: number }
  | { type: "SET_SEGMENT"; id: string }
  | { type: "SET_ANSWER"; questionId: string; choiceKey: string }
  | { type: "SET_GROUP_OPTIONS"; groupKey: string; options: WizardOptionInput[] }
  | { type: "GO"; index: number };

const initialState: State = {
  basics: { name: "", description: "", categoryId: "" },
  images: [],
  basePrice: 0,
  segmentId: null,
  answers: {},
  optionsByGroup: {},
  stepIndex: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_BASICS":
      return { ...state, basics: { ...state.basics, ...action.patch } };
    case "ADD_IMAGES":
      return { ...state, images: [...state.images, ...action.images] };
    case "REMOVE_IMAGE":
      return { ...state, images: state.images.filter((img) => img.key !== action.key) };
    case "SET_BASE_PRICE":
      return { ...state, basePrice: action.value };
    case "SET_SEGMENT":
      // trocar de segmento zera as respostas e opções já coletadas
      return { ...state, segmentId: action.id, answers: {}, optionsByGroup: {} };
    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.choiceKey },
      };
    case "SET_GROUP_OPTIONS":
      return {
        ...state,
        optionsByGroup: { ...state.optionsByGroup, [action.groupKey]: action.options },
      };
    case "GO":
      return { ...state, stepIndex: action.index };
    default:
      return state;
  }
}

// resolve as perguntas ativas seguindo os unlocks das respostas dadas
function resolveActiveQuestions(
  questions: Record<string, Question>,
  rootQuestions: string[],
  answers: Record<string, string>,
): Question[] {
  const active: string[] = [];
  const seen = new Set<string>();
  const queue = [...rootQuestions];

  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id) || !questions[id]) continue;
    seen.add(id);
    active.push(id);

    const chosenKey = answers[id];
    if (!chosenKey) continue;
    const choice = questions[id].choices.find((c) => c.key === chosenKey);
    choice?.unlocks?.forEach((next) => {
      if (!seen.has(next)) queue.push(next);
    });
  }

  return active.map((id) => questions[id]);
}

export function useProductWizard() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const blueprint = useMemo(() => getBlueprint(state.segmentId), [state.segmentId]);

  const activeQuestions = useMemo(() => {
    if (!blueprint) return [];
    return resolveActiveQuestions(blueprint.questions, blueprint.rootQuestions, state.answers);
  }, [blueprint, state.answers]);

  // grupos derivados das respostas, na ordem das perguntas
  const groups = useMemo<WizardGroup[]>(() => {
    const out: WizardGroup[] = [];
    for (const question of activeQuestions) {
      const chosenKey = state.answers[question.id];
      if (!chosenKey) continue;
      const choice = question.choices.find((c) => c.key === chosenKey);
      choice?.produces?.forEach((spec) => out.push(specToGroup(spec, question.id)));
    }
    return out;
  }, [activeQuestions, state.answers]);

  // composição ativada por alguma escolha (ex: pizza meio a meio)
  const composition = useMemo<WizardComposition | null>(() => {
    for (const question of activeQuestions) {
      const chosenKey = state.answers[question.id];
      if (!chosenKey) continue;
      const choice = question.choices.find((c) => c.key === chosenKey);
      if (choice?.composition) return choice.composition;
    }
    return null;
  }, [activeQuestions, state.answers]);

  // monta a sequência de telas dinamicamente
  const screens = useMemo<WizardScreen[]>(() => {
    const list: WizardScreen[] = [{ kind: "basics" }, { kind: "segment" }];
    activeQuestions.forEach((question) => list.push({ kind: "question", questionId: question.id }));
    groups.forEach((group) => list.push({ kind: "options", groupKey: group.key }));
    list.push({ kind: "price" }, { kind: "review" });
    return list;
  }, [activeQuestions, groups]);

  const safeIndex = Math.min(state.stepIndex, screens.length - 1);
  const currentScreen = screens[safeIndex];

  const phaseOf = useCallback((screen: WizardScreen): WizardPhase => {
    switch (screen.kind) {
      case "basics":
        return "basico";
      case "segment":
        return "tipo";
      case "question":
      case "options":
        return "detalhes";
      case "price":
        return "preco";
      case "review":
        return "revisao";
    }
  }, []);

  const groupByKey = useCallback(
    (key: string) => groups.find((group) => group.key === key),
    [groups],
  );

  // validação por tela pra liberar o "Continuar"
  const isCurrentValid = useMemo(() => {
    if (!currentScreen) return false;
    switch (currentScreen.kind) {
      case "basics":
        return state.basics.name.trim().length >= 2 && Boolean(state.basics.categoryId);
      case "segment":
        return Boolean(state.segmentId);
      case "question":
        return Boolean(state.answers[currentScreen.questionId]);
      case "options": {
        const group = groupByKey(currentScreen.groupKey);
        const opts = state.optionsByGroup[currentScreen.groupKey] ?? [];
        const filled = opts.filter((o) => o.name.trim());
        // grupo obrigatório precisa de pelo menos 1 opção
        if (group?.fields.is_required) return filled.length >= 1;
        return true;
      }
      case "price":
        return state.basePrice > 0;
      case "review":
        return true;
    }
  }, [currentScreen, state, groupByKey]);

  const goNext = useCallback(() => {
    dispatch({ type: "GO", index: Math.min(safeIndex + 1, screens.length - 1) });
  }, [safeIndex, screens.length]);

  const goBack = useCallback(() => {
    dispatch({ type: "GO", index: Math.max(safeIndex - 1, 0) });
  }, [safeIndex]);

  const goTo = useCallback((index: number) => dispatch({ type: "GO", index }), []);

  return {
    state,
    dispatch,
    blueprint,
    activeQuestions,
    groups,
    composition,
    groupByKey,
    screens,
    currentScreen,
    stepIndex: safeIndex,
    phaseOf,
    isCurrentValid,
    isLast: safeIndex === screens.length - 1,
    goNext,
    goBack,
    goTo,
  };
}

export type ProductWizard = ReturnType<typeof useProductWizard>;
