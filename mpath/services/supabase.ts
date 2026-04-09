import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { addDonation } from "./profile";
import { Charity, Charity_Numbers, CharityFormFields, CharityIdName } from "@/types/charity";

export async function updateCharityPoints(current_charity: string, contribution: number){
    const {error} = await supabase.rpc("increment_contribution_by_name", { 
        charity_name: current_charity,
        contribution: contribution  // ← change contribution here
    });
    if (error) {
        Alert.alert("Error", "There was an issue updating the charity points. Please try again.");
    }
    
    await addDonation(contribution); //local database
};

export async function fetchCharities(): Promise<Charity[]> {
    const { data, error } = await supabase
    .from("charity")
    .select("*");

    if (error) {
        console.error("Error fetching charities:", error);
        Alert.alert("Error", "Could not load charities. Please try again.");
    } 
    const mappedData = (data?? []).map((charity) => ({
        id: charity.id.toString(),
        name: charity.charity_name,
        category: charity.charity_type ?? "Other",
        description: charity.description,
        website: charity.website,
        contactEmail: charity.contact_email,
        funds: charity.contribution_total,
    }));
    
    return mappedData;
    
}

export async function fetchCharityData(): Promise<Charity_Numbers[]> {
    const {data, error} = await supabase
    .from("charity")
    .select("charity_name, contribution_total");

    if(error){
        console.error("Error fetching charity data:", error);
        throw new Error(error.message);
    }
    const mappedData = data?.map((charity: any) => ({
        name: charity.charity_name,
        value: charity.contribution_total,
    }));
    
    return mappedData;
}

export async function addNewCharity(form:CharityFormFields):Promise<boolean>{
    const {error} = await supabase.from("charity").insert([
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

    if(error){
        alert("Error submitting form: " + error.message);
        console.log("Error" + error.message);
        return false;
    }

    return true;
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