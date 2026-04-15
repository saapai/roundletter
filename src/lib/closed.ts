import gambles from "@/data/gambles.json";
import accomps from "@/data/accomplishments.json";

export type Gamble = {
  date: string;
  counterparty: string;
  stake: string;
  claim: string;
  resolved: boolean;
  won: boolean | null;
  note?: string;
};

export type Accomplishment = {
  date: string;
  label: string;
  tag?: string;
};

export function getGambles(): Gamble[] {
  return (gambles as any).bets as Gamble[];
}

export function getAccomplishments(): Accomplishment[] {
  return ((accomps as any).entries as Accomplishment[])
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
}
