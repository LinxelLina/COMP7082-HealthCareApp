import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { addDonation } from "./profile";

export async function updateCharityPoint(current_charity: string){
    const {error} = await supabase.rpc("increment_contribution_by_name", { 
        charity_name: current_charity,
        contribution: 1  // ← change contribution here
    });
    if (error) {
        Alert.alert("Error", "There was an issue updating the charity points. Please try again.");
    }

    await addDonation(1); //local database
};