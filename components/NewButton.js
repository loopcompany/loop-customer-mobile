import { TouchableOpacity,Text } from "react-native";
export default function NewButton({navigation,title,print,page }){
    const nav= (page)=>{
        navigation.navigate(page)
    }
    return(
        <TouchableOpacity
        onPress={()=>{
            print()
            navigation.navigate(page)
        }}>
            <Text>
                {title}
            </Text>
        </TouchableOpacity>
    )
}