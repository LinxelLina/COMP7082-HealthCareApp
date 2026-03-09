import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { JSX } from "react/jsx-runtime";

export default function charity_description(){
    type Charity_Numbers = {
        name: string,
        value: number,
    }

    type MyBarDataPoint = {
        value: number;
        label: string;
        frontColor?: string;
        topLabelComponent?: () => JSX.Element;
    };
    const [charityList, setCharityList] = useState<Charity_Numbers[]>([]);

    useEffect(()=>{ 
        async function fetchCharityData() {
            const {data, error} = await supabase.from("charity").select("charity_name, contribution_total");
            if(error){
                console.error("Error fetching charity data:", error);
            } else {
                const mappedData = data?.map((charity: any) => ({
                    name: charity.charity_name,
                    value: charity.contribution_total,
                }));
                setCharityList(mappedData || []);
            }
        }
        fetchCharityData();
    },[])

    const barData: MyBarDataPoint[] = charityList.map(item =>({
        value: item.value,
        label: item.name,
        frontColor:'#177AD5'
    }));

    return(
        <>
       <View>
            <BarChart
                barWidth={22}
                noOfSections={3}
                barBorderRadius={4}
                frontColor="lightgray"
                data={barData}
                yAxisThickness={0}
                xAxisThickness={0}
                onPress={(dataPoint)=>{
                    Alert.alert("Current Total", `${dataPoint.value} for ${dataPoint.label}`);
                }
                }
            />
        </View>
        </>
    )
}