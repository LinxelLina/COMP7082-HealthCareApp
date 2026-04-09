import { supabase } from "@/utils/supabase";
import { addDonation } from "./profile";
import { Charity, Charity_Numbers, CharityFormFields, CharityIdName } from "@/types/charity";
import { Alert } from "react-native";

export async function updateCharityPoints(current_charity: string, contribution: number){
    const {error} = await supabase.rpc("increment_contribution_by_name", { 
        charity_name: current_charity,
        contribution: contribution // ← change contribution here
    });

    if (error) {
        Alert.alert("Error", "There was an issue updating the charity points. Please try again.");
        throw new Error(error.message);
    }

    await addDonation(contribution); //local database
};

export async function updateCharityPoint(current_charity: string) {
    return updateCharityPoints(current_charity, 1);
}

export async function fetchCharities(): Promise<Charity[]> {
    try {
        const { data, error } = await supabase
        .from("charity")
        .select("*");

        if (error) {
            console.error("services/supabase.fetchCharities query failed:", error);
            throw new Error(error.message);
        }

        return (data ?? []).map((charity) => ({
            id: charity.id.toString(),
            name: charity.charity_name,
            category: charity.charity_type ?? "Other",
            description: charity.description,
            website: charity.website,
            contactEmail: charity.contact_email,
            funds: charity.contribution_total,
        }));
    } catch (error) {
        console.error("services/supabase.fetchCharities failed:", error);
        throw error;
    }
}

export async function fetchCharityData(): Promise<Charity_Numbers[]> {
    try {
        const { data, error } = await supabase
        .from("charity")
        .select("charity_name, contribution_total");

        if (error) {
            console.error("services/supabase.fetchCharityData query failed:", error);
            throw new Error(error.message);
        }

        return (data ?? []).map((charity: any) => ({
            name: charity.charity_name,
            value: charity.contribution_total,
        }));
    } catch (error) {
        console.error("services/supabase.fetchCharityData failed:", error);
        throw error;
    }
}

export async function addNewCharity(form:CharityFormFields):Promise<boolean>{
    try {
        const { error } = await supabase.from("charity").insert([
            {
                created_at: new Date().toISOString(),
                charity_name: form.name,
                charity_type: form.type,
                description: form.description,
                website: form.website,
                contact_email: form.contactEmail,
                contribution_total: 0,
            }
        ]);

        if (error) {
            console.error("services/supabase.addNewCharity insert failed:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("services/supabase.addNewCharity failed:", error);
        return false;
    }
}

export async function getCharityIdName(): Promise<CharityIdName[]>{
    const {data, error} = await supabase
        .from("charity")
        .select('id, charity_name');

        if (error) {
          throw new Error(error.message);
        }

        return data ?? [];
}
