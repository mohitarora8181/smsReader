package com.smsreader

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import android.telephony.SmsMessage
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

import android.database.Cursor
import android.net.Uri
import android.provider.Telephony
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

class SmsListenerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        registerSMSReceiver()
    }

    override fun getName(): String {
        return "SmsListenerModule"
    }

    private fun sendEvent(eventName: String, message: String) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, message)
    }

    private val processedMessages = mutableSetOf<String>()

    private fun registerSMSReceiver() {
        val smsReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                val extras = intent.extras
                if (extras != null) {
                    val pdus = extras.get("pdus") as Array<*>
                    for (pdu in pdus) {
                        val sms = SmsMessage.createFromPdu(pdu as ByteArray)
                        val messageBody = sms.messageBody
                        val senderPhoneNumber = sms.originatingAddress
                        val timestamp = sms.timestampMillis

                        val params = Arguments.createMap().apply {
                            putString("body", messageBody)
                            putString("sender", senderPhoneNumber)
                            putDouble("timestamp", timestamp.toDouble())
                        }
                        val messageKey = "$senderPhoneNumber:$messageBody"

                        if (processedMessages.contains(messageKey)) {
                            return 
                        }
                        processedMessages.add(messageKey)

                        val jsonString = params.toString()

                        sendEvent("onSMSReceived", jsonString)
                    }
                }
            }
        }

        val filter = IntentFilter("android.provider.Telephony.SMS_RECEIVED")
        reactContext.registerReceiver(smsReceiver, filter)
    }

    @ReactMethod
    fun startListeningToSMS() {
        registerSMSReceiver()
    }

    
    
    @ReactMethod
    fun fetchSmsMessages(promise: Promise) {
        try {
            val uri: Uri = Telephony.Sms.CONTENT_URI
            val cursor: Cursor? = reactContext.contentResolver.query(uri, null, null, null, null)

            if (cursor != null && cursor.moveToFirst()) {
                val messagesArray: WritableArray = Arguments.createArray()

                do {
                    val address: String = cursor.getString(cursor.getColumnIndex(Telephony.Sms.ADDRESS))
                    val body: String = cursor.getString(cursor.getColumnIndex(Telephony.Sms.BODY))
                    val timestamp: Long = cursor.getLong(cursor.getColumnIndex(Telephony.Sms.DATE))

                    val message: WritableMap = Arguments.createMap()
                    message.putString("sender", address)
                    message.putString("body", body)
                    message.putDouble("timestamp", timestamp.toDouble())

                    messagesArray.pushMap(message)
                } while (cursor.moveToNext())

                cursor.close()
                promise.resolve(messagesArray)
            } else {
                promise.reject("NO_MESSAGES", "No SMS messages found")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e)
        }
    }
}

