import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { SmsType } from './types/smsReciever'

const MessageItem = ({ item }: { item: SmsType }) => {
    const formattedTimestamp = new Date(item.timestamp).toLocaleTimeString();

    const showFullMessage = (message: SmsType) => {
        Alert.alert(message.sender,message.body)
    }

    const regex = '(\\$|€|£|₹)?\\s?\\d+(?:,\\d{3})*(?:\\.\\d{1,2})?'
    const amount = item.body.match(regex)

    return (
        <TouchableOpacity style={styles.container} onPress={()=>{showFullMessage(item)}}>
            <View style={styles.body}>
                <Text style={{ fontSize: 18, fontWeight: "semibold" }}>{item.sender}</Text>
                <Text style={{ paddingLeft: 5 }} numberOfLines={1} ellipsizeMode='tail'>{item.body}</Text>
            </View> 
            <View style={styles.timestamp}>
                <Text style={{color:"green",textAlign:"right"}}>{amount ? amount[0] : ""}</Text>
                <Text style={{ width: "100%", textAlign: "right"}}>{formattedTimestamp}</Text>
            </View>
        </TouchableOpacity>
    )
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        marginVertical: 5,
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 1,
        width: "100%",
        height: 100,
        flexDirection: "row",
        borderColor: "black",
        borderWidth: 0.2
    },
    body: {
        fontSize: 14,
        flex: 1,
        paddingLeft: 10,
        paddingTop: 10
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
        alignSelf: 'flex-end',
        flex: 1,
        justifyContent:"space-between",
        height:"100%"
    },
});

export default MessageItem