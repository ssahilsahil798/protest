import json
from channels import Group
from channels.auth import channel_session_user, channel_session_user_from_http

@channel_session_user_from_http
def ws_connect(message):
	print "reached consumer yeah"
	message.reply_channel.send({'text': json.dumps({'username': message.user.username,'is_logged_in': True})})
	Group('liveuser').add(message.reply_channel)

@channel_session_user
def ws_disconnect(message):
    Group('liveuser').discard(message.reply_channel)
    Group('liveuser').send({'text': json.dumps({'username': message.user.username,'is_logged_in': False})})
