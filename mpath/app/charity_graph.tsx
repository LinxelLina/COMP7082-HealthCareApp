import { supabase } from "@/utils/supabase";
import { useEffect, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";
import { JSX } from "react/jsx-runtime";

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

export default function charity_description(){
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
            setCharityList(prev => {
                const isSame =
                    prev.length === mappedData.length &&
                    prev.every((item, i) => item.name === mappedData[i].name && item.value === mappedData[i].value);
                return isSame ? prev : mappedData;
            });
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
       <SafeAreaView style={{flex:1}}>
        <View style={{flex:1}}>
            <BarChart
                barWidth={22}
                noOfSections={3}
                barBorderRadius={4}
                frontColor="lightgray"
                data={barData}
                yAxisThickness={0}
                xAxisThickness={0}
                onPress={(dataPoint:any)=>{
                        Alert.alert("Current Total", `${dataPoint.value} for ${dataPoint.label}`);
                    }
                }
            />

        </View>
        </SafeAreaView>
    )
}