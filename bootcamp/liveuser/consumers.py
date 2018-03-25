import json
from channels import Group
from channels.auth import channel_session_user, channel_session_user_from_http

@channel_session_user_from_http
def ws_connect(message):
	Group('liveuser').send({'text': json.dumps({'username': message.user.username,'is_logged_in': True, 'activity_type': "liveuser_noti"})})
	Group('liveuser').add(message.reply_channel)

@channel_session_user
def ws_disconnect(message):
	Group('liveuser').send({'text': json.dumps({'username': message.user.username,'is_logged_in': False, 'activity_type': "liveuser_noti"})})
	Group('liveuser').discard(message.reply_channel)