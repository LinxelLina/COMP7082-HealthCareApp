import { useEffect, useState } from "react";
import { Alert, View, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-gifted-charts";
import { Charity_Numbers, CharityBarDataPoint } from "@/types/charity";
import { fetchCharityData } from "@/services/supabase";

export default function CharityDescription(){
    const [charityList, setCharityList] = useState<Charity_Numbers[]>([]);


    useEffect(()=>{ 
        async function getCharityData() {
            try{
                const charityData = await fetchCharityData();
                setCharityList(prev => {
                    const isSame =
                        prev.length === charityData.length &&
                        prev.every((item, i) => item.name === charityData[i].name && item.value === charityData[i].value);
                    return isSame ? prev : charityData;
                });
            }catch (error){
                Alert.alert("Error","Could not load charity graph data. Please try again.")
            }
        }

        getCharityData();
    },[])

    const barData: CharityBarDataPoint[] = charityList.map(item =>({
        value: item.value,
        label: item.name,
        frontColor:'#177AD5'
    }));

    return(
       <SafeAreaView style={styles.container}>
        <View style={styles.content}>
            <BarChart
                adjustToWidth
                barWidth={22}
                noOfSections={3}
                barBorderRadius={4}
                frontColor="lightgray"
                data={barData}
                yAxisThickness={0}
                xAxisThickness={0}
                height={400}
                onPress={(dataPoint:CharityBarDataPoint)=>{
                        Alert.alert("Current Total", `${dataPoint.value} for ${dataPoint.label}`);
                    }
                }
            />

        </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    content:{
        flex:1,
    }
});