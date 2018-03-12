# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.db.models import Q
from bootcamp.authentication.models import Friendship

# Create your views here.
@login_required
def user_list(request):
	users = User.objects.select_related('logged_in_user')
	thisuser = request.user
	frnds = Friendship.objects.filter(Q(from_user=thisuser) | Q(to_user=thisuser))
	frndsonline = []
	for user in users:
		for item in frnds:
			if item.from_user == user and item.to_user == thisuser:
				frndsonline.append(user)
			elif item.from_user == thisuser and item.to_user == user:
				frndsonline.append(user)


	for user in frndsonline:
			print user.username
		   	user.status = 'Online' if hasattr(user, 'logged_in_user') else 'Offline'
		   	print user.status
	return render(request, 'liveuser/liveusers.html', {'users': frndsonline})
