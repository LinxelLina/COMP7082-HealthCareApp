import { JSX } from "react/jsx-runtime";

export type Charity_Category = "Education" | "Environment" | "Animal_Welfare" | "Disaster_Relief" | "Medical" |"Other";

export type Charity = {
    id: string;
    name: string;
    description: string;
    category: Charity_Category;
    website: string;
    contactEmail: string;
    funds: number;
};

export const CHARITYCATEGORYNAMES: Record<Charity_Category, string> = {
    Education: "Education",
    Environment: "Environment",
    Animal_Welfare: "Animal Welfare",
    Disaster_Relief: "Disaster Relief",
    Medical: "Medical",
    Other: "Other"
}

export type Charity_Numbers = {
    name: string,
    value: number,
}

export type CharityBarDataPoint = {
        value: number;
        label: string;
        frontColor?: string;
        topLabelComponent?: () => JSX.Element;
};

export type CharityFormFields = {
    name: string;
    type: string;
    description: string;
    website: string;
    contactEmail: string;
}