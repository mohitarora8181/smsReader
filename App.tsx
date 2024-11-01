import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  PermissionsAndroid,
  DeviceEventEmitter,
  FlatList,
  NativeModules,
  TouchableOpacity
} from 'react-native';
import { SmsType } from './types/smsReciever';
import MessageItem from './MessageItem';
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

const { SmsListenerModule } = NativeModules;


const App = () => {
  const [receiveSmsPermission, setReceiveSmsPermission] = useState('');
  const [messageList, setMessageList] = useState<SmsType[]>([]);

  const requestSmsPermission = async () => {
    try {
      const permission = await PermissionsAndroid
        .request(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
      setReceiveSmsPermission(permission);

      const read_sms = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    requestSmsPermission();
    fetchMessages();
  }, []);


  const fetchMessages = async () => {
    try {
      const lastmessages = await SmsListenerModule.fetchSmsMessages();
      setMessageList(lastmessages)
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (receiveSmsPermission === PermissionsAndroid.RESULTS.GRANTED) {
      let subscriber = DeviceEventEmitter.addListener(
        'onSMSReceived',
        message => {
          const { body, sender, timestamp } = JSON.parse(message);
          setMessageList(prev => [{ body, sender, timestamp }, ...prev])
        },
      );

      return () => {
        subscriber.remove();
      };
    }
  }, [receiveSmsPermission]);

  const filterPaymentMessages = () => {
    const paymentKeywords = ["payment", "paid", "received", "amount", "₹", "$", "£", "€", "transaction", "debited", "credited", "balance", "invoice", "bill", "fee", "charge", "withdrawal", "deposit", "transfer", "confirmation", "acknowledgment", "statement", "receipt", "successful", "pending", "declined", "refunded", "authorization", "payment gateway", "credit card", "debit card", "bank account", "mobile wallet", "monthly subscription", "service fee", "payment reminder", "due date", "payment method", "e-wallet", "chargeback", "overdraft"];
    setMessageList(messageList.filter(message => paymentKeywords.some(keyword => message.body.toLowerCase().includes(keyword))))
  }

  const refreshList = () => {
    fetchMessages();
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "lightgray" }}>
      <View style={{ flex: 1, justifyContent: "center", padding: 15 }}>
        <Text style={{ fontSize: 20, alignSelf: "center", fontWeight: "bold", paddingVertical: 10 }}>
          Listening Your Messages in RealTime
        </Text>
        <View style={{ justifyContent: "space-between", padding: 10, height: 60, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => { refreshList() }} style={{ backgroundColor: "white", padding: 5, width: 40, height: 40, borderRadius: "100%" }}>
            <Icon name='refresh' size={30} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { filterPaymentMessages() }} style={{ padding: 10, backgroundColor: "white", borderRadius: 50, width: 250, alignSelf: "flex-end" }}>
            <Text style={{ textAlign: "center" }}>Show Payment Messages only</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, padding: 10 }}>
          <FlatList
            data={messageList}
            renderItem={({ item }: { item: SmsType }) => {
              return <MessageItem item={item} />
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
export default App;