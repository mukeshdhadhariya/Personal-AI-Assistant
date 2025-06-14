# whatsapp_api.py
from flask import Flask, request, jsonify
import pywhatkit
import datetime

app = Flask(__name__)

contacts = {
    "neeraj": "+918770223682",
    "mukesh": "+919982650365",
    "gaurav": "+916378602627",
    "adi": "+918582045005",
    "ravi": "+919128596942",
    "ramesh":"+919660005196"
}

def WhatsApp(message):
    lower_message = message.lower().strip()
    
    if lower_message.startswith("ok neha send message to"):
        try:
            parts = lower_message.split("ok neha send message to")[1].strip()
            name, text = parts.split(" that ", 1)
            name = name.strip()
            text = text.strip()

            if name in contacts:
                now = datetime.datetime.now()
                hour = now.hour
                minute = now.minute + 1

                if minute >= 60:
                    minute -= 60
                    hour = (hour + 1) % 24

                print(f"🔹 Sending message to {name}: \"{text}\"")

                # pywhatkit.sendwhatmsg(contacts[name], text, hour, minute)
                pywhatkit.sendwhatmsg(
                    contacts[name], 
                    text, 
                    hour, 
                    minute,
                    wait_time=20,
                    tab_close=True,
                    close_time=3
                )

                return f'Sending "{text}" to {name} on WhatsApp.'

            else:
                return f"I don't have a number for {name}."
        except ValueError:
            return "Invalid message format. Use: 'ok neha send message to <name> that <message>'."
    
    return None

from flask import Flask, request, jsonify

@app.route("/send_message", methods=["POST"])
def send_message():
    data = request.json
    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' field"}), 400

    message = data["message"]
    result = WhatsApp(message)
    if result is None:
        return None

    return jsonify({"result": result})


if __name__ == "__main__":
    app.run(port=5001)
