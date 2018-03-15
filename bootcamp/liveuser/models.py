# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.
from django.conf import settings
from django.utils.encoding import python_2_unicode_compatible
from django.contrib.auth import user_logged_in, user_logged_out
from django.contrib.auth.models import User

@python_2_unicode_compatible
class LoggedInUser(models.Model):
	user = models.OneToOneField(User, related_name='logged_in_user')

	class Meta:
		db_table = 'auth_logged'


	def __str__(self):
		return self.user.username



def on_user_login(sender, **kwargs):
    LoggedInUser.objects.get_or_create(user=kwargs.get('user'))




def on_user_logout(sender, **kwargs):
    LoggedInUser.objects.get(user=kwargs.get('user')).delete()
    print "reaching on_user_logout"
    loggeduser = LoggedInUser.objects.filter(user=kwargs.get('user'))

    print loggeduser


user_logged_in.connect(on_user_login, sender=User)
user_logged_out.connect(on_user_logout, sender=User)