import json
from channels import Group
from channels.auth import channel_session_user, channel_session_user_from_http
from bootcamp.authentication.models import Friendship
from django.contrib.auth.models import User
from django.db.models import Q

@channel_session_user_from_http
def ws_connect(message):
	frnds_user = []
	frnds = Friendship.objects.filter(Q(from_user = message.user) | Q(to_user = message.user)).filter(accepted=True)
	for item in frnds:
		if item.from_user == message.user:
			frnds_user.append(item.to_user.username)
		elif item.to_user == message.user:
			frnds_user.append(item.from_user.username)

	print frnds_user
	Group('liveuser').send({'text': json.dumps({'username': message.user.username,'is_logged_in': True, 'activity_type': "liveuser_noti", 'friends':frnds_user,})})
	Group('liveuser').add(message.reply_channel)

@channel_session_user
def ws_disconnect(message):
	Group('liveuser').send({'text': json.dumps({'username': message.user.username,'is_logged_in': False, 'activity_type': "liveuser_noti"})})
	Group('liveuser').discard(message.reply_channel)