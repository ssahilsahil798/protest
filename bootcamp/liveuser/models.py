# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.
from django.conf import settings


class LoggedInUser(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='logged_in_user')
